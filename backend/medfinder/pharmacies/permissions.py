from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsPharmacyOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.owner_id == request.user.id
        )