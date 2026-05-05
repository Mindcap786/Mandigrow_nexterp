import re

file_path = "next_app/components/finance/day-book.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Find the start of DayBook component
daybook_start_idx = content.find("export default function DayBook() {")

# Find the start of calculateDaybookStats
func_start_idx = content.find("export function calculateDaybookStats")

# We need to find the end of calculateDaybookStats. It ends at `return { transactionGroups: processedGroups, summary: newSummary };\n}`
end_str = "    return { transactionGroups: processedGroups, summary: newSummary };\n}"
func_end_idx = content.find(end_str, func_start_idx) + len(end_str)

if func_start_idx != -1 and func_end_idx != -1 and func_start_idx > daybook_start_idx:
    func_body = content[func_start_idx:func_end_idx]
    
    # Remove from inside DayBook
    content = content[:func_start_idx] + content[func_end_idx:]
    
    # Insert before DayBook
    content = content[:daybook_start_idx] + func_body + "\n\n" + content[daybook_start_idx:]
    
    with open(file_path, "w") as f:
        f.write(content)
    print("Function moved successfully")
else:
    print("Could not find function or it's already outside")

