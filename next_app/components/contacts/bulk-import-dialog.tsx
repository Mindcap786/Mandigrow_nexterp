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
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { callApi } from "@/lib/frappeClient"
import * as XLSX from 'xlsx'

interface BulkImportDialogProps {
    children: React.ReactNode
    onSuccess?: () => void
}

export function BulkImportDialog({ children, onSuccess }: BulkImportDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [isParsing, setIsParsing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [errors, setErrors] = useState<{row: number, msg: string}[]>([])

    const resetState = () => {
        setParsedData([])
        setErrors([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsParsing(true)
        setErrors([])
        setParsedData([])

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                // Get header row and data
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
                
                if (rawData.length <= 1) {
                    setErrors([{ row: 0, msg: "File is empty or missing data rows" }])
                    setIsParsing(false)
                    return
                }

                const headers: string[] = (rawData[0] || []).map(h => String(h).trim().toLowerCase())
                
                // Column indices
                const idxName = headers.indexOf('full name')
                const idxType = headers.indexOf('partner type')
                const idxPhone = headers.indexOf('phone')
                const idxCity = headers.indexOf('city')
                const idxBal = headers.indexOf('opening balance')
                const idxBalType = headers.indexOf('balance type')
                const idxGst = headers.indexOf('gstin')
                const idxPan = headers.indexOf('pan')
                const idxState = headers.indexOf('state')
                const idxPin = headers.indexOf('pin code')

                if (idxName === -1) {
                    setErrors([{ row: 0, msg: "Missing required column: 'Full Name'" }])
                    setIsParsing(false)
                    return
                }

                const mappedData: any[] = []
                const newErrors: {row: number, msg: string}[] = []

                for (let i = 1; i < rawData.length; i++) {
                    const row = rawData[i]
                    // Skip completely empty rows
                    if (!row || row.length === 0 || !row[idxName]) continue

                    const fullName = String(row[idxName]).trim()
                    if (!fullName) {
                        newErrors.push({ row: i + 1, msg: "Full Name is required" })
                        continue
                    }

                    // Map Partner Type
                    let pTypeRaw = String(row[idxType] || '').toLowerCase()
                    let mappedType = 'farmer' // default
                    if (pTypeRaw.includes('buy') || pTypeRaw.includes('trad')) mappedType = 'buyer'
                    else if (pTypeRaw.includes('sup') || pTypeRaw.includes('ext')) mappedType = 'supplier'
                    else if (pTypeRaw.includes('farm') || pTypeRaw.includes('prod')) mappedType = 'farmer'
                    else if (pTypeRaw.trim() !== '') {
                        newErrors.push({ row: i + 1, msg: `Unrecognized Partner Type: "${row[idxType]}"` })
                    }

                    // Map Balance Type
                    let bTypeRaw = String(row[idxBalType] || '').toLowerCase()
                    let mappedBalType = 'receivable'
                    if (bTypeRaw.includes('pay') || bTypeRaw.includes('-') || bTypeRaw.includes('cr')) mappedBalType = 'payable'
                    else if (bTypeRaw.includes('rec') || bTypeRaw.includes('+') || bTypeRaw.includes('dr')) mappedBalType = 'receivable'
                    else if (bTypeRaw.trim() !== '') {
                        newErrors.push({ row: i + 1, msg: `Unrecognized Balance Type: "${row[idxBalType]}"` })
                    }

                    const openingBal = parseFloat(row[idxBal]) || 0

                    if (newErrors.length === 0) {
                        mappedData.push({
                            _row: i + 1, // Store Excel row number
                            full_name: fullName,
                            contact_type: mappedType,
                            phone: row[idxPhone] ? String(row[idxPhone]).trim() : null,
                            city: row[idxCity] ? String(row[idxCity]).trim() : null,
                            opening_balance: openingBal,
                            balance_type: mappedBalType,
                            gstin: row[idxGst] ? String(row[idxGst]).trim() : null,
                            pan_number: row[idxPan] ? String(row[idxPan]).trim() : null,
                            state: row[idxState] ? String(row[idxState]).trim() : null,
                            pincode: row[idxPin] ? String(row[idxPin]).trim() : null,
                        })
                    }
                }

                setErrors(newErrors)
                setParsedData(mappedData)

            } catch (err) {
                console.error("Excel parse error:", err)
                setErrors([{ row: 0, msg: "Failed to parse Excel file. Please ensure it is a valid .xlsx file." }])
            } finally {
                setIsParsing(false)
            }
        }
        reader.readAsBinaryString(file)
    }

    const handleImport = async () => {
        if (parsedData.length === 0 || errors.length > 0) return

        setIsUploading(true)
        try {
            const res: any = await callApi('mandigrow.api.bulk_create_contacts', {
                contacts: JSON.stringify(parsedData)
            })

            if (res.message?.errors && res.message.errors.length > 0) {
                // Backend returned some errors
                const backendErrs = res.message.errors.map((e: any) => ({ row: e.row, msg: e.error }))
                setErrors(backendErrs)
                toast({
                    title: "Import Partially Failed",
                    description: `Successfully imported ${res.message.success_count} contacts, but ${backendErrs.length} failed.`,
                    variant: "destructive"
                })
                if (res.message.success_count > 0 && onSuccess) onSuccess()
            } else {
                toast({
                    title: "Import Successful",
                    description: `Successfully imported ${res.message?.success_count || parsedData.length} contacts.`
                })
                setOpen(false)
                resetState()
                if (onSuccess) onSuccess()
            }

        } catch (error: any) {
            toast({
                title: "Import Failed",
                description: error.message || "Failed to communicate with server",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetState()
            setOpen(val)
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white border-slate-300 text-black rounded-[32px] overflow-hidden shadow-2xl p-0">
                <div className="bg-slate-50 p-8 pb-4 border-b border-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-[1000] italic tracking-tighter text-black uppercase">
                            BULK <span className="text-blue-600">IMPORT</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-700 font-bold">
                            Mass onboard Farmers, Buyers, and Suppliers using an Excel file.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    {/* Step 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs">1</span>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Download Template</h3>
                        </div>
                        <p className="text-xs font-medium text-slate-500 ml-8">
                            Download our pre-configured Excel template. It includes strict dropdowns for Partner Type and Balance Type to prevent errors.
                        </p>
                        <div className="ml-8">
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl" asChild>
                                <a href="/templates/contact_import_template.xlsx" download>
                                    <Download className="w-4 h-4 mr-2" /> Download .xlsx Template
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs">2</span>
                            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Upload Populated File</h3>
                        </div>
                        <div className="ml-8">
                            <Input 
                                type="file" 
                                accept=".xlsx" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer bg-slate-50 border-slate-200 h-14 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Status Area */}
                    {(parsedData.length > 0 || errors.length > 0 || isParsing) && (
                        <div className={`p-4 rounded-xl border ml-8 ${errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            {isParsing ? (
                                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Parsing Excel File...
                                </div>
                            ) : errors.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-tight">
                                        <AlertCircle className="w-5 h-5" /> Validation Errors Found
                                    </div>
                                    <div className="max-h-32 overflow-y-auto text-xs text-red-700 font-medium space-y-1">
                                        {errors.map((e, idx) => (
                                            <div key={idx}>Row {e.row}: {e.msg}</div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-red-600 font-bold mt-2">Please fix these errors in your Excel file and re-upload.</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-tight">
                                    <CheckCircle2 className="w-5 h-5" /> Ready to Import {parsedData.length} Contacts
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 ml-8">
                        <Button 
                            onClick={handleImport}
                            disabled={parsedData.length === 0 || errors.length > 0 || isUploading} 
                            className="w-full h-14 bg-black text-white hover:bg-slate-800 font-black text-lg tracking-tight rounded-2xl shadow-lg"
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span className="uppercase text-sm tracking-widest">Importing...</span>
                                </div>
                            ) : (
                                "IMPORT CONTACTS"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
