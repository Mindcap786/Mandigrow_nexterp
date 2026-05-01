import { NextResponse, NextRequest } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    const auth = await verifyAdminAccess(request, 'tenants', 'read');
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    try {
        // Fetch from Frappe
        const frappeUrl = 'http://localhost:8000/api/method/frappe.client.get_list';
        const response = await fetch(`${frappeUrl}?doctype=Mandi Organization&fields=["*"]`, {
            headers: {
                // Since this is a server-side call, we might need an API key or session
                // For now, if we're on localhost, we can try to pass the cookie if available
                'Cookie': request.headers.get('cookie') || ''
            }
        });

        const result = await response.json();
        const orgs = result.message || [];

        // Fetch Users to find owners
        const userResponse = await fetch(`${frappeUrl}?doctype=User&fields=["name", "full_name", "email", "mandi_organization", "role_type"]`, {
            headers: {
                'Cookie': request.headers.get('cookie') || ''
            }
        });
        const userResult = await userResponse.json();
        const users = userResult.message || [];

        const processed = orgs.map((org: any) => {
            const orgUsers = users.filter((u: any) => u.mandi_organization === org.name);
            const owner = orgUsers.find((u: any) => u.role_type === 'admin') || orgUsers[0] || null;

            return {
                id: org.name,
                name: org.organization_name,
                subscription_tier: org.subscription_tier || 'basic',
                is_active: org.status === 'active',
                status: org.status || 'trial',
                created_at: org.creation,
                tenant_type: 'mandi',
                enabled_modules: ['mandi'],
                owner: owner ? {
                    id: owner.name,
                    full_name: owner.full_name,
                    email: owner.email
                } : null,
                profiles: orgUsers
            };
        });

        return NextResponse.json(processed);
    } catch (error: any) {
        console.error('[Admin Tenants API] Fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
