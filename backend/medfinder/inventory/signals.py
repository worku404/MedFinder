from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from pharmacies.models import Pharmacy
from .models import Inventory

POPULAR_MEDICINES_CACHE_KEY = "popular_medicines_landing_v1"


@receiver([post_save, post_delete], sender=Inventory)
def invalidate_inventory_cache(sender, instance, **kwargs):
    cache.delete(POPULAR_MEDICINES_CACHE_KEY)


@receiver(post_save, sender=Pharmacy)
def invalidate_pharmacy_cache(sender, instance, **kwargs):
    cache.delete(POPULAR_MEDICINES_CACHE_KEY)
