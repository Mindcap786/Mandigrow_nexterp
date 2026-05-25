import frappe

@frappe.whitelist(allow_guest=True)
def debug_get_party_balances(p_org_id=None, filter_type='all', sub_filter='all', search_query='', limit_start=0, limit_page_length=10):
    company = None
    if p_org_id:
        company = frappe.db.get_value("Mandi Organization", p_org_id, "erp_company")
    
    org_id = p_org_id

    query = """
        SELECT 
            c.name as contact_id, 
            c.full_name as contact_name, 
            c.contact_type,
            c.city as contact_city,
            c.phone as contact_phone,
            COALESCE(
                (SELECT SUM(gl.debit - gl.credit)
                 FROM `tabGL Entry` gl
                 LEFT JOIN `tabJournal Entry` je ON gl.voucher_no = je.name AND gl.voucher_type = 'Journal Entry'
                 WHERE gl.is_cancelled = 0
                   AND gl.company = %(company)s
                   AND (
                       (gl.party_type = 'Supplier' AND gl.party = c.supplier)
                       OR (gl.party_type = 'Customer' AND gl.party = c.customer)
                       OR (gl.party_type IN ('Supplier', 'Customer') AND gl.party = c.name)
                   )
                   AND COALESCE(je.clearance_date, gl.posting_date) <= %(today)s
                ), 0
            ) as net_balance
        FROM `tabMandi Contact` c
        WHERE c.full_name != 'Walk-in Buyer'
    """
    params = {"company": company, "today": frappe.utils.today()}

    if org_id:
        query += " AND c.organization_id = %(org_id)s"
        params["org_id"] = org_id

    if filter_type != 'all':
        query += " AND c.contact_type = %(filter_type)s"
        params["filter_type"] = filter_type

    if search_query:
        query += " AND (c.full_name LIKE %(search)s OR c.name LIKE %(search)s)"
        params["search"] = f"%{search_query}%"

    if sub_filter == 'receivable':
        query = f"SELECT * FROM ({query}) AS sub WHERE sub.net_balance > 0.005"
    elif sub_filter == 'payable':
        query = f"SELECT * FROM ({query}) AS sub WHERE sub.net_balance < -0.005"

    count_query = f"SELECT COUNT(*) FROM ({query}) AS cnt"
    count_row = frappe.db.sql(count_query, params)
    count = count_row[0][0] if count_row else 0

    if sub_filter in ('receivable', 'payable'):
        query += " ORDER BY contact_name ASC LIMIT %(limit)s OFFSET %(offset)s"
    else:
        query += " ORDER BY c.full_name ASC LIMIT %(limit)s OFFSET %(offset)s"
        
    params["limit"] = limit_page_length
    params["offset"] = limit_start

    return {"query": query, "params": params, "count": count, "data": frappe.db.sql(query, params, as_dict=True)}
