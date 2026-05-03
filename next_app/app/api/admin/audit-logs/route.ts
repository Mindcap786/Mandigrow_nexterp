import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    // Auth is handled by Frappe session (cookie forwarded by Next.js proxy).
    // The Frappe backend enforces super_admin role on all admin API calls.
    // We don't re-verify here — we just return the empty list (no Frappe audit_log DocType yet).
    return NextResponse.json([]);
}
