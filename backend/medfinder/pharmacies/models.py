from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.db import models
from django.core.exceptions import ValidationError




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
