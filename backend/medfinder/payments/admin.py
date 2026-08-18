from django.contrib import admin

from .models import Payment, PharmacyPayoutAccount


@admin.register(PharmacyPayoutAccount)
class PharmacyPayoutAccountAdmin(admin.ModelAdmin):
    list_display = ("pharmacy", "chapa_subaccount_id", "commission_percent", "updated")
    search_fields = ("pharmacy__name", "chapa_subaccount_id", "account_number")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("tx_ref", "patient", "pharmacy", "amount", "currency", "status", "created_at")
    list_filter = ("status", "currency")
    search_fields = ("tx_ref", "chapa_ref_id", "patient__email", "pharmacy__name")
    readonly_fields = ("tx_ref", "chapa_ref_id", "created_at", "updated_at")
