import { 
    LayoutDashboard, Truck, Gavel, Calculator, Settings, Menu, 
    FileText, Users, Package, ShieldCheck, LogOut, TrendingUp, 
    BookOpen, Wallet, Receipt, Scale, CreditCard, Sliders, 
    MessageCircle, BarChart3, Palette, Shield,
    FileInput, FileSignature, Warehouse, Tags, PieChart,
    ChevronDown, ChevronRight, Store, RotateCcw, ClipboardCheck,
    Briefcase, Database, Tag, QrCode, ShoppingCart, IndianRupee, Zap,
    Key, Ticket, Plus
} from 'lucide-react'
import { ROUTES } from '@/lib/routes'

export interface MenuItem {
    tKey: string;
    href?: string;
    icon: any;
    module?: string;
    permission?: string;
    domain?: string;
    sidebarHidden?: boolean;
    items?: MenuItem[];
}

export const NAV_ITEMS: MenuItem[] = [
    { tKey: 'nav.dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    {
        tKey: 'nav.purchase',
        icon: Receipt,
        module: 'mandi',
        items: [
            { tKey: 'nav.mandi_commission', href: ROUTES.MANDI_COMMISSION, icon: Scale },
            { tKey: 'nav.gate_entry', href: ROUTES.GATE, icon: Gavel },
            { tKey: 'nav.arrivals', href: ROUTES.ARRIVALS, icon: Truck },
            { tKey: 'nav.purchase_bills', href: ROUTES.PURCHASE_BILLS, icon: Receipt },
        ]
    },
    {
        tKey: 'nav.sales',
        icon: Calculator,
        module: 'mandi',
        items: [
            { tKey: 'nav.sale_invoice', href: ROUTES.SALES, icon: FileInput },
            { tKey: 'nav.bulk_lot_sale', href: ROUTES.SALES_NEW_INVOICE, icon: Zap },
        ]
    },
    {
        tKey: 'nav.inventory',
        icon: Package,
        module: 'mandi',
        items: [
            { tKey: 'nav.commodity_master', href: ROUTES.INVENTORY_ITEMS, icon: Tag },
            { tKey: 'nav.stock_status', href: ROUTES.STOCK, icon: Package },
        ]
    },
    { tKey: 'nav.payments_receipts', href: ROUTES.FINANCE_PAYMENTS, icon: Wallet, module: 'finance' },
    { tKey: 'nav.trading_pl', href: ROUTES.TRADING_PL, icon: TrendingUp, module: 'mandi' },
    {
        tKey: 'nav.finance',
        icon: TrendingUp,
        module: 'finance',
        items: [
            { tKey: 'nav.finance_overview', href: ROUTES.FINANCE, icon: PieChart },
            { tKey: 'nav.day_book', href: ROUTES.REPORT_DAYBOOK, icon: BookOpen },
            { tKey: 'nav.cheque_mgmt', href: ROUTES.FINANCE_RECONCILIATION, icon: CreditCard },
            { tKey: 'nav.gst_compliance', href: ROUTES.REPORT_GST, icon: ShieldCheck },
            { tKey: 'nav.balance_sheet', href: ROUTES.REPORT_BALANCE_SHEET, icon: Scale },
        ]
    },
    {
        tKey: 'nav.master_data',
        icon: Database,
        items: [
            { tKey: 'nav.customers_vendors', href: ROUTES.CONTACTS, icon: Users },
            { tKey: 'nav.banks', href: ROUTES.SETTINGS_BANKS, icon: Wallet },
            { tKey: 'nav.employees', href: ROUTES.EMPLOYEES, icon: Briefcase },
        ]
    },
    {
        tKey: 'nav.quick_actions',
        icon: Zap,
        sidebarHidden: true,
        items: [
            { tKey: 'nav.quick_purchase', href: ROUTES.STOCK_QUICK_ENTRY, icon: ShoppingCart },
            { tKey: 'nav.quick_sales', href: ROUTES.SALES, icon: IndianRupee },
            { tKey: 'nav.pos', href: ROUTES.SALES_POS, icon: Zap },
            { tKey: 'nav.returns', href: ROUTES.SALES_RETURN_NEW, icon: RotateCcw },
        ]
    },
    {
        tKey: 'nav.settings',
        icon: Settings,
        items: [
            { tKey: 'nav.general_settings', href: ROUTES.SETTINGS, icon: Settings },
            { tKey: 'nav.team_access', href: ROUTES.SETTINGS_TEAM, icon: ShieldCheck },
            { tKey: 'nav.field_governance', href: ROUTES.SETTINGS_FIELDS, icon: ShieldCheck },
            { tKey: 'nav.bank_details', href: ROUTES.SETTINGS_BANK_DETAILS, icon: QrCode },
            { tKey: 'nav.branding', href: ROUTES.SETTINGS_BRANDING, icon: Palette },
            { tKey: 'nav.subscription_billing', href: ROUTES.SETTINGS_BILLING, icon: CreditCard },
            { tKey: 'nav.compliance', href: ROUTES.SETTINGS_COMPLIANCE, icon: Shield },
        ]
    }
]

export const ADMIN_NAV_ITEMS: MenuItem[] = [
    { tKey: 'nav.admin_dashboard', href: ROUTES.ADMIN, icon: LayoutDashboard },
    { tKey: 'nav.tenants', href: ROUTES.ADMIN_TENANTS, icon: Store },
    {
        tKey: 'nav.admin_billing',
        icon: CreditCard,
        items: [
            { tKey: 'nav.billing_overview', href: ROUTES.ADMIN_BILLING, icon: PieChart },
            { tKey: 'nav.payment_gateways', href: ROUTES.ADMIN_BILLING_GATEWAYS, icon: Key },
            { tKey: 'nav.coupons', href: ROUTES.ADMIN_BILLING_COUPONS, icon: Ticket },
        ]
    },
]


export function getAllMenuKeys(): string[] {
    const keys: string[] = [];
    const traverse = (items: MenuItem[]) => {
        items.forEach(item => {
            keys.push(item.tKey);
            if (item.items) traverse(item.items);
        });
    };
    traverse(NAV_ITEMS);
    return keys;
}
