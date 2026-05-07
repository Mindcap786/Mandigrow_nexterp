"""
Data fix: Find and remove duplicate ₹2,114 cheque payment for abid.

The user created a cheque payment of ₹2,114 on 6th May as "clear later" with
cheque_date = 8th May.  Due to the old bug (instant submit of pending cheques),
it was submitted immediately with clearance_date = 8th May.  When the code was
fixed, a second entry was created.  This script finds the duplicate and cancels it.

Run: bench --site mandigrow.localhost execute mandigrow.fix_duplicate_cheque.fix
"""
import frappe
from frappe.utils import flt


@frappe.whitelist()
def fix():
    company = None
    org = frappe.get_all("Mandi Organization", limit=1)
    if org:
        company = frappe.db.get_value("Mandi Organization", org[0].name, "erp_company")

    if not company:
        print("❌ No company found")
        return

    # Find all JEs for ₹2,114 that reference abid / eq501el6hb
    dupes = frappe.db.sql("""
        SELECT je.name, je.posting_date, je.cheque_no, je.cheque_date,
               je.clearance_date, je.docstatus, je.total_debit, je.creation,
               je.user_remark,
               MAX(jea.party) AS party
          FROM `tabJournal Entry` je
          JOIN `tabJournal Entry Account` jea ON jea.parent = je.name
         WHERE je.company = %s
           AND je.total_debit BETWEEN 2113 AND 2115
           AND (jea.party LIKE '%%abid%%' OR jea.party LIKE '%%eq501el6hb%%'
                OR je.user_remark LIKE '%%abid%%')
         GROUP BY je.name
         ORDER BY je.creation ASC
    """, (company,), as_dict=True)

    print(f"\n📋 Found {len(dupes)} JE(s) for ₹2,114 linked to abid:\n")
    for d in dupes:
        print(f"  {d.name}  |  posted={d.posting_date}  |  cheque_date={d.cheque_date}  "
              f"|  cleared={d.clearance_date}  |  docstatus={d.docstatus}  "
              f"|  created={d.creation}  |  party={d.party}")
        print(f"    remark: {d.user_remark}")
        print()

    if len(dupes) <= 1:
        print("✅ No duplicates found — only 1 entry exists.  Nothing to fix.")
        return

    # The FIRST entry (oldest creation) is the original.  Cancel the duplicates.
    original = dupes[0]
    print(f"\n🔒 Keeping original: {original.name} (created {original.creation})")

    for d in dupes[1:]:
        print(f"🗑️  Will cancel duplicate: {d.name} (created {d.creation})")

    print("\n⚠️  DRY RUN — run `fix_and_commit()` to actually cancel the duplicates.")


@frappe.whitelist()
def fix_and_commit():
    """Actually cancel the duplicate entries."""
    company = None
    org = frappe.get_all("Mandi Organization", limit=1)
    if org:
        company = frappe.db.get_value("Mandi Organization", org[0].name, "erp_company")

    if not company:
        print("❌ No company found")
        return

    dupes = frappe.db.sql("""
        SELECT je.name, je.docstatus, je.creation
          FROM `tabJournal Entry` je
          JOIN `tabJournal Entry Account` jea ON jea.parent = je.name
         WHERE je.company = %s
           AND je.total_debit BETWEEN 2113 AND 2115
           AND (jea.party LIKE '%%abid%%' OR jea.party LIKE '%%eq501el6hb%%'
                OR je.user_remark LIKE '%%abid%%')
         GROUP BY je.name
         ORDER BY je.creation ASC
    """, (company,), as_dict=True)

    if len(dupes) <= 1:
        print("✅ No duplicates — nothing to do.")
        return

    original = dupes[0]
    print(f"🔒 Keeping: {original.name}")

    for d in dupes[1:]:
        doc = frappe.get_doc("Journal Entry", d.name)
        if doc.docstatus == 0:
            # Draft — delete
            doc.delete(ignore_permissions=True)
            print(f"🗑️  Deleted draft {d.name}")
        elif doc.docstatus == 1:
            # Submitted — cancel
            doc.flags.ignore_permissions = True
            doc.cancel()
            print(f"🗑️  Cancelled {d.name}")
        else:
            print(f"⏭️  Already cancelled: {d.name}")

    frappe.db.commit()
    print("\n✅ Done — duplicate entries removed. Balances should now be correct.")
