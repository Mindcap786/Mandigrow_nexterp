const fs = require('fs');

const targetFile = 'lib/generate-invoice-pdf.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace the DOM search to always use offscreen rendering to prevent html2canvas blank issues on mobile
content = content.replace(
    'let sourceElement = document.getElementById(targetId) as HTMLElement | null;',
    'let sourceElement: HTMLElement | null = null; // ALWAYS render offscreen to prevent html2canvas blank bugs on mobile second-share'
);

fs.writeFileSync(targetFile, content);
console.log('Patched generateInvoicePDF for robust offscreen rendering.');
