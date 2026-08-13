from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PHARMACIST = "pharmacist", "Pharmacist"
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    def __str__(self):
        return self.email or self.username
