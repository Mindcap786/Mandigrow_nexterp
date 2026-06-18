/**
 * Next.js API route: /api/upload-commodity-image
 *
 * Uploads a commodity image directly from Vercel → Cloudflare R2.
 * Credentials: Vercel env vars (with hardcoded fallbacks for reliability).
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ── Cloudflare R2 credentials ──────────────────────────────────────────────
// Primary: Vercel environment variables (set in Vercel dashboard)
// Fallback: hardcoded values — ensures the route works even if Vercel
//           env vars fail to propagate (e.g. caching / hobby plan limits)
const R2_ACCESS_KEY_ID     = process.env.R2_ACCESS_KEY_ID     || 'c0bcb083815c1313406695e2a20b3e07';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '49119365cda9e125c2f266a886ecfc3633ee3544b00d5ec7ac3110e5aa7a6803';
const R2_ENDPOINT          = process.env.R2_ENDPOINT          || 'https://e5476ae0768db7598f8dafeba5b85baf.r2.cloudflarestorage.com';
const R2_BUCKET            = process.env.R2_BUCKET            || 'mandigrow-files';
const R2_PUBLIC_URL        = process.env.R2_PUBLIC_URL        || 'https://pub-93a875707656429ab4a8999c9daa11de.r2.dev';

function getS3Client() {
    return new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        // ── 1. Parse multipart form data ────────────────────────────────────
        const formData = await req.formData();
        const file   = formData.get('file')    as File   | null;
        const itemId = formData.get('item_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // ── 2. Generate a unique object key ──────────────────────────────────
        const ext  = file.name.split('.').pop() || 'png';
        const hash = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const key  = `commodity-images/${hash}.${ext}`;

        // ── 3. Upload to R2 ──────────────────────────────────────────────────
        const arrayBuffer = await file.arrayBuffer();
        const buffer      = Buffer.from(arrayBuffer);

        const s3 = getS3Client();
        await s3.send(new PutObjectCommand({
            Bucket:      R2_BUCKET,
            Key:         key,
            Body:        buffer,
            ContentType: file.type || 'image/jpeg',
        }));

        // ── 4. Build the public CDN URL ──────────────────────────────────────
        const fileUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

        // ── 5. Tell Frappe to persist the URL in Item.image ──────────────────
        if (itemId) {
            const frappeBase = process.env.NEXT_PUBLIC_FRAPPE_URL || 'https://mandigrow.frappe.cloud';
            try {
                const cookie = req.headers.get('cookie') || '';
                const frappeRes = await fetch(
                    `${frappeBase}/api/method/mandigrow.api.set_item_image_url`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cookie':       cookie,
                            'X-Frappe-Site-Name': 'mandigrow.com',
                        },
                        body: JSON.stringify({ item_id: itemId, image_url: fileUrl }),
                    }
                );
                if (!frappeRes.ok) {
                    console.warn('[upload-commodity-image] Frappe returned', frappeRes.status);
                }
            } catch (frappeErr) {
                // Non-fatal — the file is already in R2
                console.error('[upload-commodity-image] Frappe update failed:', frappeErr);
            }
        }

        return NextResponse.json({ success: true, file_url: fileUrl });

    } catch (err: any) {
        console.error('[upload-commodity-image] R2 upload error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
