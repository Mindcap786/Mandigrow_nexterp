/**
 * ============================================================
 * MandiGrow — Central Route Registry
 * ============================================================
 * EVERY navigable route in the app is defined ONCE here.
 *
 * Benefits:
 *  - TypeScript catches broken routes at BUILD TIME, not runtime
 *  - Renaming a page = update one line here; IDE finds all usages
 *  - Eliminates /finance/sales → 404 class of production bugs
 *
 * Usage:
 *   import { ROUTES } from '@/lib/routes'
 *   href={ROUTES.SALES}
 *   router.push(ROUTES.DASHBOARD)
 * ============================================================
 */

export const ROUTES = {
  // ── Core ─────────────────────────────────────────────────
  HOME:               '/',
  DASHBOARD:          '/dashboard',
  LOGIN:              '/login',
  SIGNUP:             '/signup',
  SIGNUP_PROVISIONING: '/signup/provisioning',
  SUBSCRIBE:          '/subscribe',
  SUSPENDED:          '/suspended',
  MENU:               '/menu',

  // ── Purchase / Mandi Arrivals ─────────────────────────────
  ARRIVALS:           '/arrivals',
  ARRIVALS_NEW:       '/arrivals/new',
  GATE:               '/gate',
  GATE_LOGS:          '/gate-logs',
  MANDI_COMMISSION:   '/mandi-commission',
  PURCHASE_BILLS:     '/purchase/bills',
  PURCHASE_INVOICES:  '/purchase/invoices',

  // ── Sales ────────────────────────────────────────────────
  SALES:              '/sales',
  SALES_NEW:          '/sales/new',
  SALES_BULK:         '/sales/bulk',
  SALES_POS:          '/sales/pos',
  SALES_INVOICE:      (id: string) => `/sales/invoice/${id}`,
  SALES_NEW_INVOICE:  '/sales/new-invoice',
  SALES_RETURN_NEW:   '/sales/return/new',
  SALES_RETURNS:      '/sales/returns',
  SALES_ORDERS:       '/sales/orders',
  SALES_ORDERS_NEW:   '/sales-orders/new',
  CREDIT_NOTES:       '/credit-notes',
  CREDIT_NOTES_NEW:   (type: 'Credit' | 'Debit') => `/credit-notes/new?type=${type}`,
  DELIVERY_CHALLANS:  '/delivery-challans',
  DELIVERY_CHALLANS_NEW: '/delivery-challans/new',
  QUOTATIONS:         '/quotations',
  RECEIPTS:           '/receipts',
  BILLS:              '/bills',
  BILLS_CREATE:       '/bills/create',

  // ── Inventory ────────────────────────────────────────────
  STOCK:              '/stock',
  STOCK_QUICK_ENTRY:  '/stock/quick-entry',
  INVENTORY_ITEMS:    '/inventory/items',
  INVENTORY_STORAGE:  '/inventory/storage-map',
  WAREHOUSE:          '/warehouse',
  PRICE_LISTS:        '/price-lists',

  // ── Finance ──────────────────────────────────────────────
  FINANCE:            '/finance',
  FINANCE_PAYMENTS:   '/finance/payments',
  FINANCE_PAYMENTS_RECEIPT:  '/finance/payments?mode=receipt',
  FINANCE_PAYMENTS_PAYMENT:  '/finance/payments?mode=payment',
  FINANCE_PAYMENTS_EXPENSE:  '/finance/payments?mode=expense',
  FINANCE_RECONCILIATION: '/finance/reconciliation',
  FINANCE_PATTI_NEW:  '/finance/patti/new',
  FINANCE_FARMER_SETTLEMENTS: '/finance/farmer-settlements',
  FINANCE_DAILY_RATE: '/finance/daily-rate-fixer',
  FINANCE_REMINDERS:  '/finance/reminders',

  // ── Reports ──────────────────────────────────────────────
  REPORT_DAYBOOK:     '/reports/daybook',
  REPORT_PL:          '/reports/pl',
  REPORT_BALANCE_SHEET: '/reports/balance-sheet',
  REPORT_GST:         '/reports/gst',
  REPORT_LEDGER:      '/reports/ledger',
  REPORT_MARGINS:     '/reports/margins',
  REPORT_STOCK:       '/reports/stock',
  REPORT_PRICE_FORECAST: '/reports/price-forecast',
  TRADING_PL:         '/reports/pl',

  // ── Contacts / People ────────────────────────────────────
  CONTACTS:           '/contacts',
  BUYERS:             '/buyers',
  FARMERS:            '/farmers',
  EMPLOYEES:          '/employees',
  FIELD_MANAGER:      '/field-manager',
  LEDGERS:            '/ledgers',
  LEDGER_BUYER:       (id: string) => `/ledgers/buyer/${id}`,

  // ── Settings ─────────────────────────────────────────────
  SETTINGS:           '/settings',
  SETTINGS_TEAM:      '/settings/team',
  SETTINGS_FIELDS:    '/settings/fields',
  SETTINGS_BANKS:     '/settings/banks',
  SETTINGS_BANK_DETAILS: '/settings/bank-details',
  SETTINGS_BRANDING:  '/settings/branding',
  SETTINGS_BILLING:   '/settings/billing',
  SETTINGS_BILLING_CHECKOUT: '/settings/billing/checkout',
  SETTINGS_COMPLIANCE: '/settings/compliance',
  SETTINGS_FEATURE_FLAGS: '/settings/feature-flags',
  SETTINGS_GENERAL:   '/settings/general',

  // ── Admin (Super Admin only) ──────────────────────────────
  ADMIN:              '/admin',
  ADMIN_TENANTS:      '/admin/tenants',
  ADMIN_BILLING:      '/admin/billing',
  ADMIN_BILLING_PLANS: '/admin/billing/plans',
  ADMIN_BILLING_GATEWAYS: '/admin/billing/gateways',
  ADMIN_BILLING_COUPONS: '/admin/billing/coupons',
  ADMIN_BILLING_RENEWAL: '/admin/billing/renewal',
  ADMIN_SUPPORT:      '/admin/support',
  ADMIN_FEATURES:     '/admin/features',

  // ── Accounting ───────────────────────────────────────────
  ACCOUNTING:         '/accounting',

  // ── Auction ──────────────────────────────────────────────
  AUCTION:            '/auction',
  AUCTION_LIVE:       '/auction-live',

  // ── Public / Marketing ───────────────────────────────────
  BLOG:               '/blog',
  CONTACT:            '/contact',
  FAQ:                '/faq',
  PRIVACY:            '/privacy',
  TERMS:              '/terms',
} as const

/**
 * Type representing any valid static route value.
 * Helps catch typos when passing routes as props.
 */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
