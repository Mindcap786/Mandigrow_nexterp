import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def create_mandi_organization_doctype():
    if not frappe.db.exists("DocType", "Mandi Organization"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Mandigrow",
            "name": "Mandi Organization",
            "custom": 1,
            "istable": 0,
            "naming_rule": "Expression",
            "autoname": "ORG-.#####",
            "fields": [
                {"fieldname": "organization_name", "label": "Organization Name", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
                {"fieldname": "subscription_tier", "label": "Subscription Tier", "fieldtype": "Select", "options": "starter\nprofessional\nenterprise", "default": "starter"},
                {"fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "trial\nactive\ngrace_period\nsuspended\nexpired", "default": "trial"},
                {"fieldname": "trial_ends_at", "label": "Trial Ends At", "fieldtype": "Datetime"},
                {"fieldname": "is_active", "label": "Is Active", "fieldtype": "Check", "default": 1},
                {"fieldname": "brand_color", "label": "Brand Color", "fieldtype": "Color", "default": "#10b981"},
                {"fieldname": "address", "label": "Address", "fieldtype": "Text"},
                {"fieldname": "city", "label": "City", "fieldtype": "Data"},
                {"fieldname": "gstin", "label": "GSTIN", "fieldtype": "Data"},
                {"fieldname": "phone", "label": "Phone", "fieldtype": "Data"}
            ],
            "permissions": [{"role": "System Manager", "read": 1, "write": 1, "create": 1}]
        })
        doc.insert(ignore_permissions=True)
        print("Created Mandi Organization DocType")

def customize_user_doctype():
    custom_fields = {
        "User": [
            {
                "fieldname": "mandi_organization",
                "label": "Mandi Organization",
                "fieldtype": "Link",
                "options": "Mandi Organization",
                "insert_after": "role_profile_name"
            },
            {
                "fieldname": "role_type",
                "label": "Role Type",
                "fieldtype": "Select",
                "options": "super_admin\nadmin\nmanager\nclerk",
                "default": "admin",
                "insert_after": "mandi_organization"
            },
            {
                "fieldname": "business_domain",
                "label": "Business Domain",
                "fieldtype": "Select",
                "options": "mandi\nwholesaler",
                "default": "mandi",
                "insert_after": "role_type"
            }
        ]
    }
    create_custom_fields(custom_fields)
    print("Added custom fields to User DocType")

def run():
    create_mandi_organization_doctype()
    customize_user_doctype()
    frappe.db.commit()
