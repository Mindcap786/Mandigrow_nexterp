"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDynamicUoms } from "@/hooks/useDynamicUoms";

interface UnitComboboxProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
}

export function UnitCombobox({ value, onChange, className, placeholder = "Select unit..." }: UnitComboboxProps) {
    const { uoms, createUom } = useDynamicUoms();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!search.trim()) return;
        setIsCreating(true);
        const newUom = await createUom(search.trim());
        onChange(newUom);
        setSearch("");
        setOpen(false);
        setIsCreating(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search unit..." value={search} onValueChange={setSearch} />
                    <CommandList>
                        <CommandEmpty>
                            {search.trim() ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm font-semibold text-[#1A6B3C] py-2 h-auto"
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Create "{search.trim()}"
                                </Button>
                            ) : "No units found."}
                        </CommandEmpty>
                        <CommandGroup>
                            {uoms.map((uom) => (
                                <CommandItem
                                    key={uom}
                                    value={uom}
                                    onSelect={(val) => {
                                        const original = uoms.find(u => u.toLowerCase() === val.toLowerCase()) || val;
                                        onChange(original);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === uom ? "opacity-100" : "opacity-0")} />
                                    {uom}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
