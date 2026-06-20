const fs = require('fs');

const targetFile = 'lib/generate-invoice-pdf.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Update function signature
content = content.replace(
    'export async function generateInvoicePDF(sale: any, organization: any): Promise<Blob> {',
    'export async function generateInvoicePDF(sale: any, organization: any, options?: { lang?: any, itemTranslations?: Record<string, string>, partyTranslation?: string | null }): Promise<Blob> {\n    const targetId = options?.lang ? "invoice-print-local" : "invoice-print";'
);

// Update sourceElement search
content = content.replace(
    'let sourceElement = document.getElementById("invoice-print") as HTMLElement | null;',
    'let sourceElement = document.getElementById(targetId) as HTMLElement | null;'
);

// Update offscreen render
const offscreenTarget = `        const { default: BuyerInvoice } = await import("@/components/sales/invoice-template");
        const { createRoot } = await import("react-dom/client");
        const { LanguageProvider } = await import("@/components/i18n/language-provider");
        const React = await import("react");

        offScreenContainer = document.createElement("div");
        // Use absolute positioning at top:0 instead of fixed, to prevent html2canvas from capturing blank areas due to scroll offset
        offScreenContainer.style.cssText = "position:absolute;left:-9999px;top:0;width:840px;background:white;z-index:-1;";
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

        sourceElement = offScreenContainer.querySelector("#invoice-print") as HTMLElement | null;`;

const offscreenReplacement = `        const { default: BuyerInvoice } = await import("@/components/sales/invoice-template");
        const { default: LocalSaleInvoice } = await import("@/components/local-invoices/LocalSaleInvoice");
        const { createRoot } = await import("react-dom/client");
        const { LanguageProvider } = await import("@/components/i18n/language-provider");
        const React = await import("react");

        offScreenContainer = document.createElement("div");
        // Use absolute positioning at top:0 instead of fixed, to prevent html2canvas from capturing blank areas due to scroll offset
        offScreenContainer.style.cssText = "position:absolute;left:-9999px;top:0;width:840px;background:white;z-index:-1;";
        document.body.appendChild(offScreenContainer);

        offScreenRoot = createRoot(offScreenContainer);
        await new Promise<void>((resolve) => {
            offScreenRoot!.render(
                React.createElement(LanguageProvider, null, 
                    options?.lang ? 
                        React.createElement(LocalSaleInvoice, { 
                            sale, 
                            organization, 
                            lang: options.lang, 
                            itemTranslations: options.itemTranslations, 
                            partyTranslation: options.partyTranslation 
                        }) 
                        : 
                        React.createElement(BuyerInvoice, { sale, organization })
                )
            );
            // Wait longer for fonts, images, and hooks (usePlatformBranding) to load
            setTimeout(resolve, 1200);
        });

        sourceElement = offScreenContainer.querySelector("#" + targetId) as HTMLElement | null;`;

content = content.replace(offscreenTarget, offscreenReplacement);

fs.writeFileSync(targetFile, content);
console.log('Updated generateInvoicePDF.');
