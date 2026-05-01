import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
    // PDF parsing has been migrated to the Frappe backend
    // to prevent Node.js Canvas/DOMMatrix build errors on Vercel.
    return NextResponse.json({ 
        error: "PDF Parsing is now handled by the Frappe backend." 
    }, { status: 410 });
}
