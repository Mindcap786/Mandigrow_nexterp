import json

path = '/Users/shauddin/frappe-bench/apps/mandigrow/mandigrow/mandigrow/doctype/mandi_lot/mandi_lot.json'
with open(path, 'r') as f:
    data = json.load(f)

# check if short_code already exists
if not any(f.get('fieldname') == 'short_code' for f in data['fields']):
    # Find index of lot_code
    idx = next((i for i, f in enumerate(data['fields']) if f.get('fieldname') == 'lot_code'), -1)
    
    new_field = {
        "fieldname": "short_code",
        "fieldtype": "Data",
        "label": "Short Code",
        "unique": 1,
        "read_only": 1
    }
    
    if idx != -1:
        data['fields'].insert(idx + 1, new_field)
    else:
        data['fields'].append(new_field)
        
    with open(path, 'w') as f:
        json.dump(data, f, indent=1)
        # Adding trailing newline that frappe typically likes
        f.write("\n")
    print("Added short_code to mandi_lot.json")
else:
    print("short_code already exists")
