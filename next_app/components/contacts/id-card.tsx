"use client"

import React, { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface IDCardProps {
    contact: {
        id?: string
        full_name?: string
        name?: string // as fallback
        contact_type?: string
        internal_id?: string
        phone?: string
        city?: string
    }
    organizationName?: string
    orgId?: string
}

export const IDCard = forwardRef<HTMLDivElement, IDCardProps>(({ contact, organizationName, orgId }, ref) => {
    if (!contact) return null;

    const displayName = contact.full_name || contact.name || 'Unknown';
    const displayId = contact.internal_id || 'NO-ID';
    const displayType = contact.contact_type ? contact.contact_type.toUpperCase() : 'CONTACT';
    
    // Fallback organization name
    const orgName = organizationName || 'MANDI GROW';

    return (
        <div id="id-card-print-area" ref={ref} className="w-[85.6mm] h-[54mm] bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col justify-between items-center shadow-sm overflow-hidden print:w-[85.6mm] print:h-[54mm] print:m-0 print:p-3" style={{ boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* Header / Org Name */}
            <div className="w-full text-center border-b-2 border-gray-200 pb-1.5 mb-1.5 shrink-0">
                <h1 className="text-[18px] font-black uppercase tracking-widest text-gray-900 leading-tight">
                    {orgName}
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                    Official {displayType} Identity
                </p>
            </div>

            {/* Contact Info + QR side by side */}
            <div className="w-full flex flex-row items-center justify-between flex-1 gap-2 min-h-0">
                {/* Left: Name & details */}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <h2 className="text-[16px] font-black text-gray-900 uppercase leading-tight break-words">
                        {displayName}
                    </h2>
                    {contact.city && (
                        <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">
                            {contact.city}
                        </p>
                    )}
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5 w-fit">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{displayType}</span>
                        <span className="text-[11px] font-black text-gray-900 tracking-wider">{displayId}</span>
                    </div>
                </div>

                {/* Right: QR Code */}
                <div className="flex flex-col items-center justify-center shrink-0">
                    <QRCodeSVG
                        value={`MGC|${orgId || 'UNKNOWN'}|${contact.id || displayId}`}
                        size={72}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />
                    <span className="text-[8px] font-bold text-gray-400 mt-0.5 tracking-wider">{displayId}</span>
                </div>
            </div>
        </div>
    )
})

IDCard.displayName = 'IDCard'
