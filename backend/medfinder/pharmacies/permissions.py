from rest_framework.permissions import SAFE_METHODS, BasePermission


def is_approved_staff_or_owner(user, pharmacy):
    """
    Checks if a user is either the direct owner of the pharmacy
    or an approved staff member.
    """
    if not user or not user.is_authenticated:
        return False
    return bool(
        pharmacy.owner_id == user.id
        or pharmacy.staff_memberships.filter(
            pharmacist=user, status="approved"
        ).exists()
    )


class IsPharmacyOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and obj.owner_id == request.user.id
        )


class IsApprovedStaffOrOwner(BasePermission):
    """
    Permission class that grants access if the user is the pharmacy owner
    or an approved staff member. Works on Pharmacy instances or models with a .pharmacy FK.
    """

    def has_object_permission(self, request, view, obj):
        pharmacy = getattr(obj, "pharmacy", obj)
        return is_approved_staff_or_owner(request.user, pharmacy)