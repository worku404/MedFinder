import uuid
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone




class Pharmacy(models.Model):
    """
    Backend SRS FR-PHM-1 through FR-PHM-4.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="pharmacies", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    location = gis_models.PointField(geography=True)
    address = models.CharField(max_length=300, blank=True)  # landmark description
    license_reference = models.CharField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=32, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    reviewed_by = models.ForeignKey(
    settings.AUTH_USER_MODEL, null=True, blank=True,
    on_delete=models.SET_NULL, related_name='reviewed_applications'
    )
    class Meta:
        verbose_name_plural = "pharmacies"
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["status"]),
        ]


    def clean(self):
        super().clean()
        if self.status == self.Status.REJECTED and not self.rejection_reason.strip():
            raise ValidationError({
                'rejection_reason': 'A rejection reason is required when rejecting an application.'
            })
    def __str__(self):
        return f"{self.name} ({self.status})"

class PharmacyStaff(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Owner Approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    pharmacy = models.ForeignKey(
        Pharmacy, related_name="staff_memberships", on_delete=models.CASCADE
    )
    pharmacist = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="pharmacy_memberships", on_delete=models.CASCADE
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["pharmacy", "pharmacist"], name="unique_pharmacy_staff")
        ]

    def __str__(self):
        return f"{self.pharmacist.email} @ {self.pharmacy.name} ({self.status})"

class PharmacyInvite(models.Model):
    pharmacy = models.ForeignKey(
        Pharmacy, related_name="invites", on_delete=models.CASCADE
    )
    code = models.CharField(max_length=32, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    max_uses = models.PositiveIntegerField(default=1)
    use_count = models.PositiveIntegerField(default=0)
    revoked = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return not self.revoked and self.use_count < self.max_uses and timezone.now() < self.expires_at
