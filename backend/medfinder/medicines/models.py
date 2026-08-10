from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Category name (e.g. Antibiotics, Analgesics, Dermatologicals)",
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
    )
    description = models.TextField(
        blank=True,
        help_text="Optional description of this therapeutic class",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-generate slug from name if not manually provided
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Medicine(models.Model):

    class DosageForm(models.TextChoices):
        TABLET     = "TABLET",     "Tablet"
        CAPSULE    = "CAPSULE",    "Capsule"
        SYRUP      = "SYRUP",      "Syrup"
        INJECTION  = "INJECTION",  "Injection"
        CREAM      = "CREAM",      "Cream"
        OINTMENT   = "OINTMENT",   "Ointment"
        DROPS      = "DROPS",      "Drops"
        INHALER    = "INHALER",    "Inhaler"

    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Generic / INN name (e.g. Amoxicillin, Paracetamol)",
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="medicines",
        help_text="Therapeutic category (e.g. Antibiotics)",
    )
    dosage_form = models.CharField(
        max_length=20,
        choices=DosageForm.choices,
    )
    strength = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. 500mg, 250mg/5ml",
    )
    description = models.TextField(
        blank=True,
        help_text="Notes and common brand names for search coverage",
    )
    requires_prescription = models.BooleanField(default=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive medicines are hidden from public search",
    )
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        label = self.name
        if self.strength:
            label = f"{label} {self.strength}"
        return f"{label} ({self.get_dosage_form_display()})"

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
