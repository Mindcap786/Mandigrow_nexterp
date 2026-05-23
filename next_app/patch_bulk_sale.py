import re

with open("components/sales/bulk-sale-form.tsx", "r") as f:
    content = f.read()

# Add to formSchema
schema_addition = """        is_igst: z.boolean().default(false),
        discount_percent: z.coerce.number().min(0).max(100).default(0),
        discount_amount: z.coerce.number().min(0).default(0),
        cratesEnabled: z.boolean().default(false).optional(),
        crateCart: z.array(z.object({
            crate_type: z.string(),
            crate_name: z.string(),
            qty: z.coerce.number(),
            rate: z.coerce.number()
        })).optional()
    })).min(1, "Add at least one buyer"),"""
content = re.sub(r'        is_igst: z\.boolean\(\)\.default\(false\),\n        discount_percent: z\.coerce\.number\(\)\.min\(0\)\.max\(100\)\.default\(0\),\n        discount_amount: z\.coerce\.number\(\)\.min\(0\)\.default\(0\),\n    }\)\)\.min\(1, "Add at least one buyer"\),', schema_addition, content)

# Add to defaultValues
default_addition = """                is_igst: false,
                discount_percent: 0,
                discount_amount: 0,
                cratesEnabled: false,
                crateCart: []
            }]"""
content = re.sub(r'                is_igst: false,\n                discount_percent: 0,\n                discount_amount: 0\n            }\]', default_addition, content)

# Add crateTypes state
state_addition = """    const [buyerWarnings, setBuyerWarnings] = useState<Record<string, { overLimit: boolean; balance: number }>>({});
    const [crateTypes, setCrateTypes] = useState<any[]>([]);"""
content = re.sub(r'    const \[buyerWarnings, setBuyerWarnings\] = useState<Record<string, \{ overLimit: boolean; balance: number \}>\>\(\{\}\);', state_addition, content)

# Fetch crateTypes in useEffect
fetch_addition = """                });
            }
            
            try {
                const crateRes = await callApi('mandigrow.api.get_crate_master_data');
                if (crateRes?.crate_types) setCrateTypes(crateRes.crate_types);
            } catch (e) { /* non-fatal */ }
        };"""
content = re.sub(r'                \}\);\n            \}\n        \};\n        fetchMasters\(\);', fetch_addition + '\n        fetchMasters();', content)

# Calculate crateTotal
crate_calc = """            const discount = Number(dist.discount_amount) || 0;
            const crateTotal = (dist.cratesEnabled && dist.crateCart) ? dist.crateCart.reduce((sum: number, c: any) => sum + (c.qty * c.rate), 0) : 0;
            const taxableSubtotal = Math.max(0, subtotal - discount) + crateTotal;"""
content = re.sub(r'            const discount = Number\(dist\.discount_amount\) \|\| 0;\n            const taxableSubtotal = Math\.max\(0, subtotal - discount\);', crate_calc, content)

# Add crateItems payload
payload_addition = """                    buyerGstin: buyerInfo?.gstin || null,
                    isIgst: !!dist.is_igst,
                    crate_items: (dist.cratesEnabled && dist.crateCart?.length > 0) ? dist.crateCart : []
                };"""
content = re.sub(r'                    buyerGstin: buyerInfo\?\.gstin \|\| null,\n                    isIgst: !!dist\.is_igst\n                \};', payload_addition, content)

# Add Crate UI
ui_addition = """                                                                                <div className="space-y-2">
                                                                                    <Label className="text-[10px] font-black uppercase text-slate-500">Discount Amount (₹)</Label>
                                                                                    <Input type="number" step="0.01" {...form.register(`distributions.${index}.discount_amount`)} className="h-11 rounded-xl font-bold bg-white" />
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="space-y-6">
                                                                                <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                                                                    <div className="space-y-0.5">
                                                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
                                                                                            <Package className="w-3.5 h-3.5" /> Include Crates
                                                                                        </Label>
                                                                                        <span className="text-[9px] font-bold text-amber-600/70">Bill crates separately to this buyer</span>
                                                                                    </div>
                                                                                    <Switch
                                                                                        checked={form.watch(`distributions.${index}.cratesEnabled`)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            form.setValue(`distributions.${index}.cratesEnabled`, checked);
                                                                                            if (!checked) form.setValue(`distributions.${index}.crateCart`, []);
                                                                                        }}
                                                                                        className="data-[state=checked]:bg-amber-500"
                                                                                    />
                                                                                </div>
                                                                                
                                                                                {form.watch(`distributions.${index}.cratesEnabled`) && (
                                                                                    <div className="space-y-3 mt-4 border-t border-amber-200/50 pt-3">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className="flex-1">
                                                                                                <select
                                                                                                    className="w-full bg-white border border-amber-200 rounded-lg h-9 text-xs font-bold text-slate-800 px-2 outline-none"
                                                                                                    id={`crate-type-select-${index}`}
                                                                                                    defaultValue=""
                                                                                                >
                                                                                                    <option value="" disabled>Select Crate Type</option>
                                                                                                    {crateTypes.map((c: any) => (
                                                                                                        <option key={c.crate_name} value={c.crate_name}>
                                                                                                            {c.crate_name} (₹{c.sale_rate})
                                                                                                        </option>
                                                                                                    ))}
                                                                                                </select>
                                                                                            </div>
                                                                                            <Input 
                                                                                                id={`crate-qty-input-${index}`} 
                                                                                                type="number" 
                                                                                                placeholder="Qty" 
                                                                                                className="w-16 bg-white border-amber-200 h-9 text-xs font-bold" 
                                                                                            />
                                                                                            <Input 
                                                                                                id={`crate-rate-input-${index}`} 
                                                                                                type="number" 
                                                                                                placeholder="₹ Rate" 
                                                                                                className="w-20 bg-white border-amber-200 h-9 text-xs font-bold" 
                                                                                            />
                                                                                            <Button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const ctSelect = document.getElementById(`crate-type-select-${index}`) as HTMLSelectElement;
                                                                                                    const qtyInput = document.getElementById(`crate-qty-input-${index}`) as HTMLInputElement;
                                                                                                    const rateInput = document.getElementById(`crate-rate-input-${index}`) as HTMLInputElement;
                                                                                                    if (!ctSelect.value || !qtyInput.value || !rateInput.value) return;
                                                                                                    const cart = form.getValues(`distributions.${index}.crateCart`) || [];
                                                                                                    form.setValue(`distributions.${index}.crateCart`, [...cart, {
                                                                                                        crate_type: ctSelect.value,
                                                                                                        crate_name: ctSelect.value,
                                                                                                        qty: parseInt(qtyInput.value),
                                                                                                        rate: parseFloat(rateInput.value)
                                                                                                    }]);
                                                                                                    ctSelect.value = ""; qtyInput.value = ""; rateInput.value = "";
                                                                                                }}
                                                                                                className="h-9 w-9 p-0 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                                                                                            >
                                                                                                <Plus className="w-4 h-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                        
                                                                                        <div className="space-y-2 mt-2">
                                                                                            {(form.watch(`distributions.${index}.crateCart`) || []).map((item, cIdx) => (
                                                                                                <div key={cIdx} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                                                                                                    <span className="text-[10px] font-bold text-amber-900">{item.crate_name}</span>
                                                                                                    <div className="flex items-center gap-3">
                                                                                                        <span className="text-[10px] font-black text-amber-700">{item.qty} × ₹{item.rate}</span>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => {
                                                                                                                const cart = form.getValues(`distributions.${index}.crateCart`) || [];
                                                                                                                form.setValue(`distributions.${index}.crateCart`, cart.filter((_, i) => i !== cIdx));
                                                                                                            }}
                                                                                                            className="text-red-400 hover:text-red-600"
                                                                                                        >
                                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>"""
content = re.sub(r'                                                                                <div className="space-y-2">\n                                                                                    <Label className="text-\[10px\] font-black uppercase text-slate-500">Discount Amount \(₹\)</Label>\n                                                                                    <Input type="number" step="0\.01" \{\.\.\.form\.register\(`distributions\.\$\{index\}\.discount_amount`\)\} className="h-11 rounded-xl font-bold bg-white" />\n                                                                                </div>\n                                                                            </div>', ui_addition, content)

with open("components/sales/bulk-sale-form.tsx", "w") as f:
    f.write(content)

