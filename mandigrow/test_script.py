import frappe
from mandigrow.api import get_contacts
import json

def execute():
    res = get_contacts(org_id="ORG-00002")
    print("GET_CONTACTS_RESULT", json.dumps(res, indent=2))
