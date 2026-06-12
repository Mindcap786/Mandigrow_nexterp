"use client";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDocumentFonts() {
    const fontFaceSet = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (!fontFaceSet?.ready) return;
    try { await fontFaceSet.ready; } catch {}
}

async function waitForImages(root: ParentNode) {
    const images = Array.from(root.querySelectorAll("img"));
    await Promise.all(
        images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
            });
        })
    );
}

function prepareInvoiceCloneForExport(clone: HTMLElement, renderWidth: number) {
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());
    clone.style.width = `${renderWidth}px`;
    clone.style.maxWidth = "none";
    clone.style.margin = "0";
    clone.style.overflow = "visible";
    clone.style.boxShadow = "none";
    clone.style.border = "none";

    const orgName = clone.querySelector<HTMLElement>("[data-invoice-org-name]");
    if (orgName) {
        orgName.style.overflow = "visible";
        orgName.style.whiteSpace = "normal";
        orgName.style.textOverflow = "clip";
        orgName.style.lineHeight = "1.12";
        orgName.style.paddingBottom = "4px";
    }

    const title = clone.querySelector<HTMLElement>("[data-invoice-title]");
    if (title) {
        title.style.overflow = "visible";
        title.style.lineHeight = "1.08";
        title.style.paddingBottom = "6px";
    }
}

async function renderCanvasFromElement(target: HTMLElement, renderWidth: number) {
    const renderHeight = Math.max(
        Math.ceil(target.scrollHeight || 0),
        Math.ceil(target.getBoundingClientRect().height || 0)
    );

    await waitForImages(target);
    await waitForDocumentFonts();
    await sleep(120);

    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        width: renderWidth,
        height: renderHeight,
        windowWidth: renderWidth,
        windowHeight: renderHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDocument) => {
            clonedDocument.body.style.margin = "0";
            clonedDocument.body.style.background = "#ffffff";
            const clonedInvoice = clonedDocument.getElementById(target.id);
            if (clonedInvoice instanceof HTMLElement) {
                prepareInvoiceCloneForExport(clonedInvoice, renderWidth);
            }
        },
    });
}

export async function generateInvoicePDF(sale: any, organization: any): Promise<Blob> {
    let sourceElement = document.getElementById("invoice-print") as HTMLElement | null;
    let offScreenRoot: { render: (node: unknown) => void; unmount: () => void } | null = null;
    let offScreenContainer: HTMLElement | null = null;

    if (!sourceElement) {
        const { default: BuyerInvoice } = await import("@/components/sales/invoice-template");
        const { createRoot } = await import("react-dom/client");
        const { LanguageProvider } = await import("@/components/i18n/language-provider");
        const React = await import("react");

        offScreenContainer = document.createElement("div");
        // Use a wider container and let it size naturally (no overflow hidden)
        offScreenContainer.style.cssText = "position:fixed;left:-9999px;top:0;width:840px;background:white;z-index:-1;visibility:hidden;";
        document.body.appendChild(offScreenContainer);

        offScreenRoot = createRoot(offScreenContainer);
        await new Promise<void>((resolve) => {
            offScreenRoot!.render(
                React.createElement(LanguageProvider, null, 
                    React.createElement(BuyerInvoice, { sale, organization })
                )
            );
            // Wait longer for fonts, images, and hooks (usePlatformBranding) to load
            setTimeout(resolve, 1200);
        });

        sourceElement = offScreenContainer.querySelector("#invoice-print") as HTMLElement | null;
    }

    if (!sourceElement) throw new Error("Invoice content not found for export");

    try {
        await waitForDocumentFonts();
        // Get the full scrollable height — not just the visible portion
        const renderWidth = Math.max(
            Math.ceil(sourceElement.getBoundingClientRect().width || sourceElement.scrollWidth || 0),
            800
        );
        // Force full height by temporarily expanding any overflow-hidden ancestors
        sourceElement.style.overflow = 'visible';
        sourceElement.style.height = 'auto';
        await sleep(80); // allow reflow
        // Extract footer text before capturing canvas
        let footerTexts: string[] = [];
        const footerElement = sourceElement.querySelector('.invoice-footer-bar') as HTMLElement | null;
        if (footerElement) {
            footerTexts = Array.from(footerElement.querySelectorAll('span')).map(el => el.textContent?.trim() || '');
            footerElement.style.display = 'none'; // hide it so it doesn't render in canvas
        }

        const { default: jsPDF } = await import("jspdf");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const drawFooter = () => {
            if (footerTexts.length >= 3) {
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(150, 150, 150);
                pdf.text(footerTexts[0], 10, pageHeight - 8);
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(50, 50, 50);
                pdf.text(footerTexts[1], pageWidth / 2, pageHeight - 8, { align: "center" });
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(150, 150, 150);
                pdf.text(footerTexts[2], pageWidth - 10, pageHeight - 8, { align: "right" });
            }
        };

        // Render the entire invoice as a single canvas
        const canvas = await renderCanvasFromElement(sourceElement, renderWidth);
        const imageData = canvas.toDataURL("image/jpeg", 0.75);
        
        // Calculate how much height this takes on the A4 page
        const totalImageHeight = (canvas.height * pageWidth) / canvas.width;
        
        let heightLeft = totalImageHeight;
        let position = 0;

        pdf.addImage(imageData, "JPEG", 0, position, pageWidth, totalImageHeight);
        drawFooter();
        
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imageData, "JPEG", 0, position, pageWidth, totalImageHeight);
            drawFooter();
            heightLeft -= pageHeight;
        }

        if (footerElement) footerElement.style.display = '';

        return pdf.output("blob");
    } finally {
        offScreenRoot?.unmount();
        offScreenContainer?.remove();
    }
}

export async function generatePurchaseBillPDF(lot: any, arrival: any, organization: any, arrivalLots: any[]): Promise<Blob> {
    let sourceElement = document.getElementById("purchase-invoice-print") as HTMLElement | null;
    let offScreenRoot: { render: (node: unknown) => void; unmount: () => void } | null = null;
    let offScreenContainer: HTMLElement | null = null;

    if (!sourceElement) {
        const { default: PurchaseBillInvoice } = await import("@/components/purchase/purchase-invoice-template");
        const { createRoot } = await import("react-dom/client");
        const { LanguageProvider } = await import("@/components/i18n/language-provider");
        const React = await import("react");

        offScreenContainer = document.createElement("div");
        offScreenContainer.style.cssText = "position:fixed;left:-9999px;top:0;width:840px;background:white;z-index:-1;visibility:hidden;";
        document.body.appendChild(offScreenContainer);

        offScreenRoot = createRoot(offScreenContainer);
        await new Promise<void>((resolve) => {
            offScreenRoot!.render(
                React.createElement(LanguageProvider, null, 
                    React.createElement(PurchaseBillInvoice, { lot, arrival, organization, arrivalLots })
                )
            );
            setTimeout(resolve, 1200);
        });

        sourceElement = offScreenContainer.querySelector("#purchase-invoice-print") as HTMLElement | null;
    }

    if (!sourceElement) throw new Error("Invoice content not found for export");

    try {
        await waitForDocumentFonts();
        const renderWidth = Math.max(
            Math.ceil(sourceElement.getBoundingClientRect().width || sourceElement.scrollWidth || 0),
            800
        );
        sourceElement.style.overflow = 'visible';
        sourceElement.style.height = 'auto';
        await sleep(80);
        
        let footerTexts: string[] = [];
        const footerElement = sourceElement.querySelector('.invoice-footer-bar') as HTMLElement | null;
        if (footerElement) {
            footerTexts = Array.from(footerElement.querySelectorAll('span')).map(el => el.textContent?.trim() || '');
            footerElement.style.display = 'none';
        }

        const { default: jsPDF } = await import("jspdf");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const drawFooter = () => {
            if (footerTexts.length >= 3) {
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(150, 150, 150);
                pdf.text(footerTexts[0], 10, pageHeight - 8);
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(50, 50, 50);
                pdf.text(footerTexts[1], pageWidth / 2, pageHeight - 8, { align: "center" });
                
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(150, 150, 150);
                pdf.text(footerTexts[2], pageWidth - 10, pageHeight - 8, { align: "right" });
            }
        };

        const canvas = await renderCanvasFromElement(sourceElement, renderWidth);
        const imageData = canvas.toDataURL("image/jpeg", 0.75);
        
        const totalImageHeight = (canvas.height * pageWidth) / canvas.width;
        
        let heightLeft = totalImageHeight;
        let position = 0;

        pdf.addImage(imageData, "JPEG", 0, position, pageWidth, totalImageHeight);
        drawFooter();
        
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imageData, "JPEG", 0, position, pageWidth, totalImageHeight);
            drawFooter();
            heightLeft -= pageHeight;
        }

        if (footerElement) footerElement.style.display = '';

        return pdf.output("blob");
    } finally {
        offScreenRoot?.unmount();
        offScreenContainer?.remove();
    }
}
