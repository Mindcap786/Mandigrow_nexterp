import frappe


DEFAULT_COMPANY_NAME = "MandiGrow Enterprise"


def get_default_company():
    # If we are in an API request, use the user's linked company
    from mandigrow.api import _get_user_company
    try:
        user_company = _get_user_company()
        if user_company and frappe.db.exists("Company", user_company):
            return user_company
    except Exception:
        pass

    company = frappe.db.get_single_value("Global Defaults", "default_company")
    if company and frappe.db.exists("Company", company):
        return company

    company = frappe.db.get_value("Company", {}, "name")
    return company or DEFAULT_COMPANY_NAME


def _ensure_party_type(party_type, account_type):
    existing_account_type = frappe.db.get_value("Party Type", party_type, "account_type")
    if existing_account_type:
        if existing_account_type != account_type:
            frappe.db.set_value(
                "Party Type",
                party_type,
                "account_type",
                account_type,
                update_modified=False,
            )
        return party_type

    frappe.get_doc(
        {
            "doctype": "Party Type",
            "party_type": party_type,
            "account_type": account_type,
        }
    ).insert(ignore_permissions=True)
    return party_type


def _find_company_account(company, account_type):
    account = frappe.db.get_value(
        "Account",
        {"company": company, "account_type": account_type, "is_group": 0},
        "name",
    )
    if account:
        return account

    return frappe.db.get_value(
        "Account",
        {"account_type": account_type, "is_group": 0},
        "name",
    )


def _expected_report_type(root_type):
    if root_type in ("Asset", "Liability", "Equity"):
        return "Balance Sheet"
    if root_type in ("Income", "Expense"):
        return "Profit and Loss"
    return None


def _ensure_account_reporting(account_name):
    if not account_name or not frappe.db.exists("Account", account_name):
        return

    account = frappe.db.get_value(
        "Account",
        account_name,
        ["root_type", "report_type"],
        as_dict=True,
    )
    expected = _expected_report_type((account or {}).get("root_type"))
    if expected and account and account.get("report_type") != expected:
        frappe.db.set_value(
            "Account",
            account_name,
            "report_type",
            expected,
            update_modified=False,
        )


def ensure_mandi_accounts(company=None):
    company = company or get_default_company()
    abbr = frappe.db.get_value("Company", company, "abbr") or company
    
    def ensure_acc(name, acc_type, parent_type_hint):
        full_name = f"{name} - {abbr}"
        if frappe.db.exists("Account", full_name):
            return full_name
        
        # Try finding parent by account_type or name hint
        parent = frappe.db.get_value("Account", {"account_type": parent_type_hint, "is_group": 1, "company": company}, "name")
        if not parent:
            parent = frappe.db.get_value("Account", {"account_name": ["like", f"%{parent_type_hint}%"], "is_group": 1, "company": company}, "name")
        
        if not parent:
            # Root fallback
            root_type = "Asset" if parent_type_hint in ("Receivable", "Stock", "Cash", "Bank") else "Income" if parent_type_hint == "Income" else "Liability"
            parent = frappe.db.get_value("Account", {"is_group": 1, "root_type": root_type, "company": company}, "name")

        if parent:
            try:
                frappe.get_doc({
                    "doctype": "Account",
                    "account_name": name,
                    "parent_account": parent,
                    "company": company,
                    "account_type": "Income Account" if acc_type == "Income" else acc_type
                }).insert(ignore_permissions=True)
                return full_name
            except Exception as e:
                frappe.log_error(f"Failed to create Mandi Account {full_name}: {str(e)}")
        return None

    # Essential MandiGrow accounts
    ensure_acc("Commission Income", "Income Account", "Income")
    ensure_acc("Debtors", "Receivable", "Receivable")
    ensure_acc("Creditors", "Payable", "Payable")
    stock_acc = ensure_acc("Stock In Hand", "Stock", "Stock")
    if stock_acc:
        # Relax ERPNext restriction to allow Journal Entry postings
        frappe.db.set_value("Account", stock_acc, "account_type", "Asset", update_modified=False)
    ensure_acc("Cash", "Cash", "Cash")

def ensure_mandi_locations(company=None):
    from mandigrow.api import _get_user_org
    org_id = _get_user_org()
    if not org_id:
        return

    # Check if this organization already has locations or transaction history
    if frappe.db.exists("Mandi Storage Location", {"organization_id": org_id}):
        return
    
    if frappe.db.exists("Mandi Arrival", {"organization_id": org_id}):
        # If they have arrivals but no locations, they might have deleted their locations
        # intentionally. We should respect that and not re-seed.
        return

    try:
        # Create standard default points as real records
        defaults = [
            {"name": "Mandi", "type": "Warehouse"},
            {"name": "Cold Storage", "type": "Cold Storage"}
        ]
        for d in defaults:
            frappe.get_doc({
                "doctype": "Mandi Storage Location",
                "location_name": d["name"],
                "location_type": d["type"],
                "organization_id": org_id,
                "is_active": 1
            }).insert(ignore_permissions=True)
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Failed to seed default locations for {org_id}: {str(e)}")

def ensure_fiscal_years(company=None):
    from frappe.utils import getdate
    
    company = company or get_default_company()
    current_date = getdate()
    
    # MandiGrow uses April 1st as the start of the fiscal year
    if current_date.month < 4:
        start_year = current_date.year - 1
    else:
        start_year = current_date.year
        
    # Ensure a 3-year window: Previous, Current, and Next
    for i in range(-1, 2):
        s_year = start_year + i
        e_year = s_year + 1
        fy_name = f"{s_year}-{e_year}"
        start_date = f"{s_year}-04-01"
        end_date = f"{e_year}-03-31"
        
        if not frappe.db.exists("Fiscal Year", fy_name):
            try:
                frappe.get_doc({
                    "doctype": "Fiscal Year",
                    "year": fy_name,
                    "year_start_date": start_date,
                    "year_end_date": end_date,
                }).insert(ignore_permissions=True)
            except Exception:
                pass
        
        # Ensure company is linked to this Fiscal Year (for SaaS isolation)
        fy_doc = frappe.get_doc("Fiscal Year", fy_name)
        if hasattr(fy_doc, "companies"):
            if not any(c.company == company for c in fy_doc.companies):
                fy_doc.append("companies", {"company": company})
                fy_doc.save(ignore_permissions=True)
    
    frappe.db.commit()

def ensure_cost_center(company=None):
    company = company or get_default_company()
    abbr = frappe.db.get_value("Company", company, "abbr") or company
    
    # 1. Ensure a Root Group Cost Center exists (ERPNext requirement)
    root_cc = frappe.db.get_value("Cost Center", {"company": company, "is_group": 1}, "name")
    if not root_cc:
        try:
            root_doc = frappe.get_doc({
                "doctype": "Cost Center",
                "cost_center_name": company,
                "company": company,
                "is_group": 1,
                "parent_cost_center": None
            })
            root_doc.flags.ignore_mandatory = True
            root_doc.insert(ignore_permissions=True)
            root_cc = root_doc.name
        except Exception as e:
            frappe.log_error(f"Root Cost Center Setup Failed for {company}: {str(e)}")
    
    # 2. Ensure a "Main" leaf Cost Center exists for actual transactions
    cc_name = f"Main - {abbr}"
    if not frappe.db.exists("Cost Center", cc_name):
        try:
            frappe.get_doc({
                "doctype": "Cost Center",
                "cost_center_name": "Main",
                "company": company,
                "parent_cost_center": root_cc,
                "is_group": 0
            }).insert(ignore_permissions=True)
        except Exception as e:
            # Fallback: if Main fails, we'll try to use the root if it's not a group (unlikely)
            frappe.log_error(f"Main Cost Center Setup Failed for {company}: {str(e)}")

    # 3. Set the default Cost Center for the Company to prevent 'Required' errors in UI
    frappe.db.set_value("Company", company, "cost_center", cc_name, update_modified=False)
    frappe.db.commit()

def ensure_company_party_defaults(company=None):
    company = company or get_default_company()

    # Ensure Mandi Chart of Accounts structure
    ensure_mandi_accounts(company)
    
    # Ensure Mandi Storage Infrastructure
    ensure_mandi_locations(company)

    # Ensure active Fiscal Years cover the current date
    ensure_fiscal_years(company)

    # Ensure Default Cost Center exists (required for Income/Expense accounts)
    ensure_cost_center(company)

    _ensure_party_type("Supplier", "Payable")
    _ensure_party_type("Customer", "Receivable")

    payable_account = _find_company_account(company, "Payable")
    receivable_account = _find_company_account(company, "Receivable")

    _ensure_account_reporting(payable_account)
    _ensure_account_reporting(receivable_account)

    current_payable = frappe.db.get_value("Company", company, "default_payable_account")
    current_receivable = frappe.db.get_value("Company", company, "default_receivable_account")

    if payable_account and (not current_payable or not frappe.db.exists("Account", current_payable)):
        frappe.db.set_value(
            "Company",
            company,
            "default_payable_account",
            payable_account,
            update_modified=False,
        )

    if receivable_account and (
        not current_receivable or not frappe.db.exists("Account", current_receivable)
    ):
        frappe.db.set_value(
            "Company",
            company,
            "default_receivable_account",
            receivable_account,
            update_modified=False,
        )

    return {
        "company": company,
        "default_payable_account": payable_account,
        "default_receivable_account": receivable_account,
    }


def _get_contact(contact_id):
    if not contact_id or not frappe.db.exists("Mandi Contact", contact_id):
        return None

    return frappe.get_doc("Mandi Contact", contact_id)


def _resolve_supplier_group(contact_type=None):
    preferred_group = "External Suppliers" if contact_type == "supplier" else "Mandi Farmers"
    return (
        frappe.db.get_value("Supplier Group", preferred_group, "name")
        or frappe.db.get_value("Supplier Group", {"is_group": 0}, "name")
        or frappe.db.get_value("Supplier Group", {}, "name")
    )


def _resolve_customer_group():
    return (
        frappe.db.get_value("Customer Group", "Mandi Buyers", "name")
        or frappe.db.get_value("Customer Group", {"is_group": 0}, "name")
        or frappe.db.get_value("Customer Group", {}, "name")
    )


def _resolve_territory():
    return (
        frappe.db.get_value("Territory", "All Territories", "name")
        or frappe.db.get_value("Territory", {"is_group": 0}, "name")
        or frappe.db.get_value("Territory", {}, "name")
    )


def ensure_supplier_for_contact(contact_id, company=None):
    company = company or get_default_company()
    ensure_company_party_defaults(company)

    contact = _get_contact(contact_id)
    if contact and contact.supplier and frappe.db.exists("Supplier", contact.supplier):
        return contact.supplier

    supplier_name = None
    contact_type = "farmer"
    mobile_no = None

    if contact:
        supplier_name = contact.full_name or contact.name
        contact_type = contact.contact_type or "farmer"
        mobile_no = contact.phone
        org_id = contact.organization_id
    else:
        supplier_name = str(contact_id or "Unknown Supplier")
        org_id = frappe.db.get_value("Mandi Contact", contact_id, "organization_id")

    # Prefix the supplier name with organization_id to ensure absolute isolation
    if org_id:
        supplier_name = f"{supplier_name} ({org_id})"
    else:
        abbr = frappe.db.get_value("Company", company, "abbr") or "MG"
        supplier_name = f"{supplier_name} ({abbr})"

    supplier = frappe.db.get_value("Supplier", {"supplier_name": supplier_name}, "name")
    if not supplier and frappe.db.exists("Supplier", supplier_name):
        supplier = supplier_name

    if not supplier:
        supplier_data = {
            "doctype": "Supplier",
            "supplier_name": supplier_name,
            "supplier_type": "Company",
            "mobile_no": mobile_no,
        }
        supplier_group = _resolve_supplier_group(contact_type)
        if supplier_group:
            supplier_data["supplier_group"] = supplier_group

        supplier = frappe.get_doc(supplier_data)
        supplier.insert(ignore_permissions=True)
        supplier = supplier.name

    if contact and contact.supplier != supplier:
        frappe.db.set_value("Mandi Contact", contact.name, "supplier", supplier, update_modified=False)

    return supplier


def ensure_customer_for_contact(contact_id, company=None):
    company = company or get_default_company()
    ensure_company_party_defaults(company)

    contact = _get_contact(contact_id)
    if contact and contact.customer and frappe.db.exists("Customer", contact.customer):
        return contact.customer

    customer_name = None
    mobile_no = None

    if contact:
        customer_name = contact.full_name or contact.name
        mobile_no = contact.phone
        org_id = contact.organization_id
    else:
        customer_name = str(contact_id or "Walk-in Customer")
        org_id = frappe.db.get_value("Mandi Contact", contact_id, "organization_id")

    # Prefix the customer name with organization_id to ensure absolute isolation
    if org_id:
        customer_name = f"{customer_name} ({org_id})"
    else:
        abbr = frappe.db.get_value("Company", company, "abbr") or "MG"
        customer_name = f"{customer_name} ({abbr})"

    customer = frappe.db.get_value("Customer", {"customer_name": customer_name}, "name")
    if not customer and frappe.db.exists("Customer", customer_name):
        customer = customer_name

    if not customer:
        customer_data = {
            "doctype": "Customer",
            "customer_name": customer_name,
            "customer_type": "Company",
            "mobile_no": mobile_no,
        }
        customer_group = _resolve_customer_group()
        territory = _resolve_territory()

        if customer_group:
            customer_data["customer_group"] = customer_group
        if territory:
            customer_data["territory"] = territory

        customer = frappe.get_doc(customer_data)
        customer.insert(ignore_permissions=True)
        customer = customer.name

    if contact and contact.customer != customer:
        frappe.db.set_value("Mandi Contact", contact.name, "customer", customer, update_modified=False)

    return customer


def resolve_uom(preferred_uom=None):
    if preferred_uom and frappe.db.exists("UOM", preferred_uom):
        return preferred_uom

    return frappe.db.get_value("UOM", {}, "name") or preferred_uom or "Nos"


def ensure_item(item_code, preferred_uom=None, is_stock_item=True, company=None):
    company = company or get_default_company()
    item_code = item_code or "Mandi Produce"
    
    # Check if item exists exactly as provided
    if frappe.db.exists("Item", item_code):
        scoped_item_code = item_code
    else:
        # Prefix item code with company abbreviation for SaaS isolation
        abbr = frappe.db.get_value("Company", company, "abbr") or "MG"
        scoped_item_code = f"{abbr}-{item_code}"

    if not frappe.db.exists("Item", scoped_item_code):
        item_group = (
            frappe.db.get_value("Item Group", "Commodities", "name")
            or frappe.db.get_value("Item Group", {"is_group": 0}, "name")
            or frappe.db.get_value("Item Group", {}, "name")
        )

        item = frappe.get_doc(
            {
                "doctype": "Item",
                "item_code": scoped_item_code,
                "item_name": item_code,
                "item_group": item_group,
                "stock_uom": resolve_uom(preferred_uom),
                "is_stock_item": 1 if is_stock_item else 0,
            }
        )
        item.insert(ignore_permissions=True)
    
    # Ensure preferred UOM is mapped on the Item so transactions don't fail
    if preferred_uom:
        uom_name = resolve_uom(preferred_uom)
        item_doc = frappe.get_doc("Item", scoped_item_code)
        if item_doc.stock_uom != uom_name:
            has_uom = any(row.uom == uom_name for row in item_doc.uoms)
            if not has_uom:
                if not frappe.db.exists("UOM", uom_name):
                    frappe.get_doc({
                        "doctype": "UOM",
                        "uom_name": uom_name,
                        "must_be_whole_number": 0
                    }).insert(ignore_permissions=True)
                item_doc.append("uoms", {
                    "uom": uom_name,
                    "conversion_factor": 1.0
                })
                item_doc.flags.ignore_permissions = True
                item_doc.save()

    return scoped_item_code

def get_default_warehouse(company=None):
    company = company or get_default_company()
    preferred_name = f"Stores - {company}"

    return (
        frappe.db.get_value(
            "Warehouse",
            {"name": preferred_name, "is_group": 0},
            "name",
        )
        or frappe.db.get_value(
            "Warehouse",
            {"company": company, "is_group": 0},
            "name",
        )
        or frappe.db.get_value("Warehouse", {"is_group": 0}, "name")
    )
