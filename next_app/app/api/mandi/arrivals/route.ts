import { NextRequest, NextResponse } from 'next/server';

// This legacy Supabase/Postgres API route has been migrated to Frappe.
// All data operations now go through /api/method/mandigrow.api.* endpoints.
// This stub returns 410 Gone so any old calls surface a clear error.
export async function GET(_req: NextRequest) {
    return NextResponse.json(
        { error: 'This endpoint has been deprecated. Use Frappe API instead: /api/method/mandigrow.api.*' },
        { status: 410 }
    );
}
export async function POST(_req: NextRequest) {
    return NextResponse.json(
        { error: 'This endpoint has been deprecated. Use Frappe API instead: /api/method/mandigrow.api.*' },
        { status: 410 }
    );
}
export async function PUT(_req: NextRequest) {
    return NextResponse.json(
        { error: 'This endpoint has been deprecated. Use Frappe API instead: /api/method/mandigrow.api.*' },
        { status: 410 }
    );
}
export async function DELETE(_req: NextRequest) {
    return NextResponse.json(
        { error: 'This endpoint has been deprecated. Use Frappe API instead: /api/method/mandigrow.api.*' },
        { status: 410 }
    );
}
