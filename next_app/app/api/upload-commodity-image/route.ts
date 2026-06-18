/**
 * Next.js API route: /api/upload-commodity-image
 *
 * Uploads a commodity image directly from Vercel → Cloudflare R2.
 * This completely bypasses Frappe Cloud's site_config.json and requires
 * no boto3 installation on the Frappe server.
 *
 * Credentials are read from Vercel environment variables:
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET, R2_PUBLIC_URL
 *
 * After uploading to R2, it calls mandigrow.api.set_item_image_url on Frappe
 * to save the public CDN URL in the Item.image field.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialise the S3 client once — it's reused across requests (Vercel keeps the
// function warm between invocations, so this avoids repeated instantiation costs).
function getS3Client() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
        throw new Error('R2 environment variables are not configured on Vercel');
    }

    return new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
    });
}

export async function POST(req: NextRequest) {
    try {
        // ── 1. Parse multipart form data ────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const itemId = formData.get('item_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // ── 2. Read env vars ─────────────────────────────────────────────────
        const bucket = process.env.R2_BUCKET;
        const publicUrl = process.env.R2_PUBLIC_URL;

        if (!bucket) {
            return NextResponse.json({ success: false, error: 'R2_BUCKET not configured' }, { status: 500 });
        }

        // ── 3. Generate a unique key and upload to R2 ────────────────────────
        const ext = file.name.split('.').pop() || 'png';
        const hash = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const key = `commodity-images/${hash}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const s3 = getS3Client();
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type || 'image/jpeg',
        }));

        // ── 4. Build the public URL ──────────────────────────────────────────
        const fileUrl = publicUrl
            ? `${publicUrl.replace(/\/$/, '')}/${key}`
            : `${process.env.R2_ENDPOINT}/${bucket}/${key}`;

        // ── 5. Tell Frappe to update Item.image with the new URL ─────────────
        if (itemId) {
            const frappeBase = process.env.NEXT_PUBLIC_FRAPPE_URL || 'http://mandigrow.localhost:8000';
            try {
                const cookie = req.headers.get('cookie') || '';
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
                // Non-fatal — the file is already in R2; the caller can retry the
                // Frappe update separately if needed.
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
