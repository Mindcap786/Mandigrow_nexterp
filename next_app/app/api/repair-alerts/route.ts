import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Supabase Postgres repair script — migrated to Frappe.
 * Postgres/Supabase has been entirely removed from the infrastructure.
 */
export async function GET(_request: NextRequest) {
    return NextResponse.json({ error: 'This endpoint is deprecated. Database management is now handled securely via Frappe Bench commands.' }, { status: 410 });
}
