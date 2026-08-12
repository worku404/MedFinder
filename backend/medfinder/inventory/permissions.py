from rest_framework.permissions import BasePermission


class IsInventoryOwner(BasePermission):
    """
    Object-level permission ensuring a pharmacist only modifies stock belonging to their own pharmacy.
    """

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.pharmacy.owner_id == request.user.id
        )
