import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Paytm sends a POST request with form data
    const formData = await request.formData();
    const orderId = formData.get('ORDERID') || '';
    const status = formData.get('STATUS') || '';
    
    // We redirect the browser to the frontend page as a GET request using 303 (See Other)
    // This solves the 405 Method Not Allowed error on the page.tsx
    const redirectUrl = new URL('/settings/billing/payment-callback', request.url);
    
    if (orderId) {
        redirectUrl.searchParams.set('order_id', orderId.toString());
    }
    if (status) {
        redirectUrl.searchParams.set('STATUS', status.toString());
    }
    
    return NextResponse.redirect(redirectUrl.toString(), 303);
}
