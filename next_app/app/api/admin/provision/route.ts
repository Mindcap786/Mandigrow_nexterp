// Admin-initiated tenant provisioning.
//
// Identical workflow to /api/public/signup but gated by verifyAdminAccess.
// Supports both SSE (admin UI streams) and JSON (curl / scripts). All real
// work lives in web/lib/provisionTenant.ts so the two paths cannot drift.

import { NextRequest, NextResponse } from 'next/server';
import {
    provisionTenantStream,
    provisionEventStreamResponse,
    type ProvisionInput,
} from '@/lib/provisionTenant';

export async function POST(req: NextRequest) {
    // Auth enforced by Frappe session — provision_tenant() has is_super_admin() guard.
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const input: ProvisionInput = {
        orgName:  body.orgName,
        fullName: body.adminName ?? body.fullName,
        email:    body.email,
        password: body.password,
        username: body.username || (body.email?.split('@')[0] ?? ''),
        phone:    body.phone,
        plan:     body.plan,
    };

    const wantsSse = (req.headers.get('accept') || '').includes('text/event-stream');
    if (wantsSse) {
        return provisionEventStreamResponse(input);
    }

    // JSON fallback — preserves the contract the existing tenants page
    // already expects so we can roll out SSE incrementally.
    let last: any = null;
    for await (const evt of provisionTenantStream(input)) {
        if (evt.kind !== 'stage') last = evt;
    }
    if (!last) {
        return NextResponse.json({ error: 'No result' }, { status: 500 });
    }
    if (last.kind === 'error') {
        return NextResponse.json({ error: last.message, code: last.code }, { status: 400 });
    }
    return NextResponse.json({
        success: true,
        orgId:    last.frappeOrgId,         // legacy field name
        userId:   last.userId,
        organizationId: last.organizationId,
        slug:     last.slug,
    });
}
