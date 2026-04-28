import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Get the Frappe user_id cookie
    const userId = request.cookies.get('user_id')?.value;
    const isGuest = !userId || userId === 'Guest';

    const path = request.nextUrl.pathname.replace(/\/$/, '') || '/'

    // 2. PUBLIC ROUTES (No Auth Required)
    const isPublicRoute =
        path === '/' ||
        path === '' ||
        path === '/login' ||
        path === '/signup' ||
        path === '/subscribe' ||
        path === '/checkout' ||
        path === '/join' ||
        path === '/contact' ||
        path === '/suspended' ||
        path === '/auth/callback' ||
        path === '/manifest.json' ||
        path === '/robots.txt' ||
        path === '/sitemap.xml' ||
        path === '/opengraph-image' ||
        // SEO marketing pages — must be reachable without auth
        path === '/faq' ||
        path === '/privacy' ||
        path === '/terms' ||
        path === '/mandi-billing' ||
        path === '/commission-agent-software' ||
        path === '/mandi-khata-software' ||
        path === '/blog' ||
        path.startsWith('/blog/') ||
        path.startsWith('/locales') ||
        path.startsWith('/public') ||
        path.startsWith('/icons') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path.startsWith('/assets') ||
        path === '/favicon.ico'

    // 3. UNAUTHENTICATED USER PROTECTION
    if (isGuest && !isPublicRoute) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // 4. PREVENT LOGIN PAGE ACCESS WHEN LOGGED IN
    if (!isGuest && path === '/login') {
        const dashUrl = request.nextUrl.clone()
        dashUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Note: /api/admin/* is explicitly included via the second matcher entry.
         * Other /api/* routes remain excluded.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js|map)$).*)',
        '/api/admin/:path*',
    ],
}
