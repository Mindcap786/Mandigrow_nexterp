import re

with open('next_app/components/crates/crate-tracker-view.tsx', 'r') as f:
    content = f.read()

content = content.replace("is_overdue: boolean; outstanding_value: number; charge_to_ledger: boolean", "is_overdue: boolean; outstanding_value: number; charge_to_ledger: boolean; is_erp_registered?: boolean")

content = content.replace("totalValue, hasOverdue }", "totalValue, hasOverdue, is_erp_registered: first?.is_erp_registered }")

replacement_button = """
                                    <Button size="sm" onClick={() => openReceive(group.id)} variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5">
                                        <ArrowDownLeft className="w-3.5 h-3.5" /> Receive Crates
                                    </Button>
                                    {group.is_erp_registered && (
                                    <Button size="sm" onClick={() => openCharge(group.id)} variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold gap-1.5">
                                        <IndianRupee className="w-3.5 h-3.5" /> Charge to Ledger
                                    </Button>
                                    )}
"""

target_button = """
                                    <Button size="sm" onClick={() => openReceive(group.id)} variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5">
                                        <ArrowDownLeft className="w-3.5 h-3.5" /> Receive Crates
                                    </Button>
                                    <Button size="sm" onClick={() => openCharge(group.id)} variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 font-bold gap-1.5">
                                        <IndianRupee className="w-3.5 h-3.5" /> Charge to Ledger
                                    </Button>
"""

content = content.replace(target_button.strip(), replacement_button.strip())

with open('next_app/components/crates/crate-tracker-view.tsx', 'w') as f:
    f.write(content)

