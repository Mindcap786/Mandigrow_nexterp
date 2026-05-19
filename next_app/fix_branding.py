import os
import re

directory = "/Users/shauddin/frappe-bench/mandigrow-production-repo/next_app/components"

patterns = [
    (r"\|\|\s*'Powered by MindT Corporation'", ""),
    (r'\|\|\s*"Powered by MindT Corporation"', ""),
    (r"\|\|\s*'Presented by MandiGrow'", ""),
    (r'\|\|\s*"Presented by MandiGrow"', ""),
    (r"\|\|\s*'Developed by MindT Solutions'", ""),
    (r'\|\|\s*"Developed by MindT Solutions"', ""),
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r") as f:
                content = f.read()
            
            new_content = content
            for p, r in patterns:
                new_content = re.sub(p, r, new_content)
                
            if new_content != content:
                with open(filepath, "w") as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
