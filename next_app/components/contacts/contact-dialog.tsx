"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { callApi } from "@/lib/frappeClient"
import { useFieldGovernance } from "@/hooks/useFieldGovernance"
import { cn } from "@/lib/utils"
import { IDCard } from "./id-card"
import { useRef } from "react"
import { Printer } from "lucide-react"

const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    type: z.enum(["farmer", "buyer", "supplier"]),
    internal_id: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    city: z.string().optional(),
    address: z.string().optional(),
    // GST & Compliance
    gstin: z.string().max(15).optional().or(z.literal("")),
    pan_number: z.string().max(10).optional().or(z.literal("")),
    state: z.string().optional(),
    pincode: z.string().max(6).optional().or(z.literal("")),
    billing_address_line1: z.string().optional(),
    billing_address_line2: z.string().optional(),
    openingBalance: z.coerce.number().optional().default(0),
    balanceType: z.enum(["receivable", "payable"]).default("receivable")
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactDialogProps {
    children: React.ReactNode
    onSuccess?: () => void
    defaultType?: "farmer" | "buyer" | "supplier"
    initialData?: any // Add support for editing
}

export function ContactDialog({ children, onSuccess, defaultType = "farmer", initialData }: ContactDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { profile } = useAuth()
    const [loadingState, setLoadingState] = useState<string | null>(null)
    const isLoading = !!loadingState
    const [generatedContact, setGeneratedContact] = useState<any>(null)
    const printRef = useRef<HTMLDivElement>(null)

    const { isVisible, isMandatory, getLabel } = useFieldGovernance('contacts')

    // Wholesale Price Lists removed - Strategic Archival (V30)


    const form = useForm<any>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            type: initialData?.type || defaultType,
            name: initialData?.name || "",
            internal_id: initialData?.internal_id || "",
            phone: initialData?.phone || "",
            city: initialData?.city || "",
            address: initialData?.address || "",
            gstin: initialData?.gstin || "",
            pan_number: initialData?.pan_number || "",
            state: initialData?.state || "",
            pincode: initialData?.pincode || "",
            billing_address_line1: initialData?.billing_address_line1 || "",
            billing_address_line2: initialData?.billing_address_line2 || "",
            openingBalance: 0,
            balanceType: "receivable"
        }
    })

    const handlePrint = () => {
        window.print()
    }

    // Reset form when initialData changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                type: initialData?.type || defaultType,
                name: initialData?.name || "",
                internal_id: initialData?.internal_id || "",
                phone: initialData?.phone || "",
                city: initialData?.city || "",
                address: initialData?.address || "",
                gstin: initialData?.gstin || "",
                pan_number: initialData?.pan_number || "",
                state: initialData?.state || "",
                pincode: initialData?.pincode || "",
                billing_address_line1: initialData?.billing_address_line1 || "",
                billing_address_line2: initialData?.billing_address_line2 || "",
                openingBalance: 0,
                balanceType: "receivable"
            })
            setGeneratedContact(null)
        }
    }, [open, initialData, defaultType, form])

    const [idConflict, setIdConflict] = useState<string | null>(null)

    const checkIdUniqueness = async (id: string, type: string) => {
        if (!id || !profile?.organization_id) {
            setIdConflict(null)
            return
        }
        
        try {
            const res: any = await callApi('mandigrow.api.check_contact_id_exists', {
                internal_id: id,
                contact_type: type
            });
            
            if (res.message?.exists) {
                setIdConflict(`This ID is already allocated to ${res.message.name}. Please use a different ID.`)
            } else {
                setIdConflict(null)
            }
        } catch (err) {
            console.error("ID uniqueness check failed:", err);
        }
    }

    const onSubmit = async (data: any) => {
        if (idConflict) {
            toast({
                title: "ID Conflict",
                description: idConflict,
                variant: "destructive"
            })
            return
        }
        if (!profile?.organization_id) {
            console.error("Profile check failed:", { profile })
            toast({
                title: "Authentication Error",
                description: "Your session is missing organization context. Please try logging out and back in.",
                variant: "destructive"
            })
            return
        }

        setLoadingState("Connecting...")
        console.time("ContactSave")

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000)

        try {
            setLoadingState("Synchronizing...")
            
            const payload: any = {
                full_name: data.name,
                contact_type: data.type,
                phone: data.phone,
                city: data.city,
                address: data.address,
                internal_id: data.internal_id?.trim() || null,
                // GST & Billing Address
                gstin: (data.gstin || "").trim().toUpperCase() || null,
                pan_number: (data.pan_number || "").trim().toUpperCase() || null,
                state: data.state || null,
                pincode: data.pincode || null,
                billing_address_line1: data.billing_address_line1 || null,
                billing_address_line2: data.billing_address_line2 || null,
            }

            let res: any;
            if (initialData?.id) {
                payload.contact_id = initialData.id;
                res = await callApi('mandigrow.api.update_contact', payload);
            } else {
                payload.opening_balance = data.openingBalance || 0;
                payload.balance_type = data.balanceType;
                res = await callApi('mandigrow.api.create_contact', payload);
            }
            
            if (res.error) throw new Error(res.error);

            setLoadingState("Finalizing...")
            toast({ title: "Success", description: initialData?.id ? `${data.name} updated successfully` : `${data.type} added successfully` })
            
            if (!initialData?.id && (res.message?.internal_id || payload.internal_id)) {
                // Show ID card instead of closing
                setGeneratedContact({
                    ...payload,
                    internal_id: res.message?.internal_id || payload.internal_id
                })
                if (onSuccess) onSuccess()
            } else {
                setOpen(false)
                form.reset()
                if (onSuccess) onSuccess()
            }
        } catch (error: any) {
            console.error("Save error detail:", error)
            let errorMessage = error.message
            if (error.name === 'AbortError') {
                errorMessage = "The secure connection timed out (20s). This usually happens due to slow database RLS policies. Please contact admin to optimize database performance."
            }
            toast({
                title: "Save Failed",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            clearTimeout(timeoutId)
            console.timeEnd("ContactSave")
            setLoadingState(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white border-slate-300 text-black rounded-[32px] overflow-hidden shadow-2xl p-0 max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-50 p-8 pb-4 border-b border-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-[1000] italic tracking-tighter text-black uppercase">
                            {generatedContact ? 'ID CARD GENERATED' : (initialData?.id ? 'EDIT' : 'ADD')} <span className="text-blue-600">{generatedContact ? '' : 'CONTACT'}</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-700 font-bold">
                            {generatedContact ? 'Print this ID card for instant scanning during checkout.' : (initialData?.id ? `Updating details for ${initialData.name}` : 'Register a new partner in your Mandi network.')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {generatedContact ? (
                    <div className="p-8 pt-6 space-y-6 flex flex-col items-center">
                        <div className="print:absolute print:inset-0 print:m-0 print:flex print:items-start print:justify-start">
                            <IDCard 
                                ref={printRef} 
                                contact={generatedContact} 
                                organizationName={profile?.organization_name} 
                            />
                        </div>
                        <div className="flex gap-4 w-full pt-4 print:hidden">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-300 font-bold text-black hover:bg-slate-50" onClick={() => { setOpen(false); form.reset(); setGeneratedContact(null); }}>
                                CLOSE
                            </Button>
                            <Button onClick={handlePrint} className="flex-1 h-12 bg-blue-600 text-white hover:bg-blue-700 font-black text-lg tracking-tight rounded-xl shadow-md">
                                <Printer className="w-5 h-5 mr-2" />
                                PRINT ID CARD
                            </Button>
                        </div>
                    </div>
                ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-6 space-y-6">
                    <div className="space-y-4">
                        {isVisible('type') && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">{getLabel('type', 'Partner Type')}</Label>
                                <Select
                                    onValueChange={(val: any) => form.setValue("type", val)}
                                    defaultValue={defaultType}
                                    required={isMandatory('type')}
                                    disabled={!!initialData?.id}
                                >
                                    <SelectTrigger className="w-full bg-white border-slate-300 text-black font-bold h-12 rounded-xl focus:ring-blue-500 shadow-sm disabled:opacity-50">
                                        <SelectValue placeholder={getLabel('type', 'Select type')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-300 text-black rounded-xl shadow-lg">
                                        <SelectItem value="farmer">Farmer (Producer)</SelectItem>
                                        <SelectItem value="buyer">Buyer (Trader)</SelectItem>
                                        <SelectItem value="supplier">External Supplier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {isVisible('name') && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">{getLabel('name', 'Full Name')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={getLabel('name', 'e.g. SSS Fruits')}
                                        required={isMandatory('name')}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-12 rounded-xl focus:border-blue-500 font-bold transition-all placeholder:text-slate-600"
                                        {...form.register("name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">INTERNAL ID / CODE (OPTIONAL)</Label>
                                    <Input
                                        id="internal_id"
                                        placeholder="ID-101"
                                        className={cn(
                                            "w-full bg-slate-50 border-slate-300 text-black h-12 rounded-xl focus:border-blue-500 font-bold transition-all placeholder:text-slate-600",
                                            idConflict && "border-red-500 focus:border-red-600"
                                        )}
                                        {...form.register("internal_id")}
                                        onBlur={(e) => checkIdUniqueness(e.target.value, form.getValues('type'))}
                                    />
                                    {idConflict && (
                                        <p className="text-[9px] text-red-600 font-bold uppercase tracking-tight">{idConflict}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {isVisible('phone') && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">{getLabel('phone', 'Phone')}</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91..."
                                        required={isMandatory('phone')}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-12 rounded-xl focus:border-blue-500 font-bold transition-all placeholder:text-slate-600"
                                        {...form.register("phone")}
                                        maxLength={10}
                                    />
                                </div>
                            )}
                            {isVisible('city') && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">{getLabel('city', 'City / Village')}</Label>
                                    <Input
                                        id="city"
                                        placeholder={getLabel('city', 'Location')}
                                        required={isMandatory('city')}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-12 rounded-xl focus:border-blue-500 font-bold transition-all placeholder:text-slate-600"
                                        {...form.register("city")}
                                    />
                                </div>
                            )}
                        </div>

                        {/* GST & Billing Address — Collapsible */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">GST & Billing Details</p>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Optional</span>
                            </div>

                            {/* GSTIN + PAN */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">GSTIN</Label>
                                    <Input
                                        id="gstin"
                                        placeholder="22AAAAA0000A1Z5"
                                        maxLength={15}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-11 rounded-xl focus:border-blue-500 font-mono font-bold transition-all placeholder:text-slate-400 text-xs uppercase"
                                        {...form.register("gstin")}
                                        onChange={(e) => form.setValue("gstin", e.target.value.toUpperCase())}
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium">Required for B2B invoice classification</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">PAN Number</Label>
                                    <Input
                                        id="pan_number"
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-11 rounded-xl focus:border-blue-500 font-mono font-bold transition-all placeholder:text-slate-400 text-xs uppercase"
                                        {...form.register("pan_number")}
                                        onChange={(e) => form.setValue("pan_number", e.target.value.toUpperCase())}
                                    />
                                </div>
                            </div>

                            {/* State + PIN */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">State</Label>
                                    <Input
                                        id="state"
                                        placeholder="e.g. Maharashtra"
                                        className="w-full bg-slate-50 border-slate-300 text-black h-11 rounded-xl focus:border-blue-500 font-bold transition-all placeholder:text-slate-400"
                                        {...form.register("state")}
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium">For IGST vs CGST/SGST determination</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">PIN Code</Label>
                                    <Input
                                        id="pincode"
                                        placeholder="400001"
                                        maxLength={6}
                                        className="w-full bg-slate-50 border-slate-300 text-black h-11 rounded-xl focus:border-blue-500 font-mono font-bold transition-all placeholder:text-slate-400"
                                        {...form.register("pincode")}
                                    />
                                </div>
                            </div>


                        </div>
                        {!initialData?.id && (
                            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Opening Balance (Optional)</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...form.register("openingBalance")}
                                            className="bg-white border-slate-300 text-black font-mono font-bold h-10"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <Select
                                            onValueChange={(val: any) => form.setValue("balanceType", val)}
                                            defaultValue="receivable"
                                        >
                                            <SelectTrigger className={`h-10 font-bold ${form.watch('balanceType') === 'receivable' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="receivable">To Receive (↓)</SelectItem>
                                                <SelectItem value="payable">To Pay (↑)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={isLoading} className="w-full h-14 bg-black text-white hover:bg-slate-800 font-black text-lg tracking-tight rounded-2xl shadow-lg">
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="uppercase text-sm tracking-widest">{loadingState}</span>
                                </div>
                            ) : (
                                initialData?.id ? "UPDATE CONTACT DETAILS" : "SECURELY SAVE CONTACT"
                            )}
                        </Button>
                    </div>
                </form>
                )}
            </DialogContent>
        </Dialog >
    )
}
