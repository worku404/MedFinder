from django.core.cache import cache
from django.db.models import Count, Max, Min, Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from pharmacies.models import Pharmacy
from .models import Category, Medicine
from .serializers import CategorySerializer, MedicineSerializer

POPULAR_MEDICINES_CACHE_KEY = "popular_medicines_landing_v1"
CACHE_TTL_SECONDS = 300  # 5 minutes


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filterset_fields = ["category", "category__slug", "dosage_form", "requires_prescription"]
    # Powers the pharmacist-facing medicine picker in the inventory UI
    # (?search=...) via DRF's SearchFilter, already enabled project-wide
    # in DEFAULT_FILTER_BACKENDS — it was a no-op here until this was set.
    search_fields = ["name", "description"]
    ordering = ["-in_stock_pharmacies_count", "name"]

    def list(self, request, *args, **kwargs):
        # Cache default landing page queries (no specific search/filter params or cursor)
        is_default_landing_query = (
            not request.query_params.get("search")
            and not request.query_params.get("category")
            and not request.query_params.get("category__slug")
            and not request.query_params.get("dosage_form")
            and not request.query_params.get("requires_prescription")
            and not request.query_params.get("cursor")
        )

        if is_default_landing_query:
            cached_data = cache.get(POPULAR_MEDICINES_CACHE_KEY)
            if cached_data is not None:
                return Response(cached_data)

        response = super().list(request, *args, **kwargs)

        if is_default_landing_query and response.status_code == 200:
            cache.set(POPULAR_MEDICINES_CACHE_KEY, response.data, timeout=CACHE_TTL_SECONDS)

        return response

    def get_queryset(self):
        return (
            Medicine.objects.filter(is_active=True)
            .select_related("category")
            .annotate(
                in_stock_pharmacies_count=Count(
                    "stock_entries",
                    filter=Q(
                        stock_entries__quantity_available__gt=0,
                        stock_entries__pharmacy__status=Pharmacy.Status.VERIFIED,
                    ),
                    distinct=True,
                ),
                from_price=Min(
                    "stock_entries__price",
                    filter=Q(
                        stock_entries__quantity_available__gt=0,
                        stock_entries__pharmacy__status=Pharmacy.Status.VERIFIED,
                    ),
                ),
                latest_confirmed_at=Max(
                    "stock_entries__last_confirmed_at",
                    filter=Q(
                        stock_entries__quantity_available__gt=0,
                        stock_entries__pharmacy__status=Pharmacy.Status.VERIFIED,
                    ),
                ),
            )
        )


