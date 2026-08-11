from django.utils import timezone
from rest_framework import serializers

from medicines.models import Medicine
from medicines.serializers import MedicineSerializer
from pharmacies.models import Pharmacy
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    """
    Serializer for managing pharmacy stock entries (SRS FR-INV-1, FR-INV-2).
    """

    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicine.objects.filter(is_active=True),
        source="medicine",
        write_only=True,
    )
    availability = serializers.CharField(
        source="get_availability_display", read_only=True
    )
    is_stale = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "pharmacy",
            "medicine",
            "medicine_id",
            "quantity_available",
            "price",
            "availability",
            "is_stale",
            "last_confirmed_at",
        ]
        read_only_fields = [
            "id",
            "availability",
            "is_stale",
            "last_confirmed_at",
        ]

    def validate_pharmacy(self, value):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # Enforce object ownership (FR-PHM-4)
            if value.owner != request.user:
                raise serializers.ValidationError(
                    "You can only manage inventory for pharmacies you own."
                )
            # Enforce verification requirement (FR-ACC-4)
            if value.status != Pharmacy.Status.VERIFIED:
                raise serializers.ValidationError(
                    "Cannot publish stock for an unverified pharmacy."
                )
        return value

    def validate_quantity_available(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity available cannot be negative.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value

    def update(self, instance, validated_data):
        # Update last_confirmed_at whenever pharmacist updates stock (FR-INV-2)
        validated_data["last_confirmed_at"] = timezone.now()
        return super().update(instance, validated_data)