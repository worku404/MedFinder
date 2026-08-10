from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
 
from accounts.permissions import IsPharmacist
from .models import Pharmacy
from .permissions import IsPharmacyOwner
from .serializers import PharmacyOwnerSerializer, PharmacyPublicSerializer

class PharmacyViewSet(viewsets.ModelViewSet):
    serializer_class = PharmacyOwnerSerializer
    permission_classes = [IsAuthenticated, IsPharmacist]
    def get_queryset(self):
        return Pharmacy.objects.filter(owner=self.request.user)

    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsPharmacist(), IsPharmacyOwner()]
        return [IsAuthenticated(), IsPharmacist()]
    def perform_create(self, serializer):
        pharmacy = serializer.save(
            owner=self.request.user,    
            status=Pharmacy.Status.PENDING
            )
class PublicPharmacyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pharmacy.objects.filter(status=Pharmacy.Status.VERIFIED)
    serializer_class = PharmacyPublicSerializer
    permission_classes = [AllowAny]