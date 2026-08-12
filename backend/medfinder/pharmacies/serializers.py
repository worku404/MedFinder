import secrets
from datetime import timedelta
from django.contrib.gis.geos import Point
from django.utils import timezone
from rest_framework import serializers
from .models import Pharmacy, PharmacyInvite, PharmacyStaff


class PharmacyOwnerSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90, write_only=True)
    longitude = serializers.FloatField(min_value=-180, max_value=180, write_only=True)
    is_owner = serializers.SerializerMethodField()  

    class Meta:
        model = Pharmacy
        fields = [
            "id", "owner", "name", "address",
            "license_reference", "is_owner", "phone_number", "latitude",
            "longitude", "status", "rejection_reason", "created", "updated",
        ]
        read_only_fields = [
            "id", "owner", "is_owner", "status", "rejection_reason", "created", "updated",
        ]

    def get_is_owner(self, instance):
        """O(1) in-memory check to inform the frontend whether the user is the owner."""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return instance.owner_id == request.user.id
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["latitude"] = instance.location.y if instance.location else None
        data["longitude"] = instance.location.x if instance.location else None
        return data

    def validate(self, attrs):
        lat = attrs.get("latitude")
        lng = attrs.get("longitude")
        if (lat is not None and lng is None) or (lng is not None and lat is None):
            raise serializers.ValidationError(
                "Both 'latitude' and 'longitude' must be provided together to update location."
            )
        return attrs

    def create(self, validated_data):
        latitude = validated_data.pop("latitude")
        longitude = validated_data.pop("longitude")
        validated_data["location"] = Point(longitude, latitude, srid=4326)
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        latitude = validated_data.pop("latitude", None)
        longitude = validated_data.pop("longitude", None)
        if latitude is not None and longitude is not None:
            validated_data["location"] = Point(longitude, latitude, srid=4326)
        return super().update(instance, validated_data)


class PharmacyPublicSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(source="location.y", read_only=True)
    longitude = serializers.FloatField(source="location.x", read_only=True)

    class Meta:
        model = Pharmacy
        fields = [
            "id",
            "name",
            "address",
            "phone_number",
            "latitude",
            "longitude",
        ]


class PharmacyJoinSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=64, required=True)

    def validate_invite_code(self, value):
        try:
            invite = PharmacyInvite.objects.select_related("pharmacy").get(code=value)
        except PharmacyInvite.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")

        if not invite.is_valid():
            raise serializers.ValidationError(
                "This invite code is expired, revoked, or has reached maximum uses."
            )
        return invite


class PharmacyStaffSerializer(serializers.ModelSerializer):
    pharmacy_name = serializers.CharField(source="pharmacy.name", read_only=True)
    pharmacy_address = serializers.CharField(source="pharmacy.address", read_only=True)

    class Meta:
        model = PharmacyStaff
        fields = ["id", "pharmacy", "pharmacy_name", "pharmacy_address", "status", "created", "updated",]
        read_only_fields = fields


class PharmacyInviteSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = PharmacyInvite
        fields = ["id", "code", "pharmacy", "expires_at", "max_uses", "use_count", "revoked", "is_valid", "created",]
        read_only_fields = ["id", "code", "pharmacy", "use_count", "revoked", "is_valid", "created",]
        extra_kwargs = {"expires_at": {"required": False}, "max_uses": {"required": False, "default": 1}} 


    def create(self, validated_data):
        if "code" not in validated_data:
            validated_data["code"] = secrets.token_urlsafe(12)
        # Default expiration to 7 days from now if omitted
        if "expires_at" not in validated_data:
            validated_data["expires_at"] = timezone.now() + timedelta(days=7)

        validated_data["pharmacy"] = self.context["pharmacy"]
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

