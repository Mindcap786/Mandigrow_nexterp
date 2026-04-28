// Public self-signup endpoint.
//
// Streams provisioning progress via Server-Sent Events so the
// /signup/provisioning page can render real per-stage state instead
// of a fake spinner. The shared orchestrator in web/lib/provisionTenant.ts
// owns all the actual work — this route is purely a transport adapter
// that adds rate limiting and a JSON fallback for non-SSE clients.

import { NextRequest, NextResponse } from 'next/server';
import {
    provisionTenantStream,
    provisionEventStreamResponse,
    type ProvisionInput,
} from '@/lib/provisionTenant';

// Naive in-memory throttle: 5 attempts per IP per 10 minutes. Replace with
// Upstash/Redis when we move beyond a single Next.js node.
const ATTEMPTS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function rateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const slot = ATTEMPTS.get(ip);
    if (!slot || slot.resetAt < now) {
        ATTEMPTS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true };
    }
    slot.count += 1;
    if (slot.count > MAX_ATTEMPTS) {
        return { ok: false, retryAfterSec: Math.ceil((slot.resetAt - now) / 1000) };
    }
    return { ok: true };
}

function clientIp(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown'
    );
}

export async function POST(req: NextRequest) {
    const ip = clientIp(req);
    const rl = rateLimit(ip);
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Too many signup attempts. Try again later.' },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 600) } }
        );
    }

    let input: ProvisionInput;
    try {
        const body = await req.json();
        input = {
            orgName:  body.orgName,
            fullName: body.fullName ?? body.adminName,
            email:    body.email,
            password: body.password,
            username: body.username,
            phone:    body.phone,
            plan:     body.plan,
        };
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const wantsSse = (req.headers.get('accept') || '').includes('text/event-stream');
    if (wantsSse) {
        return provisionEventStreamResponse(input);
    }

    // JSON fallback (curl, server-side calls, mobile that can't do SSE).
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
    return NextResponse.json(last);
}
