"use client"

import React, { forwardRef } from 'react'
import Barcode from 'react-barcode'

interface IDCardProps {
    contact: {
        full_name?: string
        name?: string // as fallback
        contact_type?: string
        internal_id?: string
        phone?: string
        city?: string
    }
    organizationName?: string
}

export const IDCard = forwardRef<HTMLDivElement, IDCardProps>(({ contact, organizationName }, ref) => {
    if (!contact) return null;

    const displayName = contact.full_name || contact.name || 'Unknown';
    const displayId = contact.internal_id || 'NO-ID';
    const displayType = contact.contact_type ? contact.contact_type.toUpperCase() : 'CONTACT';
    
    // Fallback organization name
    const orgName = organizationName || 'MANDI GROW';

    return (
        <div ref={ref} className="w-[85.6mm] h-[54mm] bg-white border-2 border-gray-300 rounded-lg p-4 flex flex-col justify-between items-center shadow-sm relative overflow-hidden print:shadow-none print:border-black" style={{ boxSizing: 'border-box' }}>
            {/* Header / Org Name */}
            <div className="w-full text-center border-b-2 border-gray-200 pb-2 mb-2">
                <h1 className="text-lg font-black uppercase tracking-widest text-gray-900 leading-tight">
                    {orgName}
                </h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                    Official {displayType} Identity
                </p>
            </div>

            {/* Contact Info */}
            <div className="w-full text-center flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase leading-tight truncate px-2">
                    {displayName}
                </h2>
                {contact.city && (
                    <p className="text-xs font-semibold text-gray-600 uppercase mt-1">
                        {contact.city}
                    </p>
                )}
            </div>

            {/* Barcode Area */}
            <div className="w-full flex flex-col items-center justify-end mt-2 bg-gray-50 rounded p-1 print:bg-transparent">
                <div className="transform scale-90 origin-bottom">
                    <Barcode 
                        value={displayId} 
                        format="CODE128"
                        width={2}
                        height={40}
                        displayValue={true}
                        fontSize={14}
                        fontOptions="bold"
                        margin={0}
                        background="transparent"
                    />
                </div>
            </div>
        </div>
    )
})

IDCard.displayName = 'IDCard'
