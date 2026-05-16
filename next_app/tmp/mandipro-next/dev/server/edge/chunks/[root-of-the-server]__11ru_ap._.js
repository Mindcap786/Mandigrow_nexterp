(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__11ru_ap._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
async function middleware(request) {
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: request.headers
        }
    });
    // 1. Get the Frappe user_id cookie
    const userId = request.cookies.get('user_id')?.value;
    const isGuest = !userId || userId === 'Guest';
    const path = request.nextUrl.pathname.replace(/\/$/, '') || '/';
    // 2. PUBLIC ROUTES (No Auth Required)
    const isPublicRoute = path === '/' || path === '' || path === '/login' || path === '/signup' || path === '/subscribe' || path === '/checkout' || path === '/settings/billing/payment-callback' || path === '/join' || path === '/contact' || path === '/suspended' || path === '/auth/callback' || path === '/manifest.json' || path === '/robots.txt' || path === '/sitemap.xml' || path === '/opengraph-image' || // SEO marketing pages — must be reachable without auth
    path === '/faq' || path === '/privacy' || path === '/terms' || path === '/refund-policy' || path === '/mandi-billing' || path === '/commission-agent-software' || path === '/mandi-khata-software' || path === '/wholesale-trader-erp' || path === '/gst-mandi-compliance' || path === '/sabzi-mandi-software' || path === '/sabji-billing-software' || path === '/fruit-vegetable-billing' || path === '/features' || path === '/pricing' || path === '/te' || path === '/partners' || path === '/mandi-software-andhra-pradesh' || path === '/mandi-software-telangana' || path === '/mandi-software-maharashtra' || path === '/blog' || path.startsWith('/blog/') || path.startsWith('/locales') || path.startsWith('/public') || path.startsWith('/icons') || path.startsWith('/_next') || path.startsWith('/static') || path.startsWith('/assets') || path === '/favicon.ico';
    // 3. UNAUTHENTICATED USER PROTECTION
    if (isGuest && !isPublicRoute) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    // 4. PREVENT LOGIN PAGE ACCESS WHEN LOGGED IN
    if (!isGuest && path === '/login') {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = '/dashboard';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(dashUrl);
    }
    return response;
}
const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Note: /api/admin/* is explicitly included via the second matcher entry.
         * Other /api/* routes remain excluded.
         */ '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|css|js|map)$).*)',
        '/api/admin/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__11ru_ap._.js.map