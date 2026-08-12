from rest_framework import serializers

from inventory.models import Inventory
from medicines.serializers import MedicineSerializer
from pharmacies.serializers import PharmacyPublicSerializer


class SearchResultSerializer(serializers.ModelSerializer):
    """
    Serializer for a single search result row (SRS FR-SRCH-1, FR-SRCH-2).

    Wraps an `Inventory` entry annotated by the view with a trigram
    `similarity` score and, when the searcher's location is known, a
    `distance` (PostGIS `Distance` measure).
    """

    medicine = MedicineSerializer(read_only=True)
    pharmacy = PharmacyPublicSerializer(read_only=True)
    availability = serializers.CharField(
        source="get_availability_display", read_only=True
    )
    is_stale = serializers.BooleanField(read_only=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = [
            "id",
            "medicine",
            "pharmacy",
            "quantity_available",
            "price",
            "availability",
            "is_stale",
            "last_confirmed_at",
            "distance_km",
        ]

    def get_distance_km(self, obj):
        # `distance` is only present when the request included lat/lng
        # (see SearchView._get_user_location).
        distance = getattr(obj, "distance", None)
        if distance is None:
            return None
        return round(distance.km, 2)
