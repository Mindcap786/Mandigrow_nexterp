const fs = require('fs');

let content = fs.readFileSync('app/(main)/settings/team/page.tsx', 'utf8');
content = content.replace("export default function TeamPage() {", "export default function TeamPage() {\n    const { t } = useLanguage();");
fs.writeFileSync('app/(main)/settings/team/page.tsx', content, 'utf8');

let billingContent = fs.readFileSync('app/(main)/settings/billing/page.tsx', 'utf8');
if (!billingContent.includes("const { t } = useLanguage();")) {
  billingContent = billingContent.replace("export default function BillingPage() {", "export default function BillingPage() {\n    const { t } = useLanguage();");
  fs.writeFileSync('app/(main)/settings/billing/page.tsx', billingContent, 'utf8');
}
