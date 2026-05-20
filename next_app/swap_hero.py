import re

# Read HomePageShell.tsx to extract the new Hero section
with open('components/home/HomePageShell.tsx', 'r') as f:
    shell_content = f.read()

# Extract from <main className="relative pt-40... down to the end of Feature Strip
start_str = '            {/* Hero Section */}'
end_str = '            {/* Features Grid */}'
start_idx = shell_content.find(start_str)
end_idx = shell_content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries in HomePageShell.tsx")
    exit(1)

new_hero_block = shell_content[start_idx:end_idx]

# Read app/page.tsx
with open('app/page.tsx', 'r') as f:
    page_content = f.read()

# Find the old Hero block in page.tsx
old_start_str = '            {/* Hero Section — Full-width premium layout */}'
old_end_str = '            {/* Features Grid */}'
old_start_idx = page_content.find(old_start_str)
old_end_idx = page_content.find(old_end_str)

if old_start_idx == -1 or old_end_idx == -1:
    print("Could not find boundaries in app/page.tsx")
    exit(1)

# Swap them
new_page_content = page_content[:old_start_idx] + new_hero_block + page_content[old_end_idx:]

with open('app/page.tsx', 'w') as f:
    f.write(new_page_content)

print("Hero swapped successfully!")
