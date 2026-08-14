"""
Scratch script: manually seed test data to exercise the `search` app.

Not part of the app code — this is throwaway/dev-only tooling, not a
management command, per your request to keep it in `scratch/`.

Run inside the backend container:

    docker compose exec backend python scratch/seed_search_data.py

Safe to re-run: uses get_or_create() so it won't create duplicates,
and re-syncs the "stale" entry's timestamp each time so the freshness
demo still works after the 48h window would otherwise elapse.

What it creates:
  - 1 pharmacist user
  - 2 verified pharmacies a few km apart (Bole / Piazza, Addis Ababa)
  - 2 medicines: Paracetamol (description mentions "Panadol" as a brand
    name, to test FR-SRCH-1's description-fallback matching) and
    Amoxicillin
  - 3 inventory entries:
      - Paracetamol @ Bole pharmacy   -> confirmed just now   (fresh)
      - Paracetamol @ Piazza pharmacy -> confirmed 72h ago    (stale)
      - Amoxicillin @ Bole pharmacy   -> confirmed just now   (fresh)

Try these against the search endpoint afterwards:
  GET /api/search/?q=paracetamol
  GET /api/search/?q=panadol                (matches via description)
  GET /api/search/?q=paracetmol              (typo, still matches)
  GET /api/search/?q=paracetamol&lat=9.0107&lng=38.7756   (Bole ranks closer)
"""

import os
import sys
from datetime import timedelta
from pathlib import Path

# Make the Django project importable regardless of the working directory
# this script is invoked from (mirrors what manage.py does).
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medfinder.settings")

import django  # noqa: E402

django.setup()

from django.contrib.gis.geos import Point  # noqa: E402
from django.utils import timezone  # noqa: E402

from accounts.models import User  # noqa: E402
from inventory.models import Inventory  # noqa: E402
from medicines.models import Category, Medicine  # noqa: E402
from pharmacies.models import Pharmacy  # noqa: E402


def get_or_create_pharmacist():
    pharmacist, created = User.objects.get_or_create(
        username="test_pharmacist",
        defaults={"email": "pharmacist@example.com", "role": User.Role.PHARMACIST},
    )
    if created:
        pharmacist.set_password("testpass123")
        pharmacist.save()
    return pharmacist


def get_or_create_pharmacy(owner, name, license_reference, lng, lat, address):
    pharmacy, _ = Pharmacy.objects.get_or_create(
        license_reference=license_reference,
        defaults={
            "owner": owner,
            "name": name,
            "location": Point(lng, lat, srid=4326),
            "address": address,
            "phone_number": "+251900000000",
            "status": Pharmacy.Status.VERIFIED,
        },
    )
    # Make sure it's verified even if it already existed with a different status.
    if pharmacy.status != Pharmacy.Status.VERIFIED:
        pharmacy.status = Pharmacy.Status.VERIFIED
        pharmacy.save(update_fields=["status"])
    return pharmacy


def get_or_create_medicine(name, category, description, strength):
    medicine, _ = Medicine.objects.get_or_create(
        name=name,
        defaults={
            "category": category,
            "dosage_form": Medicine.DosageForm.TABLET,
            "strength": strength,
            "description": description,
            "requires_prescription": False,
            "is_active": True,
        },
    )
    return medicine


def set_inventory(pharmacy, medicine, quantity, price, confirmed_hours_ago=0):
    inventory, _ = Inventory.objects.get_or_create(
        pharmacy=pharmacy,
        medicine=medicine,
        defaults={"quantity_available": quantity, "price": price},
    )
    inventory.quantity_available = quantity
    inventory.price = price
    inventory.last_confirmed_at = timezone.now() - timedelta(hours=confirmed_hours_ago)
    inventory.save()
    return inventory


def run():
    pharmacist = get_or_create_pharmacist()

    category, _ = Category.objects.get_or_create(
        name="Analgesics", defaults={"description": "Pain relievers"}
    )

    bole = get_or_create_pharmacy(
        owner=pharmacist,
        name="Test Pharmacy - Bole",
        license_reference="TEST-LICENSE-BOLE",
        lng=38.7756,
        lat=9.0107,
        address="Near Bole Airport, Addis Ababa",
    )
    piazza = get_or_create_pharmacy(
        owner=pharmacist,
        name="Test Pharmacy - Piazza",
        license_reference="TEST-LICENSE-PIAZZA",
        lng=38.7469,
        lat=9.0350,
        address="Piazza, Addis Ababa",
    )

    paracetamol = get_or_create_medicine(
        name="Paracetamol",
        category=category,
        description="Also sold under the brand names Panadol and Tylenol.",
        strength="500mg",
    )
    amoxicillin = get_or_create_medicine(
        name="Amoxicillin",
        category=category,
        description="Common penicillin-type antibiotic.",
        strength="250mg",
    )

    fresh_at_bole = set_inventory(bole, paracetamol, quantity=50, price=25.00, confirmed_hours_ago=0)
    stale_at_piazza = set_inventory(piazza, paracetamol, quantity=10, price=22.00, confirmed_hours_ago=72)
    amox_at_bole = set_inventory(bole, amoxicillin, quantity=0, price=60.00, confirmed_hours_ago=1)

    print("Seed complete:")
    print(f"  Pharmacist: {pharmacist.username} ({pharmacist.email})")
    print(f"  Pharmacy:   {bole.name} [{bole.status}]")
    print(f"  Pharmacy:   {piazza.name} [{piazza.status}]")
    print(f"  Medicine:   {paracetamol.name} {paracetamol.strength}")
    print(f"  Medicine:   {amoxicillin.name} {amoxicillin.strength}")
    print(
        f"  Inventory:  {paracetamol.name} @ {bole.name} -> "
        f"qty={fresh_at_bole.quantity_available}, stale={fresh_at_bole.is_stale}"
    )
    print(
        f"  Inventory:  {paracetamol.name} @ {piazza.name} -> "
        f"qty={stale_at_piazza.quantity_available}, stale={stale_at_piazza.is_stale}"
    )
    print(
        f"  Inventory:  {amoxicillin.name} @ {bole.name} -> "
        f"qty={amox_at_bole.quantity_available} (out of stock), stale={amox_at_bole.is_stale}"
    )


if __name__ == "__main__":
    run()
