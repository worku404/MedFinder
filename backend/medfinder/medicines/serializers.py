from rest_framework import serializers
from sorl.thumbnail import get_thumbnail

from .models import Category, Medicine


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]
        read_only_fields = ["id", "slug"]


class MedicineSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    dosage_form_display = serializers.CharField(
        source="get_dosage_form_display", read_only=True,
    )
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "dosage_form",
            "dosage_form_display",
            "image",
            "image_url",
            "thumbnail",
            "strength",
            "description",
            "requires_prescription",
            "is_active",
        ]

    def get_thumbnail(self, obj):
        image_source = obj.image or obj.image_url
        if not image_source:
            return None
        try:
            
            # On-demand resize to 300x300, center-cropped, 85% JPEG quality
            thumb = get_thumbnail(image_source, "300x300", crop="center", quality=85)
            request = self.context.get("request")
            if request and thumb.url.startswith("/"):
                return request.build_absolute_uri(thumb.url)
            return thumb.url
        except Exception:
            if obj.image_url:
                return obj.image_url
            if obj.image:
                request = self.context.get("request")
                return request.build_absolute_uri(obj.image.url) if request else obj.image.url
            return None

