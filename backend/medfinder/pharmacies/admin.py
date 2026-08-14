from django.contrib import admin
from django.contrib.admin import helpers
from django.contrib.gis import admin as gis_admin
from django.http import HttpResponseRedirect
from django.shortcuts import render

from .forms import PharmacyRejectionForm
from .models import Pharmacy

from notifications.dispatch import notify


@admin.register(Pharmacy)
class PharmacyAdmin(gis_admin.GISModelAdmin):
    list_display = ["name", "owner", "reviewed_by", "status", "created"]
    list_filter = ["status"]
    search_fields = ["name", "owner__email", "license_reference"]
    readonly_fields = ("created", "updated")
    actions = ["approve_pharmacies", "reject_pharmacies"]
    gis_widget_kwargs = {
        'attrs': {
            'default_zoom': 12,
            'default_lat': 9.03,  # Addis Ababa default center
            'default_lon': 38.74,
        }
    }

    @admin.action(description="Approve selected pharmacies")
    def approve_pharmacies(self, request, queryset):
        pharmacies = list(queryset.select_related("owner"))
        updated = queryset.update(
            status=Pharmacy.Status.VERIFIED,
            rejection_reason="",
            reviewed_by=request.user,
        )
        for pharmacy in pharmacies:
            notify(
                recipient=pharmacy.owner,
                title="Pharmacy Approved",
                body=f"Your pharmacy '{pharmacy.name}' has been verified and is now live on MedFinder.",
                target_url="/pharmacies/mine",
                send_email=True,
            )

        self.message_user(request, f"{updated} pharmacy(ies) approved.")

    @admin.action(description="Reject selected pharmacies with reason...")
    def reject_pharmacies(self, request, queryset):
        if "apply" in request.POST:
            form = PharmacyRejectionForm(request.POST)
            if form.is_valid():
                reason = form.cleaned_data["rejection_reason"]
                pharmacies = list(queryset.select_related("owner"))
                updated = queryset.update(
                    status=Pharmacy.Status.REJECTED,
                    rejection_reason=reason,
                    reviewed_by=request.user,
                )
                for pharmacy in pharmacies:
                    notify(
                        recipient=pharmacy.owner,
                        title="Pharmacy Rejected",
                        body=f"Your pharmacy '{pharmacy.name}' has been rejected. Reason: {reason}",
                        target_url="/pharmacies/mine",
                        send_email=True,
                    )
                self.message_user(
                    request,
                    f"{updated} pharmacy(ies) rejected with reason: '{reason}'",
                )
                return HttpResponseRedirect(request.get_full_path())
        else:
            form = PharmacyRejectionForm()

        return render(
            request,
            "admin/pharmacies/pharmacy/reject_reason.html",
            context={
                "title": "Reject Pharmacy Applications",
                "pharmacies": queryset,
                "form": form,
                "action_checkbox_name": helpers.ACTION_CHECKBOX_NAME,
                "opts": self.model._meta,
            },
        )