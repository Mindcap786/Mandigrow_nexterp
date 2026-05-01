import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Supabase route — migrated to Frappe.
 * This endpoint is no longer active. Use Frappe RPC via /api/method/ instead.
 */
export async function GET(_request: NextRequest) {
    return NextResponse.json({ error: 'This endpoint has been migrated to Frappe RPC.' }, { status: 410 });
}

export async function POST(_request: NextRequest) {
    return NextResponse.json({ error: 'This endpoint has been migrated to Frappe RPC.' }, { status: 410 });
}

export async function PUT(_request: NextRequest) {
    return NextResponse.json({ error: 'This endpoint has been migrated to Frappe RPC.' }, { status: 410 });
}

export async function DELETE(_request: NextRequest) {
    return NextResponse.json({ error: 'This endpoint has been migrated to Frappe RPC.' }, { status: 410 });
}
