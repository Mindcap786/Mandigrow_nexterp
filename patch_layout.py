import sys

file_path = "/Users/shauddin/frappe-bench/apps/mandigrow/next_app/components/arrivals/arrivals-form.tsx"

with open(file_path, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* Main Form Content */}" in line and start_idx == -1:
        start_idx = i
    
button_idx = -1
for j in range(start_idx, len(lines)):
     if "<Button" in lines[j] and "onClick={() => append({" in lines[j+3]:
         button_idx = j
         break

if start_idx != -1 and button_idx != -1:
    new_block = """                        {/* Transport & Expenses Horizontal Strip */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm space-y-5 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-1 bg-green-600 rounded-full" />
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase">Transport <span className="text-green-600">& Expenses</span></h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                                    {isVisible('vehicle_type') && (
                                        <FormField
                                            control={form.control}
                                            name="vehicle_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-slate-700 uppercase tracking-wide ml-1">{getLabel('vehicle_type', 'Vehicle Type')}</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} required={isMandatory('vehicle_type')}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white border border-slate-300 h-9 text-xs text-slate-900 font-bold rounded-lg shadow-sm">
                                                                <SelectValue placeholder={getLabel('vehicle_type', 'Type')} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white border-gray-200 text-gray-900 shadow-xl">
                                                            <SelectItem value="Pickup">Pickup</SelectItem>
                                                            <SelectItem value="Truck">Truck</SelectItem>
                                                            <SelectItem value="Tempo">Tempo</SelectItem>
                                                            <SelectItem value="Tractor">Tractor</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    {isVisible('guarantor') && (
                                        <FormField
                                            control={form.control}
                                            name="guarantor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-slate-700 uppercase tracking-wide ml-1">{getLabel('guarantor', 'Guarantor')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Optional" {...field} required={isMandatory('guarantor')} className="bg-white border border-slate-300 h-9 text-xs text-slate-900 font-bold rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/10" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="lg:col-span-4">
                                    {isVisible('driver_name') && (
                                        <FormField
                                            control={form.control}
                                            name="driver_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold text-slate-700 uppercase tracking-wide ml-1">{getLabel('driver_name', 'Driver Details')}</FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Input placeholder="Driver Name" {...field} required={isMandatory('driver_name')} className="bg-white border border-slate-300 h-9 text-xs flex-1 text-slate-900 font-bold rounded-lg shadow-sm" />
                                                        </FormControl>
                                                        {isVisible('driver_mobile') && (
                                                            <Input
                                                                placeholder={getLabel('driver_mobile', 'Mobile No')}
                                                                value={form.watch('driver_mobile') || ""}
                                                                onChange={(e) => form.setValue('driver_mobile', e.target.value)}
                                                                required={isMandatory('driver_mobile')}
                                                                className="bg-white border-slate-300 h-9 text-xs flex-1 text-slate-900 font-bold rounded-lg text-center shadow-sm focus:ring-2 focus:ring-green-500/10"
                                                            />
                                                        )}
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="lg:col-span-4 p-3 bg-white rounded-xl space-y-2 border border-slate-200 shadow-sm">
                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">Trip Expenses</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {isVisible('hamali_expenses') && (
                                            <FormField
                                                control={form.control}
                                                name="hamali_expenses"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0.5">
                                                        <FormLabel className="text-[8px] uppercase text-slate-700 truncate font-bold">{getLabel('hamali_expenses', 'Loading')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} required={isMandatory('hamali_expenses')} className="bg-slate-50 border border-slate-200 h-8 text-xs text-center text-slate-900 font-bold rounded-md focus:border-green-500/30 shadow-inner" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {isVisible('hire_charges') && (
                                            <FormField
                                                control={form.control}
                                                name="hire_charges"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0.5">
                                                        <FormLabel className="text-[8px] uppercase text-slate-700 truncate font-bold">{getLabel('hire_charges', 'Advance')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} required={isMandatory('hire_charges')} className="bg-slate-50 border border-slate-200 h-8 text-xs text-center text-slate-900 font-bold rounded-md focus:border-green-500/30 shadow-inner" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                        {isVisible('other_expenses') && (
                                            <FormField
                                                control={form.control}
                                                name="other_expenses"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0.5">
                                                        <FormLabel className="text-[8px] uppercase text-slate-700 truncate font-bold">{getLabel('other_expenses', 'Other')}</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} required={isMandatory('other_expenses')} className="bg-slate-50 border border-slate-200 h-8 text-xs text-center text-slate-900 font-bold rounded-md focus:border-green-500/30 shadow-inner" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Contextual Note for Transport Expenses */}
                            {(isVisible('hamali_expenses') || isVisible('hire_charges') || isVisible('other_expenses')) && totalTripDeductions > 0 && (
                                <div className="mt-2 p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-[9px] text-gray-600 leading-relaxed">
                                            {arrivalType === 'direct' ? (
                                                <span>
                                                    <strong className="text-gray-900">Direct Purchase:</strong> Transport expenses <strong className="text-orange-600">borne by Mandi</strong> (not deducted from supplier payment).
                                                </span>
                                            ) : (
                                                <span>
                                                    <strong className="text-blue-700">Commission:</strong> Transport expenses will be <strong className="text-gray-900">proportionally deducted</strong> from {arrivalType === 'commission_supplier' ? 'supplier' : 'farmer'} payment based on item value.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ITEMS LOADER SECTION */}
                        <div className="pt-2 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100/80">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-1 bg-blue-600 rounded-full shadow-sm" />
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Arrival <span className="text-blue-600">Items</span></h3>
                                </div>

                                {/* Integrated Arrival Type Selection */}
                                <div className="flex flex-col items-center sm:items-end gap-1">
                                    <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 px-2">
                                            <Switch 
                                                id="commission-toggle"
                                                checked={arrivalType !== 'direct'}
                                                onCheckedChange={(checked) => {
                                                    const newType = checked ? 'commission' : 'direct';
                                                    setArrivalType(newType);
                                                    form.setValue('arrival_type', newType);
                                                }}
                                            />
                                            <Label htmlFor="commission-toggle" className="text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer">
                                                Commission
                                            </Label>
                                        </div>
                                        
                                        {arrivalType !== 'direct' && (
                                            <Tabs
                                                value={arrivalType}
                                                onValueChange={(v: any) => {
                                                    setArrivalType(v);
                                                    form.setValue('arrival_type', v);
                                                }}
                                                className="animate-in slide-in-from-right-2 duration-300"
                                            >
                                                <TabsList className="bg-white/50 p-0.5 rounded-lg h-8 w-[180px] grid grid-cols-2 border border-slate-200/50 shadow-inner">
                                                    <TabsTrigger value="commission" className="rounded-md font-black uppercase tracking-widest text-[8px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-slate-400 transition-all h-7">
                                                        Farmer
                                                    </TabsTrigger>
                                                    <TabsTrigger value="commission_supplier" className="rounded-md font-black uppercase tracking-widest text-[8px] data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-slate-400 transition-all h-7">
                                                        Supplier
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        )}
                                        
                                        {arrivalType === 'direct' && (
                                            <div className="px-4 py-1.5 bg-blue-600 rounded-lg shadow-md shadow-blue-500/20 animate-in zoom-in-95 duration-300">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Direct Purchase</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic opacity-70">
                                        Pricing & Commission Logic
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-1 bg-purple-600 rounded-full shadow-sm" />
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight uppercase">Consignment <span className="text-purple-600">Details</span></h3>
                                </div>
"""
    lines = lines[:start_idx] + [new_block] + lines[button_idx:]
    with open(file_path, "w") as f:
        f.writelines(lines)
    print("Successfully updated layout!")
else:
    print(f"Error: start_idx={start_idx}, button_idx={button_idx}")
