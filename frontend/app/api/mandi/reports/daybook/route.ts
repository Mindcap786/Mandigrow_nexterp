/**
 * GET /api/mandi/reports/daybook
 *
 * Day Book report — all financial activity for a given date (or date range).
 * Supports two modes:
 *   - cash   → cash account entries only
 *   - ledger → all ledger entries for the period
 *
 * Returns entries sorted chronologically with running balance totals.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createMandiServerClient, requireAuth, apiError } from '../../_lib/server-client'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const mode = (searchParams.get('mode') ?? 'all') as 'cash' | 'bank' | 'all'

    // Support single date OR date range
    const effectiveFrom = dateFrom ?? date

    if (!effectiveFrom) {
        return apiError.validation(['date or date_from is required'])
    }

    try {
        const frappeUrl = 'http://localhost:8000/api/method/mandigrow.api.get_daybook';
        const response = await fetch(frappeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
            },
            body: JSON.stringify({
                date: effectiveFrom
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.exception || 'Frappe Error');
        
        return NextResponse.json(result.message || { entries: [] });
    } catch (error: any) {
        console.error('[reports/daybook:GET]', error.message);
        return apiError.server(error.message);
    }
}
