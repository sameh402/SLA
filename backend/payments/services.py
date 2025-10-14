

import requests
from django.conf import settings

def create_tap_charge(amount, currency, customer_name, customer_email, redirect_url, description="Course Payment"):
    headers = {
        "Authorization": f"Bearer {settings.TAP_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "amount": str(amount),
        "currency": currency,
        "threeDSecure": True,
        "save_card": False,
        "description": description,
        "statement_descriptor": "SLA Edu",
        "customer": {
            "first_name": customer_name,
            "email": customer_email,
        },
        "source": {"id": "src_all"},
        "redirect": {"url": redirect_url},
    }

    response = requests.post(f"{settings.TAP_API_URL}/charges", json=payload, headers=headers)
    return response
