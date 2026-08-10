from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer as BasePasswordResetSerializer
from dj_rest_auth.serializers import UserDetailsSerializer
from django.conf import settings
from rest_framework import serializers

from .models import User


class AccountsRegisterSerializer(RegisterSerializer):
    """
    add role field
    """

    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.CUSTOMER)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["role"] = self.validated_data.get("role", User.Role.CUSTOMER)
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get("role", User.Role.CUSTOMER)
        user.save(update_fields=["role"])
        return user


class AccountsUserDetailsSerializer(UserDetailsSerializer):
    """
    add role field to the /api/auth/user/ response, 
    so the frontend can
    decide which layout (Customer vs Pharmacist) to route into right
    after login
    """

    class Meta(UserDetailsSerializer.Meta):
        model = User
        fields = UserDetailsSerializer.Meta.fields + ("role",)
        read_only_fields = ("email", "role")


class AccountsPasswordResetSerializer(BasePasswordResetSerializer):
    def get_email_options(self):
        return {"extra_email_context": {"frontend_url": settings.FRONTEND_URL}}
