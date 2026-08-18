"""
Thin wrapper around the Chapa REST API (https://developer.chapa.co).

Only the calls MedFinder needs for Model A (split payment):
  * create_subaccount     - register a pharmacy's bank account once.
  * initialize_transaction - start a checkout, splitting funds to a subaccount.
  * verify_transaction     - authoritative server-side status check.

We never store card data and never move money ourselves; Chapa collects and
splits at settlement time.
"""

import requests
from django.conf import settings


def _headers():
    return {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}


def create_subaccount(business_name, account_name, bank_code, account_number,
                      split_type="percentage", split_value=0.1):
    """
    Register a pharmacy's bank account as a Chapa subaccount (done once).

    `split_value` here is the fraction Chapa routes to the PLATFORM when
    split_type='percentage' (0.1 == platform keeps 10%). Returns the parsed
    JSON; the subaccount id is at data["data"]["subaccount_id"].
    """
    url = f"{settings.CHAPA_BASE_URL}/subaccount"
    payload = {
        "business_name": business_name,
        "account_name": account_name,
        "bank_code": bank_code,
        "account_number": account_number,
        "split_type": split_type,
        "split_value": split_value,
    }
    resp = requests.post(url, json=payload, headers=_headers(), timeout=10)
    if not resp.ok:
        raise Exception(f"Chapa create_subaccount failed ({resp.status_code}): {resp.text}")
    return resp.json()


def initialize_transaction(amount, email, first_name, last_name, tx_ref,
                           subaccount_id, commission_percent):
    """
    Start a Chapa checkout with a split to the pharmacy's subaccount.

    The `subaccounts` block is the ONLY real addition over a plain single-
    merchant collect: Chapa sends the pharmacy its share automatically and the
    platform retains `commission_percent`. Returns parsed JSON; the hosted
    checkout link is at data["data"]["checkout_url"].
    """
    url = f"{settings.CHAPA_BASE_URL}/transaction/initialize"
    payload = {
        "amount": str(amount),
        "currency": "ETB",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "tx_ref": tx_ref,
        "callback_url": f"{settings.PUBLIC_BASE_URL}/api/payments/webhook/",
        "return_url": f"{settings.FRONTEND_URL}/payments/{tx_ref}",
        "subaccounts": [
            {
                "id": subaccount_id,
                # Platform keeps `commission_percent`; remainder -> pharmacy.
                "split_type": "percentage",
                "split_value": float(commission_percent) / 100.0,
            }
        ],
        "customization": {
            "title": "MedFinder",
            "description": "Medicine reservation payment",
        },
    }
    resp = requests.post(url, json=payload, headers=_headers(), timeout=10)
    if not resp.ok:
        raise Exception(f"Chapa initialize failed ({resp.status_code}): {resp.text}")
    return resp.json()


def verify_transaction(tx_ref):
    """Authoritative status check. Always call before granting value."""
    url = f"{settings.CHAPA_BASE_URL}/transaction/verify/{tx_ref}"
    resp = requests.get(url, headers=_headers(), timeout=10)
    resp.raise_for_status()
    return resp.json()
