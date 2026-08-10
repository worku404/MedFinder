from django.contrib.gis.geos import Point
from rest_framework import serializers

from .models import Pharmacy


class PharmacyOwnerSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90, write_only=True)
    longitude = serializers.FloatField(min_value=-180, max_value=180, write_only=True)

    class Meta:
        model = Pharmacy
        fields = [
            "id",
            "owner",
            "name",
            "address",
            "license_reference",
            "phone_number",
            "latitude",
            "longitude",
            "status",
            "rejection_reason",
            "created",
            "updated",
        ]
        read_only_fields = [
            "id",
            "owner",
            "status",
            "rejection_reason",
            "created",
            "updated",
        ]

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