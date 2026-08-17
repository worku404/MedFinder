from django.core.exceptions import ValidationError
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsPharmacist
from .models import Pharmacy, PharmacyStaff
from .permissions import IsApprovedStaffOrOwner, IsPharmacyOwner
from .serializers import (
    PharmacyInviteSerializer,
    PharmacyJoinSerializer,
    PharmacyOwnerSerializer,
    PharmacyPublicSerializer,
    PharmacyStaffSerializer,
)
from .services import (
    apply_to_pharmacy_with_invite,
    update_pharmacy_staff_status,
    create_and_send_pharmacy_invite
)


class PharmacyViewSet(viewsets.ModelViewSet):
    """
    CRUD API for pharmacies:
    - List/Retrieve: Accessible by owners and approved staff members.
    - Create: Any authenticated pharmacist (forced PENDING status, assigned owner).
    - Update/Delete: Strictly locked to the pharmacy owner (IsPharmacyOwner).
    - Staff & Invites: Dedicated actions for owners to manage staff and generate invite links.
    """
    queryset = Pharmacy.objects.none()  # For drf-spectacular schema introspection
    serializer_class = PharmacyOwnerSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Pharmacy.objects.none()
        return Pharmacy.objects.filter(
            Q(owner=self.request.user) |
            Q(
                staff_memberships__pharmacist=self.request.user,
                staff_memberships__status=PharmacyStaff.Status.APPROVED,
            )
        ).distinct()

    def get_permissions(self):
        # 1. Mutating & Management actions: Strictly locked to the OWNER
        if self.action in (
            "update",
            "partial_update",
            "destroy",
            "staff",
            "approve_staff",
            "reject_staff",
            "invites",
        ):
            return [IsAuthenticated(), IsPharmacist(), IsPharmacyOwner()]
        # 2. Detail viewing: Owner OR Approved Staff
        if self.action == "retrieve":
            return [IsAuthenticated(), IsPharmacist(), IsApprovedStaffOrOwner()]
        # 3. Listing & Creating: Any authenticated pharmacist
        return [IsAuthenticated(), IsPharmacist()]

    def perform_create(self, serializer):
        # Security invariant: Always force owner and PENDING status
        serializer.save(
            owner=self.request.user,
            status=Pharmacy.Status.PENDING,
        )

    @action(detail=True, methods=["get"])
    def staff(self, request, pk=None):
        """List all staff members and their application status for this pharmacy."""
        pharmacy = self.get_object()
        staff_members = pharmacy.staff_memberships.select_related("pharmacist").order_by("-created")
        serializer = PharmacyStaffSerializer(staff_members, many=True)
        return Response(serializer.data)

    def _handle_staff_status_change(self, request, new_status: PharmacyStaff.Status):
        staff_id = request.data.get("staff_id")
        if not staff_id:
            return Response({"detail": "staff_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            staff = update_pharmacy_staff_status(
                pharmacy=self.get_object(),
                staff_id=staff_id,
                reviewer=request.user,
                new_status=new_status,
            )
            return Response(PharmacyStaffSerializer(staff).data)
        except PharmacyStaff.DoesNotExist:
            return Response(
                {"detail": "Staff member not found for this pharmacy."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=["post"])
    def approve_staff(self, request, pk=None):
        """Approve a pending staff application for this pharmacy."""
        return self._handle_staff_status_change(request, PharmacyStaff.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject_staff(self, request, pk=None):
        """Reject or revoke a staff application for this pharmacy."""
        return self._handle_staff_status_change(request, PharmacyStaff.Status.REJECTED)

    @action(detail=True, methods=["get", "post"])
    def invites(self, request, pk=None):
        """List active invites or generate a new invite code for this pharmacy."""
        pharmacy = self.get_object()
        if request.method == "POST":
            serializer = PharmacyInviteSerializer(
                data=request.data,
                context={"request": request, "pharmacy": pharmacy},
            )
            serializer.is_valid(raise_exception=True)
            invite = create_and_send_pharmacy_invite(
                pharmacy=pharmacy,
                created_by=request.user,
                recipient_email=serializer.validated_data.get("recipient_email", ""),
                max_uses=serializer.validated_data.get("max_uses", 1),
            )
            return Response(PharmacyInviteSerializer(invite).data, status=status.HTTP_201_CREATED)

        invites = pharmacy.invites.order_by("-created")
        serializer = PharmacyInviteSerializer(invites, many=True)
        return Response(serializer.data)



class PublicPharmacyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pharmacy.objects.filter(status=Pharmacy.Status.VERIFIED)
    serializer_class = PharmacyPublicSerializer
    permission_classes = [AllowAny]


class PharmacyJoinView(APIView):
    """
    Allows a registered pharmacist to submit an invite code and join a pharmacy as staff.
    The staff membership is placed in 'pending' status until the pharmacy owner approves it.
    """
    permission_classes = [IsAuthenticated, IsPharmacist]

    def post(self, request):
        serializer = PharmacyJoinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invite = serializer.validated_data["invite_code"]

        try:
            staff = apply_to_pharmacy_with_invite(
                user=request.user,
                invite=invite,
            )
        except ValidationError as e:
            return Response(
                {"detail": e.message if hasattr(e, "message") else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PharmacyStaffSerializer(staff).data,
            status=status.HTTP_201_CREATED,
        )