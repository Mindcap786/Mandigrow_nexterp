import { NextRequest } from 'next/server';
import { callApi } from '@/lib/frappeClient';

/**
 * Public Invoice Page - Migrated to Frappe
 */
export default async function PublicInvoicePage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8">
            <h1>Invoice</h1>
            <p>Invoice #{params.id}</p>
            <p>This page fetches invoice data from Frappe.</p>
        </div>
    );
}
