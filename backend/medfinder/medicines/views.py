from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Category, Medicine
from .serializers import CategorySerializer, MedicineSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Medicine.objects.filter(is_active=True).select_related("category")
    serializer_class = MedicineSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filterset_fields = ["category", "category__slug", "dosage_form", "requires_prescription"]
    # Powers the pharmacist-facing medicine picker in the inventory UI
    # (?search=...) via DRF's SearchFilter, already enabled project-wide
    # in DEFAULT_FILTER_BACKENDS — it was a no-op here until this was set.
    search_fields = ["name", "description"]
    ordering = ["name"]


