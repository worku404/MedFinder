from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PHARMACIST = "pharmacist", "Pharmacist"
        # Administrator is deliberately NOT a role value here. Django's own
        # is_staff/is_superuser already cover admin access (backend SRS
        # FR-ADM-1 — Django admin handles that role entirely). Adding a
        # third role value would create two competing sources of truth
        # for "is this an admin" — avoid that.
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    def __str__(self):
        return self.email or self.username
