
import frappe
import sys
import os

def clear_cache(site_name):
    print(f"Clearing cache for site: {site_name}")
    # Set CWD to frappe-bench to ensure relative paths work or use absolute
    bench_path = "/Users/shauddin/frappe-bench"
    os.chdir(bench_path)
    
    try:
        frappe.init(site=site_name, sites_path="sites")
        frappe.connect()
        frappe.clear_cache()
        frappe.db.commit()
        print("Cache cleared successfully.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        frappe.destroy()

if __name__ == "__main__":
    site = sys.argv[1] if len(sys.argv) > 1 else "mandigrow.localhost"
    clear_cache(site)
