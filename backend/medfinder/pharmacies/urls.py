from rest_framework.routers import DefaultRouter
 
from .views import PharmacyViewSet, PublicPharmacyViewSet
 
router = DefaultRouter()

router.register("mine", PharmacyViewSet, basename="pharmacy-mine")

router.register("", PublicPharmacyViewSet, basename="pharmacy-public")

urlpatterns = router.urls