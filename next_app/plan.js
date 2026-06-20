const fs = require('fs');
const path = require('path');

const planContent = `# Localize Purchase Bills

The previous fix successfully solved the blank PDF and language bugs for **all 9 languages** across all **Sales Invoices**. However, **Purchase Bills** (Supplier Patti) currently do not support local languages. They are still hardcoded in English and lack the language dropdown.

To make Purchase Bills support all 9 regional languages just like Sales Invoices, we need to implement the following plan.

## Proposed Changes

### 1. Create LocalPurchaseInvoice Template
Create a new component \`LocalPurchaseInvoice\` that mirrors \`PurchaseBillInvoice\` but replaces all hardcoded financial labels, table headers, and amount-in-words with the local language translations from our dictionary.

#### [NEW] components/local-invoices/LocalPurchaseInvoice.tsx

### 2. Update Purchase Bills Viewer
Add the language dropdown and \`useLocalInvoice\` hook to the Purchase Bills viewer so you can select the language before printing or sharing.

#### [MODIFY] app/(main)/purchase/bills/page.tsx

### 3. Update PDF Engine
Modify the purchase bill PDF generator to accept language options and render the \`LocalPurchaseInvoice\` offscreen, exactly like we just did for Sales.

#### [MODIFY] lib/generate-invoice-pdf.tsx

### 4. Update Share Button
Ensure the share button on the Purchase page passes the selected language options to the PDF generator.

#### [MODIFY] components/billing/smart-share-button.tsx (If used in purchase)

## User Review Required

Does this plan look good? Shall I proceed with building the \`LocalPurchaseInvoice\` so that farmers/suppliers can also receive their Purchase Pattis in all 9 regional languages?
