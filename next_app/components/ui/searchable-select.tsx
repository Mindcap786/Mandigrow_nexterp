"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Camera, X } from "lucide-react"

import { cn, focusNext } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface SearchableSelectProps {
    options: { label: string; value: string }[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
    id?: string
    autoOpenOnFocus?: boolean
    error?: boolean
    onSelected?: (value: string) => void
    /** If true, show a camera QR scan button for mobile scanning */
    enableQrScan?: boolean
    /** The contacts list to match against internal_id when scanning */
    contacts?: { id: string; internal_id?: string; contact_code?: string }[]
}

export const SearchableSelect = React.forwardRef<HTMLButtonElement, SearchableSelectProps>((
{
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Search or type ID...",
    emptyMessage = "No results found.",
    disabled = false,
    className,
    error = false,
    onSelected,
    id,
    autoOpenOnFocus = false,
    enableQrScan = false,
    contacts = [],
}, ref) => {
    const [open, setOpen] = React.useState(false)
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const justSelectedRef = React.useRef(false)
    const [showQrScanner, setShowQrScanner] = React.useState(false)
    const qrRegionRef = React.useRef<HTMLDivElement>(null)
    const scannerRef = React.useRef<any>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => internalRef.current!)

    // Find the label for the current value
    const selectedLabel = React.useMemo(() => {
        return options.find((option) => option.value === value)?.label
    }, [options, value])

    const handleSelect = (val: string) => {
        onChange(val)
        justSelectedRef.current = true
        setOpen(false)

        if (onSelected) {
            onSelected(val)
        } else {
            setTimeout(() => {
                justSelectedRef.current = false
                if (internalRef.current) {
                    focusNext(internalRef.current);
                }
            }, 50);
        }
    }

    // Match by internal_id or contact_code and select
    const matchAndSelectByCode = React.useCallback((code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return false;

        // First try contacts list for internal_id match
        if (contacts.length > 0) {
            const matched = contacts.find(
                c => c.internal_id === trimmed || c.contact_code === trimmed
            );
            if (matched) {
                handleSelect(matched.id);
                return true;
            }
        }

        // Fallback: try matching options by value directly (if internal_id === option.value)
        const matchedOption = options.find(o => o.value === trimmed);
        if (matchedOption) {
            handleSelect(matchedOption.value);
            return true;
        }

        return false;
    }, [contacts, options, handleSelect])

    // Start QR Camera Scanner
    const startScanner = React.useCallback(async () => {
        if (typeof window === 'undefined') return;
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const regionId = `qr-region-${id || Math.random().toString(36).slice(2)}`;

            if (qrRegionRef.current) {
                qrRegionRef.current.id = regionId;
            }

            const scanner = new Html5Qrcode(regionId);
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 220, height: 220 } },
                (decodedText: string) => {
                    const found = matchAndSelectByCode(decodedText);
                    stopScanner();
                    if (!found) {
                        // If not matched, show a toast/message but don't crash
                        console.warn("QR scanned but no contact matched:", decodedText);
                    }
                },
                () => { /* scan frame error - ignore */ }
            );
        } catch (err: any) {
            console.error("Camera error:", err);
            const errMsg = err?.message || err?.toString() || "Unknown error";
            if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission denied")) {
                toast.error("Camera permission denied. Please allow camera access in your browser or device settings.");
            } else if (errMsg.includes("NotSupportedError") || !navigator.mediaDevices) {
                toast.error("Camera access requires a secure HTTPS connection or localhost.");
            } else {
                toast.error(`Camera error: ${errMsg}`);
            }
            setShowQrScanner(false);
        }
    }, [id, matchAndSelectByCode])

    const stopScanner = React.useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch { /* ignore */ }
            scannerRef.current = null;
        }
        setShowQrScanner(false);
    }, [])

    // Start scanner when modal opens
    React.useEffect(() => {
        if (showQrScanner) {
            startScanner();
        }
        return () => {
            if (!showQrScanner && scannerRef.current) {
                stopScanner();
            }
        };
    }, [showQrScanner])

    // We no longer strictly require mobile to show camera; 
    // desktop users can use their webcams too!
    const showCameraBtn = enableQrScan;

    return (
        <>
            <div className="flex gap-1.5 w-full">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id={id}
                            ref={internalRef}
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            onFocus={() => {
                                if (autoOpenOnFocus && !justSelectedRef.current) {
                                    setOpen(true);
                                }
                            }}
                            className={cn(
                                "w-full justify-between bg-white border-slate-200 text-black font-black hover:bg-slate-50 transition-all shadow-sm overflow-hidden",
                                !value && "text-slate-400",
                                error && "border-red-500 ring-2 ring-red-500/20",
                                className
                            )}
                            disabled={disabled}
                        >
                            <span className="truncate flex-1 text-left">
                                {selectedLabel || placeholder}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[max(var(--radix-popover-trigger-width),350px)] p-0 bg-white border border-slate-200 text-black shadow-xl rounded-xl overflow-hidden z-[100]">
                        <Command 
                            className="bg-transparent border-none text-black"
                            filter={(value, search) => {
                                if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                                return 0;
                            }}
                        >
                            <div className="flex items-center border-b border-slate-100 px-3 py-2" cmdk-input-wrapper="">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" />
                                <CommandInput
                                    placeholder={searchPlaceholder}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Tab') {
                                            e.preventDefault();
                                            setOpen(false);
                                            setTimeout(() => {
                                                if (internalRef.current) {
                                                    focusNext(internalRef.current);
                                                }
                                            }, 50);
                                        }
                                        // On Enter, try to match by internal_id from the typed text
                                        if (e.key === 'Enter') {
                                            const typed = (e.currentTarget as HTMLInputElement).value;
                                            const matched = matchAndSelectByCode(typed);
                                            if (matched) {
                                                e.preventDefault();
                                                setOpen(false);
                                            }
                                        }
                                    }}
                                    className="bg-transparent border-none text-black font-black placeholder:text-slate-400 focus:ring-0 text-sm h-10 w-full"
                                />
                            </div>
                            <CommandList className="max-h-[200px] overflow-y-auto p-1">
                                <CommandEmpty className="py-6 text-center text-xs font-bold text-slate-500">{emptyMessage}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={`${option.label}__${option.value}`}
                                            onSelect={() => handleSelect(option.value)}
                                            className="!pointer-events-auto flex items-center gap-2 px-2 py-2 rounded-md font-black text-sm text-black hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 data-[selected='true']:bg-blue-50 data-[selected='true']:text-blue-700 transition-colors"
                                        >
                                            <Check
                                                className={cn(
                                                    "h-4 w-4 text-blue-600",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Camera QR Scan button — mobile only */}
                {showCameraBtn && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-lg border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                        onClick={() => setShowQrScanner(true)}
                        title="Scan QR Code"
                    >
                        <Camera className="w-4 h-4 text-indigo-500" />
                    </Button>
                )}
            </div>

            {/* QR Camera Scanner Overlay */}
            {showQrScanner && (
                <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Scan ID Card QR</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={stopScanner}
                                className="h-8 w-8 rounded-full hover:bg-slate-100"
                            >
                                <X className="w-4 h-4 text-slate-600" />
                            </Button>
                        </div>
                        <div ref={qrRegionRef} className="w-full aspect-square bg-black" />
                        <p className="text-center text-xs text-slate-500 font-semibold py-3 px-4">
                            Point the camera at the QR code on the ID card
                        </p>
                    </div>
                </div>
            )}
        </>
    )
})

SearchableSelect.displayName = 'SearchableSelect'
