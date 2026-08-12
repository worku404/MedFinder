from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Greatest
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from inventory.models import Inventory
from pharmacies.models import Pharmacy

from .serializers import SearchResultSerializer

# Minimum combined trigram similarity for a medicine to be considered a
# match at all (FR-SRCH-1). Matches Postgres's own default
# `pg_trgm.similarity_threshold`, rather than an arbitrary invented value.
SIMILARITY_THRESHOLD = 0.3

# A match in the free-text `description` field counts for less than a
# match in the canonical `name` field, since there's no separate alias
# table (see medicines app notes) and a brand name mentioned in a
# paragraph is a weaker signal than the name itself matching.
DESCRIPTION_WEIGHT = 0.5


class SearchResultsPagination(PageNumberPagination):
    page_size = 20
    max_page_size = 50


class SearchView(generics.ListAPIView):
    """
    Public medicine availability search (SRS FR-SRCH-1 through FR-SRCH-4).

    GET /api/search/?q=<query>&lat=<lat>&lng=<lng>

    - `q` is required; an empty/missing query returns no results.
    - `lat`/`lng` are optional. When both are provided, results are
      annotated with distance from that point and ranked accordingly
      (FR-SRCH-2). Malformed coordinates are ignored rather than
      rejected, so search still works without distance ranking.
    - No authentication required (FR-SRCH-3); rate-limited via the
      project's default throttle classes (FR-SRCH-4).
    """

    serializer_class = SearchResultSerializer
    permission_classes = [AllowAny]
    pagination_class = SearchResultsPagination

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        if not query:
            return Inventory.objects.none()

        queryset = (
            Inventory.objects.select_related("medicine", "pharmacy")
            .filter(
                pharmacy__status=Pharmacy.Status.VERIFIED,
                medicine__is_active=True,
            )
            .annotate(
                similarity=Greatest(
                    TrigramSimilarity("medicine__name", query),
                    TrigramSimilarity("medicine__description", query)
                    * DESCRIPTION_WEIGHT,
                )
            )
            .filter(similarity__gte=SIMILARITY_THRESHOLD)
        )

        # Rank by best text match first, then freshness (confirmed entries
        # naturally sort before unconfirmed ones, since "stale" means
        # last_confirmed_at fell behind the freshness window), then
        # distance if we know where the searcher is.
        ordering = ["-similarity", "-last_confirmed_at"]

        user_location = self._get_user_location()
        if user_location is not None:
            queryset = queryset.annotate(
                distance=Distance("pharmacy__location", user_location)
            )
            ordering.append("distance")

        return queryset.order_by(*ordering)

    def _get_user_location(self):
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        if lat is None or lng is None:
            return None
        try:
            return Point(float(lng), float(lat), srid=4326)
        except (TypeError, ValueError):
            return None
