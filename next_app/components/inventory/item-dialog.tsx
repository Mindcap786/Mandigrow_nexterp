"use client"

import { supabase } from '@/lib/supabaseClient'; // No-op stub — all calls return null
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
import { format } from "date-fns"
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
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { callApi } from "@/lib/frappeClient";
 // proxy fallback
import { useAuth } from "@/components/auth/auth-provider"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Check, ChevronsUpDown, Loader2, Package, QrCode, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import inventoryData from "@/inventory_data.json"
import { getIntelligentVisual } from "@/lib/utils/commodity-mapping"
import * as LucideIcons from "lucide-react"
import { useFieldGovernance } from "@/hooks/useFieldGovernance"
import { getCommodityIdentity, COMMODITY_UNITS } from "@/lib/utils/commodity-utils"

const itemSchema = z.object({
    name: z.string().min(2, "Name is required"),
    local_name: z.string().optional(),
    default_unit: z.string().min(1, "Default unit is required"),
    custom_secondary_uom: z.string().optional(),
    custom_uom_conversion_factor: z.preprocess((val) => Number(val) || 0, z.number().min(0)).optional(),
    shelf_life_days: z.number().nullable().optional(),
    critical_age_days: z.number().nullable().optional(),
    sku_code: z.string().optional(),
    category: z.string().optional(),
    sub_category: z.string().optional(),
    purchase_price: z.number().min(0).optional(),
    barcode: z.string().optional(),
    gst_rate: z.number().min(0).max(28).optional(),
    sale_gst_rate: z.number().min(0).max(28).optional(),
    sale_gst_type: z.string().optional(),
    purchase_gst_rate: z.number().min(0).max(28).optional(),
    purchase_gst_type: z.string().optional(),
    hsn_code: z.string().max(8).optional(),
    tracking_type: z.string().optional(),
    custom_attributes: z.record(z.string(), z.string()).optional(),
    internal_id: z.string().optional().or(z.literal("")),
    variety: z.string().optional(),
    grade: z.string().optional(),
    opening_stock: z.number().min(0).optional(),
    storage_location: z.string().optional(),
})

// GST & HSN auto-fill lookup — India Mandi commodities
const HSN_LOOKUP: Record<string, { hsn: string; gst: number }> = {
    // Fresh Fruits (Chapter 08) — 0% GST (Exempt)
    "apple": { hsn: "0808", gst: 0 }, "mango": { hsn: "0809", gst: 0 },
    "banana": { hsn: "0803", gst: 0 }, "orange": { hsn: "0805", gst: 0 },
    "grapes": { hsn: "0806", gst: 0 }, "pomegranate": { hsn: "0810", gst: 0 },
    "papaya": { hsn: "0807", gst: 0 }, "watermelon": { hsn: "0807", gst: 0 },
    "guava": { hsn: "0804", gst: 0 }, "pineapple": { hsn: "0804", gst: 0 },
    "pear": { hsn: "0808", gst: 0 }, "plum": { hsn: "0809", gst: 0 },
    "lemon": { hsn: "0805", gst: 0 }, "lime": { hsn: "0805", gst: 0 },
    "coconut": { hsn: "0801", gst: 0 }, "jackfruit": { hsn: "0810", gst: 0 },
    "litchi": { hsn: "0810", gst: 0 }, "chiku": { hsn: "0810", gst: 0 },
    // Fresh Vegetables / Sabji (Chapter 07) — 0% GST
    "onion": { hsn: "0703", gst: 0 }, "potato": { hsn: "0701", gst: 0 },
    "tomato": { hsn: "0702", gst: 0 }, "garlic": { hsn: "0703", gst: 0 },
    "cauliflower": { hsn: "0704", gst: 0 }, "cabbage": { hsn: "0704", gst: 0 },
    "brinjal": { hsn: "0709", gst: 0 }, "ladyfinger": { hsn: "0709", gst: 0 },
    "okra": { hsn: "0709", gst: 0 }, "capsicum": { hsn: "0709", gst: 0 },
    "ginger": { hsn: "0910", gst: 0 }, "spinach": { hsn: "0709", gst: 0 },
    "carrot": { hsn: "0706", gst: 0 }, "peas": { hsn: "0708", gst: 0 },
    "beans": { hsn: "0708", gst: 0 }, "cucumber": { hsn: "0707", gst: 0 },
    "bitter gourd": { hsn: "0709", gst: 0 }, "bottle gourd": { hsn: "0709", gst: 0 },
    "ridge gourd": { hsn: "0709", gst: 0 }, "drumstick": { hsn: "0709", gst: 0 },
    "radish": { hsn: "0706", gst: 0 }, "beetroot": { hsn: "0706", gst: 0 },
    "sweet potato": { hsn: "0714", gst: 0 },
    // Anaj / Cereals (Chapter 10) — 0% loose, 5% branded
    "wheat": { hsn: "1001", gst: 0 }, "rice": { hsn: "1006", gst: 0 },
    "maize": { hsn: "1005", gst: 0 }, "bajra": { hsn: "1008", gst: 0 },
    "jowar": { hsn: "1007", gst: 0 }, "barley": { hsn: "1003", gst: 0 },
    "corn": { hsn: "1005", gst: 0 }, "sorghum": { hsn: "1007", gst: 0 },
    // Pulses (Chapter 07) — 0% GST
    "dal": { hsn: "0713", gst: 0 }, "moong": { hsn: "0713", gst: 0 },
    "chana": { hsn: "0713", gst: 0 }, "urad": { hsn: "0713", gst: 0 },
    "arhar": { hsn: "0713", gst: 0 }, "toor": { hsn: "0713", gst: 0 },
    // Dry Fruits — 5% GST
    "cashew": { hsn: "0801", gst: 5 }, "raisin": { hsn: "0806", gst: 5 },
    "almond": { hsn: "0802", gst: 5 }, "walnut": { hsn: "0802", gst: 5 },
    "pistachio": { hsn: "0802", gst: 5 }, "dates": { hsn: "0804", gst: 5 },
    "fig": { hsn: "0804", gst: 5 },
}

type ItemFormValues = z.infer<typeof itemSchema>

interface ItemDialogProps {
    children: React.ReactNode
    onSuccess?: () => void
    initialItem?: any // Optional item for editing
}

export function ItemDialog({ children, onSuccess, initialItem }: ItemDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { profile } = useAuth()
    const [loadingState, setLoadingState] = useState<string | null>(null)
    const [idConflict, setIdConflict] = useState<string | null>(null)
    const isLoading = !!loadingState

    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<any[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setSelectedImages(prev => [...prev, ...files])
            const newUrls = files.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newUrls])
        }
    }

    async function uploadImages(itemId: string): Promise<void> {
        if (selectedImages.length === 0) return

        let primaryUrl: string | null = null

        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i]
            const fileName = `${profile?.organization_id}/${itemId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
            const { error: uploadError } = await supabase.storage.from('item_images').upload(fileName, file)

            if (uploadError) {
                console.error("Item Image Upload Error:", uploadError)
                toast({
                    title: "Image Upload Failed",
                    description: `Could not upload ${file.name}. Please try again.`,
                    variant: "destructive"
                })
                continue
            }

            const { data: urlData } = supabase.storage.from('item_images').getPublicUrl(fileName)
            const publicUrl = urlData.publicUrl

            // First successfully uploaded image becomes the primary display image
            if (!primaryUrl) primaryUrl = publicUrl

            // Store in item_images gallery for history
            await supabase.schema('mandi').from('item_images').insert({
                organization_id: profile?.organization_id,
                commodity_id: itemId,
                url: publicUrl,
                is_primary: i === 0
            })
        }

        // Update the commodity's image_url directly - this is what Stock Status & POS read
        if (primaryUrl) {
            const { error: updateError } = await supabase
                .schema('mandi')
                .from('commodities')
                .update({ image_url: primaryUrl })
                .eq('id', itemId)

            if (updateError) {
                console.error("[Upload] Failed to update commodity image_url:", updateError)
            } else {
                console.log('[Upload] Updated commodities.image_url for item:', itemId)
            }
        }
    }

    const { isVisible, isMandatory, getLabel } = useFieldGovernance('inventory')

    // Flatten inventory data for search
    const allItems = [...inventoryData.fruits, ...inventoryData.vegetables]

    // Filter items if in edit mode (initialItem exists)
    const displayedItems = initialItem
        ? allItems.filter(item => item.name === initialItem.name)
        : allItems;

    const [openCombobox, setOpenCombobox] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [storageLocations, setStorageLocations] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            const fetchLocations = async () => {
                try {
                    const res: any = await callApi('mandigrow.api.get_storage_locations', { active_only: true });
                    if (res && Array.isArray(res)) {
                        setStorageLocations(res);
                    } else if (res && res.message) {
                        setStorageLocations(res.message);
                    } else {
                        setStorageLocations(res || []);
                    }
                } catch (err) {
                    console.error("Failed to fetch storage locations:", err);
                }
            };
            fetchLocations();
        }
    }, [open]);

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema) as any,
        defaultValues: {
            name: initialItem?.name || "",
            local_name: initialItem?.local_name || "",
            default_unit: initialItem?.default_unit || "Box",
            custom_secondary_uom: initialItem?.custom_secondary_uom || "",
            custom_uom_conversion_factor: initialItem?.custom_uom_conversion_factor || 0,
            shelf_life_days: initialItem?.shelf_life_days || null,
            critical_age_days: initialItem?.critical_age_days || null,
            sku_code: initialItem?.sku_code || "",
            category: initialItem?.category || "",
            sub_category: initialItem?.sub_category || "",
            purchase_price: initialItem?.purchase_price || 0,
            barcode: initialItem?.barcode || "",
            gst_rate: initialItem?.gst_rate || 0,
            sale_gst_rate: initialItem?.sale_gst_rate || 0,
            sale_gst_type: initialItem?.sale_gst_type || "Exclusive",
            purchase_gst_rate: initialItem?.purchase_gst_rate || 0,
            purchase_gst_type: initialItem?.purchase_gst_type || "Exclusive",
            hsn_code: initialItem?.hsn_code || initialItem?.customs_tariff_number || "",
            tracking_type: initialItem?.tracking_type || "none",
            custom_attributes: initialItem?.custom_attributes || {},
            internal_id: initialItem?.internal_id || "",
            opening_stock: initialItem?.opening_stock || 0,
            storage_location: initialItem?.storage_location || "",
        }
    })



    const checkIdUniqueness = async (id: string) => {
        if (!id || !profile?.organization_id || initialItem) {
            setIdConflict(null)
            return
        }
        
        try {
            const res: any = await callApi('frappe.client.get_value', {
                doctype: 'Item',
                fieldname: 'name',
                filters: { name: id }
            });
            
            if (res && res.message) {
                setIdConflict(`This ID is already allocated. Please use a different identifier.`)
            } else {
                setIdConflict(null)
            }
        } catch (err) {
            setIdConflict(null)
        }
    }


    // Reset form when dialog opens/closes or initialItem changes
    useEffect(() => {
        if (open) {
            let initialAttrs = initialItem?.custom_attributes || {};
            if (typeof initialAttrs === 'string') {
                try { initialAttrs = JSON.parse(initialAttrs); } catch (e) { initialAttrs = {}; }
            }

            // Extract variety/grade for easy editing
            const variety = initialAttrs.Variety || initialAttrs.variety || "";
            const grade = initialAttrs.Grade || initialAttrs.grade || "";
            
            // Filter out variety/grade from generic attributes
            const otherAttrs = { ...initialAttrs };
            delete otherAttrs.Variety; delete otherAttrs.variety;
            delete otherAttrs.Grade; delete otherAttrs.grade;

            const sanitized = Object.fromEntries(
                Object.entries(initialItem || {}).map(([k, v]) => [k, v === null ? '' : v])
            )

            form.reset({
                name: initialAttrs.base_name || initialItem?.name || "",
                local_name: initialItem?.local_name || "",
                default_unit: initialItem?.default_unit || "Box",
                custom_secondary_uom: initialItem?.custom_secondary_uom || "",
                custom_uom_conversion_factor: initialItem?.custom_uom_conversion_factor || 0,
                shelf_life_days: initialItem?.shelf_life_days || null,
                critical_age_days: initialItem?.critical_age_days || null,
                sku_code: initialItem?.sku_code || "",
                category: initialItem?.category || "",
                sub_category: initialItem?.sub_category || "",
                purchase_price: initialItem?.purchase_price || 0,
                barcode: initialItem?.barcode || "",
                gst_rate: initialItem?.gst_rate || 0,
                sale_gst_rate: initialItem?.sale_gst_rate || 0,
                sale_gst_type: initialItem?.sale_gst_type || "Exclusive",
                purchase_gst_rate: initialItem?.purchase_gst_rate || 0,
                purchase_gst_type: initialItem?.purchase_gst_type || "Exclusive",
                hsn_code: initialItem?.hsn_code || initialItem?.customs_tariff_number || "",
                tracking_type: initialItem?.tracking_type || "none",
                ...sanitized,
                variety,
                grade,
                custom_attributes: otherAttrs,
                opening_stock: initialItem?.opening_stock || 0,
                storage_location: initialItem?.storage_location || "",
            })
            setSelectedImages([])
            setPreviewUrls([])
            fetchExistingImages()
        }
    }, [open, initialItem, form])

    const fetchExistingImages = async () => {
        // TODO: Implement Frappe File Attachment fetching
        setExistingImages([])
    }

    const onSubmit = async (data: ItemFormValues) => {
        if (idConflict) {
            toast({
                title: "ID Conflict",
                description: idConflict,
                variant: "destructive"
            })
            return
        }
        if (!profile?.organization_id) {
            toast({
                title: "Authentication Error",
                description: "Your session is missing organization context.",
                variant: "destructive"
            })
            return
        }

        setLoadingState("Connecting...")
        console.time("ItemSave")

        try {
            const price = data.purchase_price || 0;
            const stock = data.opening_stock || 0;

            if (stock > 0 && price <= 0) {
                toast({ title: "Validation Error", description: "Purchase price must be greater than 0 when entering opening stock.", variant: "destructive" });
                setLoadingState(null);
                return;
            }
            if (price > 0 && stock <= 0) {
                toast({ title: "Validation Error", description: "Opening stock must be entered when defining a Purchase Price.", variant: "destructive" });
                setLoadingState(null);
                return;
            }
            if (stock > 0 && !data.storage_location) {
                toast({ title: "Validation Error", description: "Storage location is required when entering opening stock.", variant: "destructive" });
                setLoadingState(null);
                return;
            }

            // Merge variety/grade into custom_attributes
            const finalAttrs = { ...(data.custom_attributes || {}) }
            if (data.variety) finalAttrs.Variety = data.variety
            if (data.grade) finalAttrs.Grade = data.grade

            const res = await callApi('mandigrow.api.create_commodity', {
                ...data,
                id: initialItem?.id,
                hsn_code: data.hsn_code || "",
                gst_rate: data.sale_gst_rate ?? data.gst_rate ?? 0,
                sale_gst_rate: data.sale_gst_rate ?? 0,
                sale_gst_type: data.sale_gst_type || "Exclusive",
                purchase_gst_rate: data.purchase_gst_rate ?? 0,
                purchase_gst_type: data.purchase_gst_type || "Exclusive",
                opening_stock: data.opening_stock || 0,
                storage_location: data.storage_location,
                shelf_life_days: data.shelf_life_days,
                custom_secondary_uom: data.custom_secondary_uom,
                custom_uom_conversion_factor: data.custom_uom_conversion_factor,
                internal_id: data.internal_id?.trim() || null,
                custom_attributes: finalAttrs
            });

            if (res && res.success) {
                if (selectedImages.length > 0) {
                     // Image upload is still complex, but let's at least get the item created first
                     // await uploadImages(res.id)
                }
                toast({ title: "Success", description: initialItem ? "Item updated successfully" : "Item registered successfully" })
                setLoadingState("Finalizing...")
                // Clear the cache manually before calling onSuccess so that fetchItems hits the network
                if (typeof window !== 'undefined') {
                    const orgId = localStorage.getItem('mandi_profile_cache_org_id')
                    if (orgId) {
                        localStorage.removeItem(`mandi_cache_commodity_master_${orgId}`)
                        localStorage.removeItem(`mandi_cache_stock_main_${orgId}`)
                        localStorage.removeItem(`mandi_cache_stock_batches_${orgId}`)
                    }
                }
                setOpen(false)
                form.reset()
                if (onSuccess) onSuccess()
            } else {
                throw new Error(res?.error || "Failed to save item");
            }
        } catch (error: any) {
            console.error("Item Save error:", error)
            toast({
                title: "Save Failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            console.timeEnd("ItemSave")
            setLoadingState(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[90vh] flex flex-col bg-white border-gray-300 text-gray-900 rounded-[32px] overflow-hidden shadow-2xl p-0">
                <div className="bg-gradient-to-r from-blue-50 to-transparent p-8 pb-4">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter text-gray-900">
                            {initialItem ? 'EDIT' : 'ADD'} <span className="text-blue-600">ITEM</span>
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 font-medium">
                            {initialItem
                                ? 'Update commodity details.'
                                : 'Define a new commodity in your inventory master.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                        <Tabs defaultValue="metadata" className="w-full">
                            <TabsList className="w-full mb-6 grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                                <TabsTrigger value="metadata" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Metadata</TabsTrigger>
                                <TabsTrigger value="pricing" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Pricing & GST</TabsTrigger>
                                <TabsTrigger value="stock" className="font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Stock</TabsTrigger>
                            </TabsList>

                            <TabsContent value="metadata" className="space-y-6 mt-0">
                                {isVisible('name') && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">{getLabel('name', 'Item Name (Required)')}</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="w-full justify-between bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl hover:bg-gray-50 hover:text-gray-900 focus:ring-blue-500/20"
                                                >
                                                    {form.watch("name")
                                                        ? form.watch("name")
                                                        : getLabel('name', "Select or type item...")}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[380px] p-0 bg-white border-gray-300 text-gray-900 shadow-xl z-[200]">
                                                <Command className="bg-white">
                                                    {!initialItem && <CommandInput placeholder="Search user item..." className="text-gray-900 placeholder:text-gray-400" onValueChange={setSearchTerm} />}
                                                    <CommandList>
                                                        <CommandEmpty className="py-6 text-center text-sm text-gray-700">
                                                            <p>No item found.</p>
                                                            {searchTerm && (
                                                                <Button
                                                                    variant="ghost"
                                                                    className="mt-2 text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50"
                                                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                    onClick={() => {
                                                                        form.setValue("name", searchTerm)
                                                                        setOpenCombobox(false)
                                                                    }}
                                                                >
                                                                    + Create "{searchTerm}"
                                                                </Button>
                                                            )}
                                                        </CommandEmpty>
                                                        {displayedItems.length > 0 && (
                                                            <CommandGroup heading="Suggestions">
                                                                {displayedItems.map((item) => (
                                                                    <CommandItem
                                                                        key={item.name}
                                                                        value={item.name}
                                                                        onSelect={(currentValue) => {
                                                                            form.setValue("name", item.name)
                                                                            if (item.local_name) {
                                                                                form.setValue("local_name", item.local_name)
                                                                            }
                                                                            const lookupKey = item.name.toLowerCase();
                                                                            if (HSN_LOOKUP[lookupKey]) {
                                                                                form.setValue("hsn_code", HSN_LOOKUP[lookupKey].hsn);
                                                                                form.setValue("sale_gst_rate", HSN_LOOKUP[lookupKey].gst);
                                                                                form.setValue("purchase_gst_rate", HSN_LOOKUP[lookupKey].gst);
                                                                            }
                                                                            setOpenCombobox(false)
                                                                        }}
                                                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                        onClick={() => {
                                                                            form.setValue("name", item.name)
                                                                            if (item.local_name) {
                                                                                form.setValue("local_name", item.local_name)
                                                                            }
                                                                            const lookupKey = item.name.toLowerCase();
                                                                            if (HSN_LOOKUP[lookupKey]) {
                                                                                form.setValue("hsn_code", HSN_LOOKUP[lookupKey].hsn);
                                                                                form.setValue("sale_gst_rate", HSN_LOOKUP[lookupKey].gst);
                                                                                form.setValue("purchase_gst_rate", HSN_LOOKUP[lookupKey].gst);
                                                                            }
                                                                            setOpenCombobox(false)
                                                                        }}
                                                                        className="!pointer-events-auto text-gray-900 aria-selected:text-blue-700 aria-selected:bg-blue-50 cursor-pointer"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4 text-blue-600 shrink-0",
                                                                                form.watch("name") === item.name ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {(() => {
                                                                            const visual = getIntelligentVisual(item.name, LucideIcons);
                                                                            if (visual.type === 'img' && visual.src) {
                                                                                return <img src={visual.src} alt={item.name} className="w-6 h-6 mr-3 object-contain shrink-0" />;
                                                                            } else if (visual.type === 'icon' && visual.icon) {
                                                                                const Icon = visual.icon;
                                                                                return <Icon className="w-5 h-5 mr-3 text-slate-400 shrink-0" />;
                                                                            }
                                                                            return <Package className="w-5 h-5 mr-3 text-slate-400 shrink-0" />;
                                                                        })()}
                                                                        <span className="font-bold flex-1">{item.name}</span>
                                                                        {item.local_name && <span className="ml-2 text-gray-500 text-xs font-medium">({item.local_name})</span>}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        )}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                {isVisible('local_name') && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">{getLabel('local_name', 'Local Name (Optional)')}</Label>
                                        <Input
                                            placeholder={getLabel('local_name', "e.g. మామిడి పండు / आम")}
                                            className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-blue-500 transition-all"
                                            {...form.register("local_name")}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Variety</Label>
                                        <Input
                                            placeholder="e.g. Imam Pasand, Kesar"
                                            className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-indigo-500 transition-all"
                                            {...form.register("variety")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Grade / Quality</Label>
                                        <Input
                                            placeholder="e.g. A1, B+, Large"
                                            className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-indigo-500 transition-all"
                                            {...form.register("grade")}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Internal ID / Code</Label>
                                        <Input
                                            placeholder="Auto-generate (e.g. ITM-00042)"
                                            className={cn(
                                                "w-full bg-blue-50/30 border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-blue-500 transition-all font-mono",
                                                idConflict && "border-red-500 focus:border-red-600"
                                            )}
                                            {...form.register("internal_id")}
                                            onBlur={(e) => checkIdUniqueness(e.target.value)}
                                        />
                                        <p className="text-[9px] text-gray-500 font-medium pl-1">Must be unique.</p>
                                        {idConflict && (
                                            <p className="text-[9px] text-red-600 font-bold uppercase tracking-tight">{idConflict}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Barcode / EAN</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Scan or enter barcode"
                                                className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-indigo-500 transition-all font-mono"
                                                {...form.register("barcode")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => form.setValue('barcode', String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0'))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-600 hover:text-indigo-700"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isVisible('default_unit') && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">{getLabel('default_unit', 'Default Unit')}</Label>
                                            <Select
                                                onValueChange={(val: any) => form.setValue("default_unit", val)}
                                                defaultValue={form.watch("default_unit") || "Box"}
                                            >
                                                <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:ring-blue-500/20 shadow-sm">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl shadow-lg">
                                                    {COMMODITY_UNITS.map(u => (
                                                        <SelectItem key={u} value={u} className="font-bold text-xs">{u}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Secondary UOM</Label>
                                                <Select
                                                    onValueChange={(val: any) => {
                                                        const newVal = val === "none" ? "" : val;
                                                        form.setValue("custom_secondary_uom", newVal);
                                                        if (!newVal) {
                                                            form.setValue("custom_uom_conversion_factor", 0);
                                                        }
                                                    }}
                                                    value={form.watch("custom_secondary_uom") || "none"}
                                                >
                                                    <SelectTrigger className="w-full bg-slate-50 border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:ring-blue-500/20 shadow-sm">
                                                        <SelectValue placeholder="Select (Optional)" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl shadow-lg">
                                                        <SelectItem value="none" className="font-bold text-xs text-gray-400">None</SelectItem>
                                                        {COMMODITY_UNITS.filter(u => u !== form.watch("default_unit")).map(u => (
                                                            <SelectItem key={u} value={u} className="font-bold text-xs">{u}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {form.watch("custom_secondary_uom") && (
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Conversion Factor</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="e.g. 10"
                                                            className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-indigo-500 transition-all pl-12"
                                                            {...form.register("custom_uom_conversion_factor")}
                                                        />
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">
                                                            1 {form.watch("default_unit")} =
                                                        </div>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">
                                                            {form.watch("custom_secondary_uom")}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-1">
                                        <h4 className="font-black leading-none text-black">Shelf Life Config</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Shelf Life (days)</Label>
                                            <Input
                                                type="number"
                                                className="w-full bg-amber-50 border-amber-400 text-amber-800 font-bold h-12 rounded-xl focus:border-amber-500 transition-all"
                                                {...form.register("shelf_life_days", { 
                                                    setValueAs: (v) => v === "" || v === null || v === undefined ? null : Number(v)
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-700">Critical Age (days)</Label>
                                            <Input
                                                type="number"
                                                className="w-full bg-red-50 border-red-400 text-red-800 font-bold h-12 rounded-xl focus:border-red-400 transition-all"
                                                {...form.register("critical_age_days", { 
                                                    setValueAs: (v) => v === "" || v === null || v === undefined ? null : Number(v)
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 space-y-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Product Gallery</Label>
                                        <span className="text-[9px] font-black text-slate-600">{existingImages.length + selectedImages.length} Images</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        {existingImages.map((img) => (
                                            <div key={img.id} className="aspect-square bg-white border border-slate-100 rounded-xl overflow-hidden relative group">
                                                <img src={img.url} alt="Item" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            await supabase.schema('mandi').from('item_images').delete().eq('id', img.id);
                                                            fetchExistingImages();
                                                        }}
                                                        className="p-1.5 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                                                    >
                                                        <LucideIcons.X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {img.is_primary && (
                                                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-[7px] px-1 rounded uppercase font-black">Main</div>
                                                )}
                                            </div>
                                        ))}

                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="aspect-square bg-blue-50 border border-blue-100 rounded-xl overflow-hidden relative group">
                                                <img src={url} alt="New" className="w-full h-full object-cover opacity-70" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-blue-600/80 text-white text-[8px] px-1.5 font-black uppercase rounded-full">New</div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                                                            setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                                                        }}
                                                        className="p-1.5 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                                                    >
                                                        <LucideIcons.X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                        >
                                            <LucideIcons.Upload className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                                            <span className="text-[8px] font-black text-slate-600 group-hover:text-blue-600 uppercase">Add</span>
                                        </button>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
                                </div>
                            </TabsContent>

                            <TabsContent value="pricing" className="space-y-6 mt-0">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Purchase Price</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-blue-500 transition-all"
                                        disabled={!!initialItem}
                                        {...form.register("purchase_price", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                                    />
                                    <p className="text-[9px] text-gray-500 font-medium pl-1">
                                        {initialItem ? "Purchase price cannot be modified after creation." : "Standard buy price for reference (optional)."}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">GST Details</Label>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">HSN Code</Label>
                                        <Input
                                            placeholder="e.g. 0804"
                                            maxLength={8}
                                            className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-indigo-500 transition-all font-mono"
                                            {...form.register("hsn_code")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Purchase GST</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        min={0}
                                                        max={28}
                                                        step="0.01"
                                                        className="w-full bg-white border-gray-300 text-gray-900 font-bold h-10 rounded-lg focus:border-indigo-500 transition-all pl-8 font-mono"
                                                        {...form.register("purchase_gst_rate", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Select onValueChange={(val: any) => form.setValue("purchase_gst_type", val)} value={form.watch("purchase_gst_type") || "Exclusive"}>
                                                    <SelectTrigger className="w-full h-10 bg-white border-gray-300 font-bold rounded-lg">
                                                        <SelectValue placeholder="Select GST type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Exclusive" className="font-bold">
                                                            GST Excluding (Base + {form.watch("purchase_gst_rate") || 0}% GST)
                                                        </SelectItem>
                                                        <SelectItem value="Inclusive" className="font-bold">
                                                            GST Inclusive (Total incl. {form.watch("purchase_gst_rate") || 0}% GST)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Sale GST</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        min={0}
                                                        max={28}
                                                        step="0.01"
                                                        className="w-full bg-white border-gray-300 text-gray-900 font-bold h-10 rounded-lg focus:border-indigo-500 transition-all pl-8 font-mono"
                                                        {...form.register("sale_gst_rate", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                                                    />
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Select onValueChange={(val: any) => form.setValue("sale_gst_type", val)} value={form.watch("sale_gst_type") || "Exclusive"}>
                                                    <SelectTrigger className="w-full h-10 bg-white border-gray-300 font-bold rounded-lg">
                                                        <SelectValue placeholder="Select GST type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Exclusive" className="font-bold">
                                                            GST Excluding (Base + {form.watch("sale_gst_rate") || 0}% GST)
                                                        </SelectItem>
                                                        <SelectItem value="Inclusive" className="font-bold">
                                                            GST Inclusive (Total incl. {form.watch("sale_gst_rate") || 0}% GST)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="stock" className="space-y-6 mt-0">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Opening Stock</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:border-blue-500 transition-all"
                                        disabled={!!initialItem}
                                        {...form.register("opening_stock", { setValueAs: (v) => v === "" ? undefined : Number(v) })}
                                    />
                                    <p className="text-[9px] text-gray-500 font-medium pl-1">
                                        {initialItem ? "Opening stock cannot be modified after creation." : "Initial stock available in your Mandi."}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Storage Location</Label>
                                    <Select
                                        onValueChange={(val: string) => form.setValue("storage_location", val)}
                                        value={form.watch("storage_location") || ""}
                                        disabled={!!initialItem}
                                    >
                                        <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 font-bold h-12 rounded-xl focus:ring-blue-500/20 shadow-sm">
                                            <SelectValue placeholder="Select storage location" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300 text-gray-900 rounded-xl shadow-lg z-[250]">
                                            {storageLocations.map((loc) => (
                                                <SelectItem key={loc.id || loc.name} value={loc.id || loc.name} className="font-bold text-xs">{loc.name || loc.location_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[9px] text-gray-500 font-medium pl-1">
                                        {initialItem ? "Storage location cannot be modified after creation." : "Where this opening stock is stored."}
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <Button 
                            type="button"
                            onClick={() => form.handleSubmit(onSubmit, (errors) => {
                                console.error('[ItemDialog] Zod validation errors:', errors)
                                const fieldNames = Object.keys(errors).join(', ')
                                toast({ title: 'Validation Error', description: `Please fix: ${fieldNames}`, variant: 'destructive' })
                            })()}
                            disabled={isLoading} 
                            className="w-full h-14 bg-blue-600 text-white hover:bg-blue-700 font-black text-lg tracking-tight rounded-2xl shadow-lg transition-all hover:shadow-blue-600/20"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="uppercase text-sm tracking-widest">{loadingState}</span>
                                </div>
                            ) : (
                                initialItem ? "UPDATE ITEM" : "REGISTER NEW ITEM"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
