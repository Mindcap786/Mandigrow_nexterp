import { NextRequest, NextResponse } from 'next/server';

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';

/**
 * POST /api/contact
 * Forwards the contact form submission to Frappe's send_contact_email API,
 * which emails the sales address configured in Site Contact Settings.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
        }

        // Call Frappe RPC — allow_guest=True so no session cookie needed
        const frappeRes = await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.send_contact_email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone: phone || '', subject: subject || 'Contact Form Submission', message: message || '' }),
        });

        const json = await frappeRes.json();

        if (!frappeRes.ok || json?.exc) {
            const errMsg = json?.message || json?.exc_type || 'Frappe API error';
            return NextResponse.json({ error: errMsg }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } catch (err: any) {
        console.error('[contact/route] Error:', err);
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
    }
}

// Keep other methods as 405
export async function GET()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
