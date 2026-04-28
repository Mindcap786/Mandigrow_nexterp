import { NextResponse } from 'next/server';

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';

/**
 * POST /api/auth/check-unique
 *
 * Proxies email/username uniqueness checks to Frappe's
 * mandigrow.api.check_unique whitelisted method.
 * Kept as a thin Next API route so the login page can call
 * a relative URL without needing CORS or cookies.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.check_unique`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Frappe-Site-Name': 'mandigrow.localhost',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        // Frappe wraps in { message: { ... } }
        return NextResponse.json(data?.message || data);

    } catch (error: any) {
        console.error('[Check Unique] Error:', error.message);
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
