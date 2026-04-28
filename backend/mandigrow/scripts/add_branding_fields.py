import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def execute():
    fields = {
        "Mandi Organization": [
            {"fieldname": "slug", "label": "Slug", "fieldtype": "Data"},
            {"fieldname": "pan_number", "label": "PAN Number", "fieldtype": "Data"},
            {"fieldname": "email", "label": "Email", "fieldtype": "Data"},
            {"fieldname": "whatsapp_number", "label": "WhatsApp Number", "fieldtype": "Data"},
            {"fieldname": "website", "label": "Website", "fieldtype": "Data"},
            {"fieldname": "address_line1", "label": "Address Line 1", "fieldtype": "Data"},
            {"fieldname": "address_line2", "label": "Address Line 2", "fieldtype": "Data"},
            {"fieldname": "pincode", "label": "Pincode", "fieldtype": "Data"},
            {"fieldname": "logo_url", "label": "Logo URL", "fieldtype": "Data"},
            {"fieldname": "brand_color_secondary", "label": "Brand Color Secondary", "fieldtype": "Color"},
            {"fieldname": "header_color", "label": "Header Color", "fieldtype": "Color"},
            {"fieldname": "footer_text", "label": "Footer Text", "fieldtype": "Data"},
            {"fieldname": "custom_domain", "label": "Custom Domain", "fieldtype": "Data"},
            {"fieldname": "currency_code", "label": "Currency Code", "fieldtype": "Data"},
            {"fieldname": "locale", "label": "Locale", "fieldtype": "Data"},
            {"fieldname": "timezone", "label": "Timezone", "fieldtype": "Data"},
        ]
    }
    create_custom_fields(fields)
    print("Added missing branding fields to Mandi Organization")
