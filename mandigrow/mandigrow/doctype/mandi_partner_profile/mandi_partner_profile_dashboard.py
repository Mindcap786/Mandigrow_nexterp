from frappe import _

def get_data():
    return {
        "fieldname": "partner",
        "transactions": [
            {
                "label": _("Onboarded Mandis"),
                "items": ["Mandi Organization"]
            },
            {
                "label": _("Earnings"),
                "items": ["Mandi Partner Payout"]
            }
        ]
    }
