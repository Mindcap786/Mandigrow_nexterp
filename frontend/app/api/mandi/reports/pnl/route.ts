/**
 * GET /api/mandi/reports/pnl
 *
 * Trading P&L Report for the mandi. Delegates to the `get_profit_loss`
 * Frappe RPC which aggregates revenue and expense GL entries.
 */
import { NextRequest, NextResponse } from 'next/server'
import { apiError } from '../../_lib/server-client'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (!dateFrom || !dateTo) {
        return apiError.validation(['date_from and date_to are required'])
    }

    try {
        const frappeUrl = 'http://localhost:8000/api/method/mandigrow.api.get_profit_loss';
        const response = await fetch(frappeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({})
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.exception || 'Frappe Error');

        return NextResponse.json(result.message || { data: [] });
    } catch (error: any) {
        console.error('[reports/pnl:GET]', error.message);
        return apiError.server(error.message);
    }
}
