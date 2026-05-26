import re
with open('mandigrow/api.py', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "def get_master_data()" in line:
        print("Found at line", i)
