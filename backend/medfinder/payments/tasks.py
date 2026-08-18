import logging

from celery import shared_task
from django.db import transaction

from notifications.dispatch import notify
from . import chapa
from .models import Payment

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def process_payment_webhook(self, event_data):
    """
    Handle a verified Chapa webhook payload asynchronously.

    Security/robustness:
      * The HTTP view already verified the HMAC signature before enqueueing.
      * We NEVER trust the webhook body for the final state: we re-query Chapa
        via verify_transaction() before granting value.
      * Idempotent: a payment already marked SUCCESS is a no-op, so duplicate
        webhook deliveries are safe.
    """
    if event_data.get("event") != "charge.success":
        return

    tx_ref = event_data.get("tx_ref")
    if not tx_ref:
        return

    try:
        payment = Payment.objects.select_related(
            "inventory", "pharmacy", "patient"
        ).get(tx_ref=tx_ref)
    except Payment.DoesNotExist:
        logger.error("Payment record not found for tx_ref: %s", tx_ref)
        return

    if payment.status == Payment.Status.SUCCESS:
        return  # idempotent

    # Authoritative server-side confirmation.
    try:
        verified = chapa.verify_transaction(tx_ref)
    except Exception as exc:
        logger.exception("Chapa verify failed for %s", tx_ref)
        raise self.retry(exc=exc)

    data = verified.get("data") or {}
    if data.get("status") != "success":
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        return

    with transaction.atomic():
        payment.status = Payment.Status.SUCCESS
        payment.chapa_ref_id = data.get("reference", "") or event_data.get("reference", "")
        payment.save(update_fields=["status", "chapa_ref_id", "updated_at"])

        # Reserve/decrement stock for the purchased quantity. Guard against
        # oversell with a bounded update.
        inv = payment.inventory
        if inv.quantity_available >= payment.quantity:
            inv.quantity_available -= payment.quantity
            inv.save(update_fields=["quantity_available"])

        logger.info(
            "Payment %s succeeded: patient %s reserved %s x %s @ %s",
            tx_ref, payment.patient_id, payment.quantity,
            inv.medicine_id, payment.pharmacy_id,
        )

    # Real-time + email notifications via the central dispatch engine.
    notify(
        recipient=payment.patient,
        title="Payment confirmed",
        body=f"Your reservation at {payment.pharmacy.name} is confirmed.",
        target_url=f"/payments/{tx_ref}",
        send_email=True,
    )
    if payment.pharmacy.owner_id and payment.pharmacy.owner_id != payment.patient_id:
        notify(
            recipient=payment.pharmacy.owner,
            title="New paid reservation",
            body=f"{payment.patient.username or payment.patient.email} reserved a medicine.",
            target_url="/pharmacy/orders",
        )
