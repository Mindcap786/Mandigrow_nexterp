/**
 * Debug endpoint: /api/debug-env
 * Returns which R2 env vars are available at runtime on Vercel.
 * DELETE THIS FILE after debugging is complete.
 */
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        R2_BUCKET:     process.env.R2_BUCKET     ? 'SET ✅' : 'MISSING ❌',
        R2_ENDPOINT:   process.env.R2_ENDPOINT   ? 'SET ✅' : 'MISSING ❌',
        R2_ACCESS_KEY: process.env.R2_ACCESS_KEY_ID ? 'SET ✅' : 'MISSING ❌',
        R2_SECRET_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'SET ✅' : 'MISSING ❌',
        R2_PUBLIC_URL: process.env.R2_PUBLIC_URL  ? 'SET ✅' : 'MISSING ❌',
        FRAPPE_URL:    process.env.NEXT_PUBLIC_FRAPPE_URL || 'not set',
        NODE_ENV:      process.env.NODE_ENV,
    });
}
