
import frappe
import sys

def run_repair(site_name):
    print(f"Initializing Frappe for site: {site_name}")
    try:
        frappe.init(site=site_name, sites_path="sites")
        frappe.connect()
        
        from mandigrow.api import repair_erp_integrity
        result = repair_erp_integrity()
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        frappe.destroy()

if __name__ == "__main__":
    site = sys.argv[1] if len(sys.argv) > 1 else "mandigrow.localhost"
    run_repair(site)
