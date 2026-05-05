import re

file_path = "next_app/components/finance/day-book.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add exports to necessary functions
funcs_to_export = [
    "TX_TYPE_FLOW_MAP",
    "inferVoucherFlow",
    "extractVoucherBillNo",
    "getDuplicateSaleKey",
    "getSaleCanonicalScore",
    "shouldHideDuplicateSaleEntry",
    "isSaleSettlementReceiptEntry",
    "getSaleSettlementKey",
    "isSaleReceivableEntry",
    "buildSaleSettlementMap",
    "getSaleSettlementStatus",
    "getScenarioStyles",
    "getPurchaseSettlementKey",
    "getEntryGroupKey",
    "getGroupRepresentative",
    "isLiquidAccountEntry",
    "isInstantSettlementEntry",
    "isPendingChequeEntry",
    "shouldHideDirectPurchaseCost",
    "shouldHideNonContactCounterLeg",
    "shouldHideExpenseSettlementLeg",
    "getPurchaseSettlementTotals",
    "shouldHideFullySettledPurchasePayableLeg",
    "getPurchasePaidAmount",
    "isAdvanceSettlementEntry",
    "formatArrivalLotLabel",
    "formatArrivalLotPrefix",
    "getTransactionScenario",
    "extractBillNo",
    "getEntryDescription"
]

for func in funcs_to_export:
    content = re.sub(rf"const {func} = ", rf"export const {func} = ", content)

# 2. Extract the useMemo body into calculateDaybookStats
# We need to find `const { transactionGroups, summary } = useMemo(() => {`
start_str = "    const { transactionGroups, summary } = useMemo(() => {"
end_str = "    }, [rawData, viewMode, t]);"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

usememo_block = content[start_idx:end_idx]
body_match = re.search(r"useMemo\(\(\) => \{(.*?)\s*\}, \[rawData, viewMode, t\]\);", usememo_block, re.DOTALL)

if body_match:
    body = body_match.group(1)
    
    new_func = f"""
export function calculateDaybookStats(rawData: any, viewMode: string, t: any) {{
{body}
}}
"""
    
    new_usememo = f"""
    const {{ transactionGroups, summary }} = useMemo(() => {{
        return calculateDaybookStats(rawData, viewMode, t);
    }}, [rawData, viewMode, t]);
"""

    content = content.replace(usememo_block, new_func + new_usememo)

with open(file_path, "w") as f:
    f.write(content)
print("Refactor successful")
