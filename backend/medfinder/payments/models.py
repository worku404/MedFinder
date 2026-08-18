from django.conf import settings
from django.db import models

from inventory.models import Inventory
from pharmacies.models import Pharmacy


class PharmacyPayoutAccount(models.Model):
    """
    Stores the Chapa *subaccount* linked to a pharmacy's bank account.

    Chapa Model A (split payment): the subaccount is created ONCE from the
    pharmacy's bank details (bank_code, account_number, account_name). Chapa
    returns a `subaccount_id` which we persist here. On every checkout we pass
    this id in the `subaccounts` split block, and Chapa automatically routes the
    pharmacy's share to their bank account while our platform keeps its
    commission. We never custody or move the funds ourselves.
    """

    pharmacy = models.OneToOneField(
        Pharmacy, on_delete=models.CASCADE, related_name="payout_account"
    )

    # Chapa subaccount reference (source of truth for the split target).
    chapa_subaccount_id = models.CharField(max_length=100, unique=True)

    # Local copy of the bank details used to create the subaccount (for audit /
    # re-creation). Chapa itself is the authority once the subaccount exists.
    bank_code = models.CharField(max_length=20)
    account_number = models.CharField(max_length=50)
    account_name = models.CharField(max_length=200)

    # Platform commission taken from each transaction, as a percentage the
    # PLATFORM keeps (Chapa `split_type=percentage`, `split_value` = this / 100).
    commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        help_text="Percentage of each sale the platform retains (0-100).",
    )

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payout[{self.pharmacy.name}] -> {self.chapa_subaccount_id}"


class Payment(models.Model):
    """
    A single medicine-reservation payment made by a patient for a stock entry
    at a specific pharmacy, settled through Chapa split payment.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payments"
    )
    pharmacy = models.ForeignKey(
        Pharmacy, on_delete=models.PROTECT, related_name="payments"
    )
    inventory = models.ForeignKey(
        Inventory, on_delete=models.PROTECT, related_name="payments"
    )

    quantity = models.PositiveIntegerField(default=1)

    # tx_ref is our idempotency key and the reference we send to Chapa.
    tx_ref = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="ETB")

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    chapa_ref_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["patient", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.tx_ref} ({self.status}) - {self.amount} {self.currency}"
