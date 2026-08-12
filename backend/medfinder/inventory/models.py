from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import timedelta

from medicines.models import Medicine
from pharmacies.models import Pharmacy

class Inventory(models.Model):
    """ Represents an inventory listing for a specific medicine at a specific pharmacy."""
    FRESHNESS_WINDOW = timedelta(hours=48)
    
    pharmacy = models.ForeignKey(Pharmacy, related_name="stock_entries", on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, related_name="stock_entries", on_delete=models.CASCADE)
    quantity_available = models.IntegerField(
        default=0,
        validators=[
            MinValueValidator(0, "Quantity cannot be negative."),
        ],
    )

    price = models.DecimalField( max_digits=10, decimal_places=2,validators=[MinValueValidator(0.01, "Price must be positive.")],)
    last_confirmed_at = models.DateTimeField(default=timezone.now)
    class Meta:
        verbose_name = "Stock Entry"
        verbose_name_plural = "Stock Entries"
        ordering = ["-last_confirmed_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["pharmacy", "medicine"],
                name="unique_pharmacy_medicine_stock",
            )
        ]
    def __str__(self):
        return f"{self.pharmacy.name} - {self.medicine.name}: {self.get_availability_display()}"
    def get_availability_display(self):
        """Returns 'In Stock' or 'Out of Stock' based on quantity_available."""
        return "In Stock" if self.quantity_available > 0 else "Out of Stock"
    @property
    def is_stale(self):
        return timezone.now() - self.last_confirmed_at > self.FRESHNESS_WINDOW
