from django.contrib import admin
from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = (
        "pharmacy",
        "medicine",
        "quantity_available",
        "price",
        "last_confirmed_at",
    )
    list_filter = (
        "pharmacy",
        "medicine",
        "last_confirmed_at",
    )
    search_fields = (
        "pharmacy__name",
        "medicine__name",
    )
    ordering = ["-last_confirmed_at"]
