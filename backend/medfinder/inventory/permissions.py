from rest_framework.permissions import BasePermission

from pharmacies.permissions import is_approved_staff_or_owner


class IsInventoryOwner(BasePermission):
    """
    Object-level permission ensuring a pharmacist only modifies stock belonging
    to a pharmacy they own or are an approved staff member of.
    """

    def has_object_permission(self, request, view, obj):
        return is_approved_staff_or_owner(request.user, obj.pharmacy)

