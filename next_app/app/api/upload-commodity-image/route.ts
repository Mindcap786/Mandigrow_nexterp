/**
 * Next.js API route: /api/upload-commodity-image
 * Uploads commodity image from Vercel → Cloudflare R2.
 * Securely fetches credentials from Frappe (site_config.json) using the user's session,
 * avoiding the need for Vercel Environment Variables entirely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file     = formData.get('file')    as File   | null;
        const itemId   = formData.get('item_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const cookie = req.headers.get('cookie') || '';
        const frappeBase = process.env.NEXT_PUBLIC_FRAPPE_URL || 'https://mandigrow.frappe.cloud';

        // ── 1. Fetch R2 credentials securely from Frappe ────────────────────
        // Frappe reads these from site_config.json. This requires the user to be a System Manager.
        const credsRes = await fetch(`${frappeBase}/api/method/mandigrow.api.get_r2_credentials`, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
                'X-Frappe-Site-Name': 'mandigrow.com',
            }
        });

        if (!credsRes.ok) {
            console.error('[upload-commodity-image] Failed to fetch credentials from Frappe:', credsRes.status);
            return NextResponse.json({ success: false, error: 'Unauthorized or failed to fetch R2 credentials from server' }, { status: 401 });
        }

        const credsData = await credsRes.json();
        const r2 = credsData.message;

        if (!r2 || !r2.bucket) {
            return NextResponse.json({ success: false, error: 'R2 credentials missing on Frappe server' }, { status: 500 });
        }

        // ── 2. Generate a unique object key ──────────────────────────────────
        const ext  = file.name.split('.').pop() || 'png';
        const hash = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const key  = `commodity-images/${hash}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer      = Buffer.from(arrayBuffer);

        // ── 3. Upload to Cloudflare R2 ───────────────────────────────────────
        const s3 = new S3Client({
            region: 'auto',
            endpoint: r2.endpoint,
            credentials: {
                accessKeyId: r2.access_key_id,
                secretAccessKey: r2.secret_access_key,
            },
        });

        await s3.send(new PutObjectCommand({
            Bucket:      r2.bucket,
            Key:         key,
            Body:        buffer,
            ContentType: file.type || 'image/jpeg',
        }));

        // ── 4. Build the public CDN URL ──────────────────────────────────────
        const fileUrl = `${(r2.public_url || '').replace(/\/$/, '')}/${key}`;

        // ── 5. Tell Frappe to persist the URL in Item.image ──────────────────
        if (itemId) {
            try {
                await fetch(`${frappeBase}/api/method/mandigrow.api.set_item_image_url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookie,
                        'X-Frappe-Site-Name': 'mandigrow.com',
                    },
                    body: JSON.stringify({ item_id: itemId, image_url: fileUrl }),
                });
            } catch (frappeErr) {
                console.error('[upload-commodity-image] Frappe update failed:', frappeErr);
            }
        }

        return NextResponse.json({ success: true, file_url: fileUrl });

    } catch (err: any) {
        console.error('[upload-commodity-image] Error:', err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
