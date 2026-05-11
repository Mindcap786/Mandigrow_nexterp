import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        console.log('--- NEW PARTNER APPLICATION ---', data);

        // Forward to Frappe Backend
        // URL is local since this runs server-side on Next.js backend
        const frappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';
        
        const response = await fetch(`${frappeUrl}/api/method/mandigrow.api.create_partner_application`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: data.name,
                phone: data.phone,
                city: data.city,
                partner_type: data.partner_type,
                background: data.background
            })
        });

        if (!response.ok) {
            console.error('Frappe response error:', await response.text());
            throw new Error('Frappe backend rejected the request');
        }

        const json = await response.json();
        
        return NextResponse.json({ success: true, message: 'Application sent to Frappe.' });
    } catch (error) {
        console.error('Error processing partner application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process application' },
            { status: 500 }
        );
    }
}
