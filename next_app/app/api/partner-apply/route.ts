import { NextResponse } from 'next/server';

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';

// Human-readable labels for each partner tier
const PARTNER_TYPE_LABELS: Record<string, string> = {
    freelancer: '🧑‍💼 Freelancer Partner',
    agency:     '🏢 Agency / Firm Partner',
    state:      '🌐 State Distributor (Talk to Sales)',
};

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const typeLabel = PARTNER_TYPE_LABELS[data.partner_type] || data.partner_type || 'Unknown';
        const appliedVia = data.partner_type === 'state'
            ? 'Talk to Sales Team form'
            : `Apply as ${data.partner_type === 'agency' ? 'Agency' : 'Freelancer'} form`;

        console.log('--- NEW PARTNER APPLICATION ---', { type: typeLabel, ...data });

        // ── 1. Send sales notification email via Frappe ─────────────────────
        const emailSubject = `[Partner Application] ${typeLabel} — ${data.name} (${data.city})`;

        const emailMessage = `
New partner application received on MandiGrow.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTNER TYPE:  ${typeLabel}
Applied Via:   ${appliedVia}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAME:          ${data.name}
WHATSAPP:      ${data.phone}
CITY/DISTRICT: ${data.city}

BACKGROUND:
${data.background || '(not provided)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please follow up within 24 hours via WhatsApp.
        `.trim();

        const emailRes = await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.send_contact_email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name:    data.name,
                email:   data.phone + '@whatsapp.placeholder', // phone as identifier since no email field
                phone:   data.phone,
                subject: emailSubject,
                message: emailMessage,
            }),
        });

        if (!emailRes.ok) {
            console.warn('[partner-apply] Email send failed (non-blocking):', await emailRes.text());
        } else {
            console.log('[partner-apply] Sales notification email sent:', emailSubject);
        }

        // ── 2. Save application record in Frappe ────────────────────────────
        try {
            const frappeRes = await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.create_partner_application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name:         data.name,
                    phone:        data.phone,
                    city:         data.city,
                    partner_type: data.partner_type,
                    background:   data.background,
                }),
            });

            if (!frappeRes.ok) {
                console.warn('[partner-apply] Frappe record creation failed (non-blocking):', await frappeRes.text());
            }
        } catch (frappeErr) {
            // Non-blocking — don't fail the response if Frappe record fails
            console.warn('[partner-apply] Frappe record error:', frappeErr);
        }

        return NextResponse.json({ success: true, message: 'Application received. Our sales team will contact you within 24 hours.' });
    } catch (error) {
        console.error('[partner-apply] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process application' },
            { status: 500 }
        );
    }
}

export async function GET()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }
