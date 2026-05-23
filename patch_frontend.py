import re

with open('next_app/components/crates/crate-tracker-view.tsx', 'r') as f:
    content = f.read()

content = content.replace("is_erp_registered: first?.is_erp_registered }", "party_id: first?.party_id }")
content = content.replace("{group.is_erp_registered && (", "{group.party_id && (")
content = content.replace("is_erp_registered?: boolean", "") # remove it from IssueRow if any

with open('next_app/components/crates/crate-tracker-view.tsx', 'w') as f:
    f.write(content)

