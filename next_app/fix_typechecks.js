const fs = require('fs');

function fixTranslations(file) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace t("key", "default") -> t("key")
    // Replace t("key", variable) -> t("key")
    // Note: this regex will catch most cases, handling optional newlines and spaces
    content = content.replace(/t\(\s*(`[^`]+`|'[^']+'|"[^"]+")\s*,\s*(`[^`]+`|'[^']+'|"[^"]+"|[\w]+)\s*\)/g, 't($1)');
    fs.writeFileSync(file, content);
}

fixTranslations('app/(main)/dashboard/page.tsx');
fixTranslations('app/(main)/purchase/bills/page.tsx');
fixTranslations('components/mandi-commission/mandi-commission-form.tsx');

let permFile = 'hooks/use-permission.ts';
let permContent = fs.readFileSync(permFile, 'utf8');
permContent = permContent.replace('const orgMatrixRaw = profile?.organization?.rbac_matrix;', 'const orgMatrixRaw = (profile?.organization as any)?.rbac_matrix;');
fs.writeFileSync(permFile, permContent);

console.log('Fixed typescript issues.');
