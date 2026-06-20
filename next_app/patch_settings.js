const fs = require('fs');

let content = fs.readFileSync('app/(main)/settings/team/page.tsx', 'utf8');
if (!content.includes('useLanguage')) {
  content = content.replace("import { useState", "import { useLanguage } from '@/components/i18n/language-provider';\nimport { useState");
  content = content.replace("export default function TeamSettingsPage() {", "export default function TeamSettingsPage() {\n    const { t } = useLanguage();");
}
content = content.replace("ACCESS TEAM", "{t('settings_module.team_access')}");
content = content.replace("Manage logins and permissions for your employees", "{t('settings_module.team_subtitle')}");
content = content.replace("Authorize Employee", "{t('settings_module.authorize_employee')}");
content = content.replace("INACTIVE IN SYSTEM", "{t('settings_module.inactive_system')}");
content = content.replace("AUTHORIZED TEAM", "{t('settings_module.authorized_team')}");
content = content.replace("No Staff Found", "{t('settings_module.no_staff_found')}");
content = content.replace("ADD EMPLOYEES BEFORE GRANTING ACCESS", "{t('settings_module.add_employees_before')}");

fs.writeFileSync('app/(main)/settings/team/page.tsx', content, 'utf8');

let billingContent = fs.readFileSync('app/(main)/settings/billing/page.tsx', 'utf8');
if (!billingContent.includes('useLanguage')) {
  billingContent = billingContent.replace("import { useState", "import { useLanguage } from '@/components/i18n/language-provider';\nimport { useState");
  billingContent = billingContent.replace("export default function BillingSettings() {", "export default function BillingSettings() {\n    const { t } = useLanguage();");
}
billingContent = billingContent.replace("SUBSCRIPTION & BILLING", "{t('settings_module.subscription_billing')}");
billingContent = billingContent.replace("MANAGE YOUR MANDIGROW PLAN", "{t('settings_module.manage_plan')}");
fs.writeFileSync('app/(main)/settings/billing/page.tsx', billingContent, 'utf8');

console.log("Settings Patched");
