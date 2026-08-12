from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PharmacyJoinView, PharmacyViewSet, PublicPharmacyViewSet

router = DefaultRouter()
router.register("mine", PharmacyViewSet, basename="pharmacy-mine")
router.register("", PublicPharmacyViewSet, basename="pharmacy-public")

urlpatterns = [
    path("join/", PharmacyJoinView.as_view(), name="pharmacy-join"),
    path("", include(router.urls)),
]