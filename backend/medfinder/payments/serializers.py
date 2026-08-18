from rest_framework import serializers

from inventory.models import Inventory
from .models import Payment


class InitiatePaymentSerializer(serializers.Serializer):
    """Input for starting a checkout."""

    inventory = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        inv = attrs["inventory"]
        qty = attrs["quantity"]
        if inv.quantity_available < qty:
            raise serializers.ValidationError(
                {"quantity": "Not enough stock available for this quantity."}
            )
        if not hasattr(inv.pharmacy, "payout_account"):
            raise serializers.ValidationError(
                {"inventory": "This pharmacy is not set up to accept payments yet."}
            )
        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    """Read-only representation returned to the patient (status polling)."""

    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)
    medicine_name = serializers.CharField(source="inventory.medicine.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "tx_ref", "amount", "currency", "status", "quantity",
            "pharmacy_name", "medicine_name", "created_at", "updated_at",
        ]
        read_only_fields = fields
