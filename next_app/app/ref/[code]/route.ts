import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
    // Next.js 15: params is async
    const resolvedParams = await params;
    const code = resolvedParams.code.toUpperCase();
    
    // Create the response object that redirects to subscribe
    const subscribeUrl = new URL('/subscribe', request.url);
    const response = NextResponse.redirect(subscribeUrl);
    
    // Set cookie on the response
    response.cookies.set('mg_ref_code', code, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        httpOnly: false,
    });
    
    return response;
}
