from __future__ import annotations
import secrets
from datetime import timedelta
from django.utils import timezone


from django.core.exceptions import ValidationError
from django.db import transaction

from notifications.dispatch import notify
from .models import Pharmacy, PharmacyInvite, PharmacyStaff
from notifications.tasks import send_notification_email_task


def update_pharmacy_staff_status(
    *, pharmacy: Pharmacy, staff_id: int, reviewer, new_status: PharmacyStaff.Status
) -> PharmacyStaff:
    """
    Updates a staff member's status (Approved/Rejected) and dispatches real-time
    WebSocket and email notifications.
    """
    staff = pharmacy.staff_memberships.select_related("pharmacist", "pharmacy").get(id=staff_id)
    staff.status = new_status
    staff.reviewed_by = reviewer
    staff.save(update_fields=["status", "reviewed_by", "updated"])

    is_approved = new_status == PharmacyStaff.Status.APPROVED
    notify(
        recipient=staff.pharmacist,
        title=f"Staff Application {'Approved' if is_approved else 'Rejected'}",
        body=f"Your staff membership request for '{pharmacy.name}' has been {'approved' if is_approved else 'rejected'}.",
        target_url="/pharmacies/mine",
        send_email=True,
    )
    return staff


@transaction.atomic
def apply_to_pharmacy_with_invite(*, user, invite: PharmacyInvite) -> PharmacyStaff:
    """
    Processes an applicant pharmacist submitting an invite code to join a pharmacy.
    Validates ownership boundaries and duplicate memberships, updates invite usage,
    and returns the pending PharmacyStaff record.
    """
    if invite.pharmacy.owner_id == user.id:
        raise ValidationError("You are already the owner of this pharmacy.")

    staff, created = PharmacyStaff.objects.get_or_create(
        pharmacy=invite.pharmacy,
        pharmacist=user,
        defaults={"status": PharmacyStaff.Status.PENDING},
    )

    if not created:
        if staff.status == PharmacyStaff.Status.APPROVED:
            raise ValidationError("You are already an approved staff member of this pharmacy.")
        if staff.status == PharmacyStaff.Status.PENDING:
            raise ValidationError("Your membership request for this pharmacy is already pending owner approval.")

        # If previously rejected, re-apply as pending
        staff.status = PharmacyStaff.Status.PENDING
        staff.reviewed_by = None
        staff.save(update_fields=["status", "reviewed_by", "updated"])

    invite.use_count += 1
    invite.save(update_fields=["use_count"])
    return staff

def create_and_send_pharmacy_invite(
    *, pharmacy: Pharmacy, created_by, recipient_email: str = "", max_uses: int = 1
) -> PharmacyInvite:
    """
    Generates a secure invite code for a pharmacy and optionally dispatches
    an email invitation to the recipient.
    """
    
    invite = PharmacyInvite.objects.create(
        pharmacy=pharmacy,
        created_by=created_by,
        code=secrets.token_urlsafe(12),
        expires_at=timezone.now() + timedelta(days=7),
        max_uses=max_uses,
    )

    # 2. If email was supplied, dispatch Celery email task with HTML template
    if recipient_email and recipient_email.strip():
        join_url = f"http://localhost:5173/pharmacies/join?code={invite.code}"
        context = {
            "pharmacy_name": pharmacy.name,
            "owner_name": created_by.email or created_by.username,
            "invite_code": invite.code,
            "join_url": join_url,
            "expires_in_days": 7,
        }
        send_notification_email_task.delay(
            to_email=recipient_email.strip(),
            title=f"Invitation to join {pharmacy.name} on MedFinder",
            body=(
                f"Hello,\n\n"
                f"You have been invited by {created_by.email or created_by.username} to join "
                f"'{pharmacy.name}' as a staff pharmacist on MedFinder.\n\n"
                f"Your Invite Code: {invite.code}\n"
                f"Join Link: {join_url}\n\n"
                f"This invitation will expire in 7 days."
            ),
            template_name="emails/staff_invite_email.html",
            context=context,
        )

    return invite
