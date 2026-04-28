import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
    const auth = await verifyAdminAccess(req, 'audit_logs', 'read');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // For now, return mock empty list as Frappe doesn't have admin_audit_logs yet
    return NextResponse.json([]);
}
