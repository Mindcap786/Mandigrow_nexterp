import { NextResponse } from 'next/server';

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';

const PARTNER_TYPE_LABELS: Record<string, string> = {
    freelancer: '🧑‍💼 Freelancer Partner',
    agency:     '🏢 Agency / Firm Partner',
    state:      '🌐 State Distributor (Talk to Sales)',
};

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const typeLabel = PARTNER_TYPE_LABELS[data.partner_type] || data.partner_type || 'Unknown';

        console.log('[partner-apply] New application:', { type: typeLabel, name: data.name, email: data.email });

        // ── 1. Save application record in Frappe FIRST (critical) ───────────
        let savedOk = false;
        try {
            const frappeRes = await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.create_partner_application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name:         data.name,
                    email:        data.email,
                    phone:        data.phone,
                    city:         data.city,
                    partner_type: data.partner_type,
                    background:   data.background || '',
                }),
            });

            const frappeBody = await frappeRes.json();
            if (frappeRes.ok && frappeBody?.message?.success) {
                savedOk = true;
                console.log('[partner-apply] ✅ Saved to Frappe:', frappeBody.message);
            } else {
                console.error('[partner-apply] ❌ Frappe save failed:', frappeBody);
            }
        } catch (frappeErr) {
            console.error('[partner-apply] ❌ Frappe connection error:', frappeErr);
        }

        // ── 2. Send admin notification email ────────────────────────────────
        const appliedVia = data.partner_type === 'state' ? 'Talk to Sales' : `Apply as ${data.partner_type}`;
        const emailSubject = `[Partner Application] ${typeLabel} — ${data.name} (${data.city})`;
        const emailMessage = `
New partner application received on MandiGrow.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTNER TYPE:  ${typeLabel}
Applied Via:   ${appliedVia}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAME:          ${data.name}
EMAIL:         ${data.email || '(not provided)'}
WHATSAPP:      ${data.phone}
CITY/DISTRICT: ${data.city}

BACKGROUND:
${data.background || '(not provided)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DB Record Saved: ${savedOk ? 'YES ✅' : 'NO ❌ — CHECK LOGS'}
Please follow up within 24 hours via WhatsApp.
        `.trim();

        try {
            await fetch(`${FRAPPE_URL}/api/method/mandigrow.api.send_contact_email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:    data.name,
                    email:   data.email || (data.phone + '@whatsapp.placeholder'),
                    phone:   data.phone,
                    subject: emailSubject,
                    message: emailMessage,
                }),
            });
        } catch (emailErr) {
            console.warn('[partner-apply] Email send failed (non-blocking):', emailErr);
        }

        return NextResponse.json({
            success: true,
            saved: savedOk,
            message: 'Application received. Our sales team will contact you within 24 hours.',
        });

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
