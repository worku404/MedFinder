from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

admin.site.site_header = "MedFinder Administration"
admin.site.site_title = "MedFinder Admin"
admin.site.index_title = "Welcome to MedFinder"

@admin.register(User)
class AccountsUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = UserAdmin.fieldsets + (
        ("MedFinder role", {"fields": ("role",)}),
    )