/**
 * Next.js API route: /api/upload-commodity-image
 * Uploads commodity image from Vercel → Cloudflare R2.
 * Credentials come from Vercel Environment Variables only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Client() {
    const endpoint        = process.env.R2_ENDPOINT;
    const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
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
        const formData = await req.formData();
        const file     = formData.get('file')    as File   | null;
        const itemId   = formData.get('item_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bucket    = process.env.R2_BUCKET;
        const publicUrl = process.env.R2_PUBLIC_URL;

        if (!bucket) {
            return NextResponse.json({ success: false, error: 'R2_BUCKET not configured' }, { status: 500 });
        }

        const ext  = file.name.split('.').pop() || 'png';
        const hash = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const key  = `commodity-images/${hash}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer      = Buffer.from(arrayBuffer);

        const s3 = getS3Client();
        await s3.send(new PutObjectCommand({
            Bucket:      bucket,
            Key:         key,
            Body:        buffer,
            ContentType: file.type || 'image/jpeg',
        }));

        const fileUrl = `${(publicUrl || '').replace(/\/$/, '')}/${key}`;

        if (itemId) {
            const frappeBase = process.env.NEXT_PUBLIC_FRAPPE_URL || 'https://mandigrow.frappe.cloud';
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
