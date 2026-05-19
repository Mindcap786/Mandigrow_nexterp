import json

path = '/Users/shauddin/frappe-bench/mandigrow-production-repo/next_app/inventory_data.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add missing indian fruits
missing_fruits = [
    {"name": "Sweet Orange", "local_name": "मोसम्बी", "category": "Citrus"},
    {"name": "Plum", "local_name": "आलूबुखारा", "category": "Exotic"},
    {"name": "Peach", "local_name": "आड़ू", "category": "Exotic"},
]
for fruit in missing_fruits:
    if not any(f['name'] == fruit['name'] for f in data['fruits']):
        data['fruits'].append(fruit)

# Add missing indian vegetables
missing_veggies = [
    {"name": "Ladyfinger", "local_name": "भिंडी", "category": "Nightshade"},
    {"name": "Taro Root", "local_name": "अरबी", "category": "Root"},
    {"name": "Pointed Gourd", "local_name": "परवल", "category": "Gourd"},
    {"name": "Ridge Gourd", "local_name": "तोरई", "category": "Gourd"},
    {"name": "Sponge Gourd", "local_name": "नेनुआ", "category": "Gourd"},
    {"name": "Cluster Beans", "local_name": "ग्वार फली", "category": "Legumes"},
    {"name": "Drumstick", "local_name": "सहजन", "category": "Exotic"},
    {"name": "Ivy Gourd", "local_name": "कुंदरू", "category": "Gourd"},
    {"name": "Ash Gourd", "local_name": "पेठा", "category": "Gourd"},
]
for veg in missing_veggies:
    if not any(v['name'] == veg['name'] for v in data['vegetables']):
        data['vegetables'].append(veg)

# Clean up broken "image" strings like "3d_mango_aesthetic" from json (they aren't needed anyway since item-dialog uses getIntelligentVisual)
for f in data['fruits'] + data['vegetables']:
    if 'image' in f:
        del f['image']

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)
