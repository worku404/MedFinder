from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsPharmacist
from pharmacies.models import PharmacyStaff
from .models import Inventory
from .permissions import IsInventoryOwner
from .serializers import InventorySerializer


class InventoryViewSet(viewsets.ModelViewSet):
    """
    CRUD API for pharmacists managing their pharmacy stock listings (SRS FR-INV-1, FR-INV-2).
    """

    queryset = Inventory.objects.none()  # For drf-spectacular schema introspection
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    filterset_fields = ["pharmacy", "medicine", "medicine__slug"]
    ordering_fields = ["last_confirmed_at", "price", "quantity_available", "medicine__name"]
    ordering = ["-last_confirmed_at"]

    def get_queryset(self):
        # Guard for schema generation and unauthenticated introspection
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Inventory.objects.none()

        # Pharmacists manage stock for pharmacies they own or are approved staff for (FR-INV-1, FR-PHM-4)
        return (
            Inventory.objects.filter(
                Q(pharmacy__owner=self.request.user) |
                Q(
                    pharmacy__staff_memberships__pharmacist=self.request.user,
                    pharmacy__staff_memberships__status=PharmacyStaff.Status.APPROVED,
                )
            )
            .select_related("pharmacy", "medicine", "medicine__category")
            .distinct()
        )

    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy", "confirm"):
            return [IsAuthenticated(), IsPharmacist(), IsInventoryOwner()]
        return [IsAuthenticated(), IsPharmacist()]

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """
        Reconfirm stock entry freshness without altering quantity or price (SRS FR-INV-2).
        """
        instance = self.get_object()
        instance.last_confirmed_at = timezone.now()
        instance.save(update_fields=["last_confirmed_at"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
