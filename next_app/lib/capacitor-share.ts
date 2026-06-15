/**
 * Unified download + share helper that works on:
 *   • Web / desktop browsers  — anchor download + navigator.share fallback
 *   • Capacitor iOS / Android — @capacitor/filesystem + @capacitor/share
 *
 * Why: in a Capacitor WebView, `<a download>` is ignored and
 * navigator.share({ files }) silently fails. Native code must write the file
 * to the app sandbox, then hand the file URI to the native share sheet.
 */
import { isNativePlatform } from '@/lib/capacitor-utils';

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => {
            const result = reader.result as string; // data:application/pdf;base64,XXX
            const comma = result.indexOf(',');
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.readAsDataURL(blob);
    });
}

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
    if (isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const base64 = await blobToBase64(blob);
        const write = await Filesystem.writeFile({
            path: filename,
            data: base64,
            directory: Directory.Cache,
        });
        // Capacitor has no "Save to Downloads" picker — surface the system
        // share sheet instead so the user can save to Files / Drive / WhatsApp.
        await Share.share({
            title: filename,
            url: write.uri,
            dialogTitle: 'Save or share file',
        });
        return;
    }

    const isMobileWeb = typeof window !== 'undefined' && /android|iphone|ipad/i.test(navigator.userAgent);

    // Path 1: Data URI approach bypasses Android Chrome's ObjectURL UUID bug
    // This allows it to act as a proper background "download" placing it in the Downloads folder
    if (isMobileWeb) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 100);
        return;
    }

    // Path 3: Standard Object URL for Desktop browsers
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 5000);
}

export async function shareBlob(
    blob: Blob,
    filename: string,
    opts: { title?: string; text?: string } = {},
): Promise<void> {
    if (isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const base64 = await blobToBase64(blob);
        const write = await Filesystem.writeFile({
            path: filename,
            data: base64,
            directory: Directory.Cache,
        });
        await Share.share({
            title: opts.title ?? filename,
            text: opts.text,
            url: write.uri,
            dialogTitle: opts.title ?? 'Share',
        });
        return;
    }

    // Web path: try the Web Share API (shows native OS share sheet on macOS Safari,
    // iOS Safari, Android Chrome — AirDrop, Mail, Messages, WhatsApp, etc.)
    let fileType = blob.type;
    if (!fileType || fileType === 'application/octet-stream') {
        fileType = 'application/pdf';
    }
    const file = new File([blob], filename, { type: fileType });

    if (typeof navigator !== 'undefined' && navigator.share) {
        
        const attemptShare = async (withFile: boolean) => {
            if (withFile) {
                await navigator.share({ files: [file], title: opts.title, text: opts.text });
            } else {
                await navigator.share({ title: opts.title, text: (opts.text ? opts.text + '\n\n' : '') + `Please find the downloaded attached file: ${filename}` });
                downloadBlobSilent(blob, filename);
            }
        };

        try {
            // Optimistic first try (often fails due to PDF generation taking too long)
            // Or hangs silently if OS rejects the file without throwing
            let timeoutId: NodeJS.Timeout;
            const timeoutPromise0 = new Promise<void>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 2500);
            });
            await Promise.race([attemptShare(true), timeoutPromise0]).finally(() => clearTimeout(timeoutId));
            return;
        } catch (err: any) {
            if (err?.name === 'AbortError') return;

            // Regardless of whether it failed due to timeout (NotAllowedError) or lack of file support (TypeError),
            // we MUST get a fresh user gesture to reliably open the share menu, because the original click has expired.
            return new Promise<void>((resolve) => {
                const overlay = document.createElement('div');
                overlay.style.position = 'fixed';
                overlay.style.top = '0'; overlay.style.left = '0';
                overlay.style.width = '100vw'; overlay.style.height = '100vh';
                overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                overlay.style.zIndex = '999999';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.backdropFilter = 'blur(4px)';

                const modal = document.createElement('div');
                modal.style.backgroundColor = '#fff';
                modal.style.padding = '24px';
                modal.style.borderRadius = '16px';
                modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                modal.style.textAlign = 'center';
                modal.style.maxWidth = '300px';
                modal.style.fontFamily = 'inherit';

                const title = document.createElement('h3');
                title.textContent = 'Document Ready';
                title.style.margin = '0 0 8px 0';
                title.style.fontSize = '18px';
                title.style.color = '#0f172a';
                title.style.fontWeight = '800';

                const desc = document.createElement('p');
                desc.textContent = 'Your PDF has been generated and is ready to share.';
                desc.style.margin = '0 0 20px 0';
                desc.style.fontSize = '14px';
                desc.style.color = '#64748b';

                const btnContainer = document.createElement('div');
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '8px';

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.style.flex = '1';
                cancelBtn.style.padding = '10px';
                cancelBtn.style.borderRadius = '8px';
                cancelBtn.style.border = '1px solid #e2e8f0';
                cancelBtn.style.backgroundColor = '#f8fafc';
                cancelBtn.style.color = '#475569';
                cancelBtn.style.fontWeight = 'bold';
                cancelBtn.style.cursor = 'pointer';

                const shareBtn = document.createElement('button');
                shareBtn.textContent = 'Open Share Menu';
                shareBtn.style.flex = '2';
                shareBtn.style.padding = '10px';
                shareBtn.style.borderRadius = '8px';
                shareBtn.style.border = 'none';
                shareBtn.style.backgroundColor = '#10b981';
                shareBtn.style.color = '#fff';
                shareBtn.style.fontWeight = 'bold';
                shareBtn.style.cursor = 'pointer';

                const cleanup = () => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                };

                cancelBtn.onclick = () => {
                    cleanup();
                    resolve();
                };

                shareBtn.onclick = async () => {
                    cleanup();
                    try {
                        // Fresh user gesture! Try attaching the file again.
                        await attemptShare(true);
                    } catch (err2: any) {
                        if (err2?.name === 'AbortError') { resolve(); return; }
                        
                        console.warn('[capacitor-share] fresh file share failed, trying text fallback:', err2);
                        try {
                            await attemptShare(false);
                        } catch (err3: any) {
                            if (err3?.name !== 'AbortError') {
                                console.warn('[capacitor-share] text fallback failed:', err3);
                                await downloadBlob(blob, filename);
                                alert(`File downloaded as ${filename}. Direct sharing is blocked or not supported by your OS.`);
                            }
                        }
                    }
                    resolve();
                };

                btnContainer.appendChild(cancelBtn);
                btnContainer.appendChild(shareBtn);
                modal.appendChild(title);
                modal.appendChild(desc);
                modal.appendChild(btnContainer);
                overlay.appendChild(modal);
                // Ensure it's appended to the document body reliably
                if (document.body) {
                    document.body.appendChild(overlay);
                } else {
                    document.documentElement.appendChild(overlay);
                }
            });
        }
    } else {
        // Fallback for completely unsupported browsers (very old)
        await downloadBlob(blob, filename);
        alert(`File downloaded as ${filename}. Your browser does not support direct file sharing to other apps.`);
    }
}

/**
 * Silently trigger a browser download without awaiting the save dialog.
 * Use this when you need to open another app (e.g. Mail) immediately after.
 */
export function downloadBlobSilent(blob: Blob, filename: string): void {
    const isMobileWeb = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
    
    // Android Chrome drops extensions on object URLs. Use Data URIs safely for background silent.
    if (isMobileWeb) {
        const reader = new FileReader();
        reader.onload = () => {
            const a = document.createElement('a');
            a.href = reader.result as string;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => document.body.removeChild(a), 100);
        };
        reader.readAsDataURL(blob);
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 5000);
}

/**
 * Print a PDF blob.
 * Web: opens the blob in a new tab (browser PDF viewer → Ctrl+P / ⌘+P).
 * Native: surfaces the system share sheet so the user can "Print" or save.
 */
export async function printBlob(blob: Blob, filename: string): Promise<boolean> {
    if (isNativePlatform()) {
        // Native has no browser PDF viewer — share sheet lets the user print from Files / AirPrint
        await downloadBlob(blob, filename);
        return true;
    }

    const isMobileWeb = typeof window !== 'undefined' && /android|iphone|ipad/i.test(navigator.userAgent);

    if (isMobileWeb && typeof navigator !== 'undefined' && navigator.share) {
        let fileType = blob.type || 'application/pdf';
        const file = new File([blob], filename, { type: fileType });
        try {
            // Pass files — mobile browsers will show the native share sheet.
            await navigator.share({ files: [file], title: 'Print ' + filename });
            return true;
        } catch (err: any) {
            if (err?.name === 'AbortError' || err?.name === 'NotAllowedError') return false;
            console.warn('[capacitor-share] navigator.share failed, falling back:', err);
        }
    }

    // For all platforms, open the PDF in a new tab without auto-printing
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    
    if (win) {
        // Pop-up allowed
        setTimeout(() => URL.revokeObjectURL(url), 15000);
        return true;
    } else {
        // Pop-up blocked or failed
        console.warn('[capacitor-share] window.open blocked, falling back to download');
        URL.revokeObjectURL(url);
        await downloadBlob(blob, filename);
        return false;
    }
}

/**
 * WhatsApp-first share: native uses the share sheet (user picks WhatsApp);
 * web opens wa.me with the text (file attachment not supported by wa.me link).
 */
export async function shareToWhatsApp(
    blob: Blob,
    filename: string,
    text: string,
): Promise<void> {
    if (isNativePlatform()) {
        await shareBlob(blob, filename, { title: filename, text });
        return;
    }
    
    if (typeof navigator !== 'undefined' && navigator.share) {
        let fileType = blob.type || 'application/pdf';
        const file = new File([blob], filename, { type: fileType });
        try {
            await navigator.share({ files: [file], title: filename, text });
            return;
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            console.warn('[capacitor-share] navigator.share with files failed for WhatsApp fallback:', err);
            
            try {
                await downloadBlob(blob, filename);
                await navigator.share({ title: filename, text: text + `\n\nDownloaded file: ${filename}` });
                return;
            } catch (fallbackErr: any) {
                if (fallbackErr?.name === 'AbortError') return;
                console.warn('[capacitor-share] navigator.share text fallback failed:', fallbackErr);
            }
        }
    } else {
        await downloadBlob(blob, filename);
    }

    alert(`File downloaded as ${filename}. Your browser does not support direct file sharing to other apps.`);
}