from django.contrib import admin
from .models import Category, Medicine


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ["name", "strength", "dosage_form", "category", "requires_prescription", "is_active"]
    list_filter = ["category", "dosage_form", "requires_prescription", "is_active"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["is_active"]
