"""
MedFinder Verification Script: Pharmacy Invite & Email Pipeline Test
Execute via PowerShell:
Get-Content mock_data/test_invite_email.py | docker compose exec -T backend python manage.py shell
"""

from datetime import timedelta
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.utils import timezone

from notifications.tasks import send_notification_email_task
from pharmacies.models import Pharmacy, PharmacyInvite, PharmacyStaff
from pharmacies.services import (
    apply_to_pharmacy_with_invite,
    create_and_send_pharmacy_invite,
    update_pharmacy_staff_status,
)

User = get_user_model()

print("\n" + "=" * 60)
print("STARTING PIPELINE VERIFICATION: PHARMACY INVITES & EMAILS")
print("=" * 60)

# -------------------------------------------------------------
# 1. SETUP TEST USERS & PHARMACY
# -------------------------------------------------------------
print("\n[STEP 1] Setting up test users and pharmacy...")

owner, _ = User.objects.get_or_create(
    username="test_owner_dr_dawit",
    defaults={
        "email": "accworku@gmail.com",
        "role": User.Role.PHARMACIST,
    },
)

applicant, _ = User.objects.get_or_create(
    username="test_applicant_dr_tigist",
    defaults={
        "email": "accworku@gmail.com",
        "role": User.Role.PHARMACIST,
    },
)

pharmacy, _ = Pharmacy.objects.get_or_create(
    license_reference="TEST-LIC-INVITE-001",
    defaults={
        "name": "Lion Care Verification Pharmacy",
        "owner": owner,
        "location": Point(38.74, 9.03, srid=4326),
        "address": "Bole Subcity, Addis Ababa",
        "phone_number": "+251911000111",
        "status": Pharmacy.Status.VERIFIED,
    },
)

print(f" -> Pharmacy: '{pharmacy.name}' (Owner: {owner.email})")
print(f" -> Applicant: '{applicant.username}' ({applicant.email})")

# -------------------------------------------------------------
# 2. TEST INVITE GENERATION & ASYNC EMAIL TASK
# -------------------------------------------------------------
print("\n[STEP 2] Testing create_and_send_pharmacy_invite()...")

target_email = "accworku@gmail.com"
invite = create_and_send_pharmacy_invite(
    pharmacy=pharmacy,
    created_by=owner,
    recipient_email=target_email,
    max_uses=1,
)

print(f" -> Generated Code: {invite.code}")
print(f" -> Expires At:     {invite.expires_at}")
print(f" -> Is Valid?       {invite.is_valid()}")
assert invite.is_valid(), "Invite code should be valid upon creation"
assert len(invite.code) >= 12, "Invite code should be secure alphanumeric token"

# -------------------------------------------------------------
# 3. DIRECT SYNCHRONOUS EMAIL TRANSPORT CHECK
# -------------------------------------------------------------
print("\n[STEP 3] Testing direct email delivery via send_notification_email_task()...")

email_sent = send_notification_email_task(
    to_email=target_email,
    title=f"[TEST] Invitation to join {pharmacy.name}",
    body=(
        f"Hello,\n\n"
        f"You have been invited by {owner.email} to join '{pharmacy.name}'.\n"
        f"Your Invite Code: {invite.code}\n"
        f"Join Link: http://localhost:5173/pharmacies/join?code={invite.code}\n\n"
        f"This test confirms email transport is active."
    ),
    template_name="emails/staff_invite_email.html",
    context={
        "pharmacy_name": pharmacy.name,
        "owner_name": owner.email,
        "invite_code": invite.code,
        "join_url": f"http://localhost:5173/pharmacies/join?code={invite.code}",
        "expires_in_days": 7,
    },
)

print(f" -> Email Delivery Result: {email_sent}")
assert email_sent is True, "send_notification_email_task must return True"

# -------------------------------------------------------------
# 4. TEST PHARMACIST JOIN WORKFLOW
# -------------------------------------------------------------
print("\n[STEP 4] Testing apply_to_pharmacy_with_invite()...")

staff = apply_to_pharmacy_with_invite(
    user=applicant,
    invite=invite,
)

print(f" -> Staff ID:       {staff.id}")
print(f" -> Staff Status:   {staff.status}")
print(f" -> Invite Uses:    {invite.use_count} / {invite.max_uses}")
print(f" -> Invite Valid?   {invite.is_valid()} (Expected False after 1/1 use)")

assert staff.status == PharmacyStaff.Status.PENDING, "Initial staff status must be PENDING"
assert invite.use_count == 1, "Invite use_count must increment to 1"
assert invite.is_valid() is False, "Single-use invite should now be invalid/exhausted"

# -------------------------------------------------------------
# 5. TEST OWNER APPROVAL & NOTIFICATION CASCADE
# -------------------------------------------------------------
print("\n[STEP 5] Testing update_pharmacy_staff_status() (Approval)...")

approved_staff = update_pharmacy_staff_status(
    pharmacy=pharmacy,
    staff_id=staff.id,
    reviewer=owner,
    new_status=PharmacyStaff.Status.APPROVED,
)

print(f" -> Updated Status: {approved_staff.status}")
print(f" -> Reviewed By:    {approved_staff.reviewed_by.email}")
assert approved_staff.status == PharmacyStaff.Status.APPROVED, "Status must be APPROVED"
assert approved_staff.reviewed_by == owner, "Reviewed by must be the pharmacy owner"

# -------------------------------------------------------------
# SUMMARY REPORT
# -------------------------------------------------------------
print("\n" + "=" * 60)
print("VERIFICATION COMPLETE: ALL 5 PHARMACY PIPELINE CHECKS PASSED")
print("=" * 60 + "\n")
