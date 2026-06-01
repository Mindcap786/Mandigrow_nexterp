/**
 * MandiGrow User Guide Content
 * ─────────────────────────────────────────────────────────────────────
 * This file is the single source of truth for all help guide content.
 * Edit freely — no code rebuild needed when content changes.
 * In future, this can be fetched from the backend API.
 */

export interface GuideStep {
    step: number;
    title: string;
    detail: string;
}

export interface GuideSection {
    id: string;
    icon: string;         // Lucide icon name
    color: string;        // Tailwind gradient class pair
    badge: string;        // Pill label
    title: string;
    subtitle: string;
    overview: string;
    steps: GuideStep[];
    tips: string[];
    warnings?: string[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
    {
        id: "setup",
        icon: "Users",
        color: "from-violet-500 to-purple-600",
        badge: "Step 1",
        title: "Initial Setup — Parties (Khata Book)",
        subtitle: "Add Farmers, Buyers & Vendors before you start trading",
        overview:
            "Every business transaction in MandiGrow is linked to a Party. A 'Party' is anyone you do business with — a Farmer (supplier who brings produce), a Buyer (customer who purchases stock) or a Vendor (transporter, labour contractor, etc.). Setting up your party list correctly from day one ensures your Ledger (Khata), outstanding balances, and GST data are always accurate.",
        steps: [
            {
                step: 1,
                title: "Go to Contacts",
                detail:
                    "From the left sidebar click 'Contacts'. You will see a list of all existing parties. Click the green '+ New Contact' button at the top right.",
            },
            {
                step: 2,
                title: "Choose Party Type",
                detail:
                    "Select the role: 'Farmer / Supplier' for produce sellers, 'Buyer / Customer' for those who buy stock, or 'Vendor' for transport, labour & commission agents. This classification controls which ledgers, bills, and payment screens this party appears in.",
            },
            {
                step: 3,
                title: "Fill Basic Details",
                detail:
                    "Enter Full Name, Mobile Number, Village/City, and State. If the party is GST-registered, enter their GSTIN — this auto-populates on all invoices and bills.",
            },
            {
                step: 4,
                title: "Set Opening Balance",
                detail:
                    "If this party already owes you money or you owe them (from a previous system or financial year), enter the Opening Balance here. A positive value means THEY owe YOU (Debit). A negative value means YOU owe THEM (Credit).",
            },
            {
                step: 5,
                title: "Set Credit Limit",
                detail:
                    "For Buyers, set a Credit Limit (in ₹). The system will warn you when their outstanding balance crosses this limit during sales invoicing. Leave as 0 for unlimited credit.",
            },
            {
                step: 6,
                title: "Save",
                detail:
                    "Click 'Save Contact'. The party is now active and will appear in all dropdowns across Purchase, Sales, and Finance screens.",
            },
        ],
        tips: [
            "Use 'Internal Code' field for your own account numbering (e.g. F-001, B-045).",
            "Add a party photo — it helps staff identify farmers quickly at the gate.",
            "The 'City' field is searchable — use consistent village names for fast lookup.",
            "You can edit a party at any time without affecting past transactions.",
        ],
        warnings: [
            "Do NOT create duplicate entries for the same person — use the search before adding.",
            "Opening Balance must be entered ONCE at the start. Changing it later will affect your Ledger history.",
        ],
    },

    {
        id: "commodities",
        icon: "Package",
        color: "from-emerald-500 to-green-600",
        badge: "Step 2",
        title: "Commodity Master (Maal / Items)",
        subtitle: "Configure your produce items, units, and commission rates",
        overview:
            "The Commodity Master is where you define every type of agricultural produce you handle — Onion, Tomato, Potato, Mango, etc. Each item stores its default unit of measure, commission/aadhat percentage, and applicable Mandi Tax. MandiGrow uses this to auto-calculate charges on every Arrival and Sale without manual entry.",
        steps: [
            {
                step: 1,
                title: "Navigate to Commodity Master",
                detail:
                    "Go to Stock Status → Commodity Master (or Inventory → Items) from the sidebar. Click '+ New Commodity'.",
            },
            {
                step: 2,
                title: "Enter Commodity Name",
                detail:
                    "Type the produce name in English (e.g. 'Onion'). You can also add a local/Hindi name in the 'Display Name' field which will show on printouts.",
            },
            {
                step: 3,
                title: "Set Unit of Measure",
                detail:
                    "Choose the default weighing unit: Kg (for weight-based), Quintal (100 Kg), Crate, Sack, or Piece. This is what all arrival and sales entries will default to.",
            },
            {
                step: 4,
                title: "Configure Commission (Aadhat / Laga)",
                detail:
                    "Enter your Commission % (Aadhat). This percentage is automatically deducted from the Gross Amount on every Farmer Bill (Patti). For example, 2% commission on ₹50,000 arrivals = ₹1,000 Mandi income.",
            },
            {
                step: 5,
                title: "Set Mandi Tax",
                detail:
                    "Enter the applicable State Mandi Tax % (also called Market Cess or Laga). This is charged to the Buyer on top of the sale price and remitted to the Agricultural Produce Market Committee (APMC).",
            },
            {
                step: 6,
                title: "Upload Item Image",
                detail:
                    "Upload a photo of the commodity. This image appears in dropdowns and reports to help staff quickly identify items — especially useful during a fast-paced morning auction.",
            },
        ],
        tips: [
            "Create separate items for different grades — e.g. 'Onion Grade A', 'Onion Grade B' — for accurate price tracking.",
            "You can change commission rates any time; changes only apply to NEW entries.",
            "Crates and Sacks can have a unit price set here which is used for Crate Deposit billing.",
            "GST Rate field (if enabled) feeds directly into the GST reports for compliance.",
        ],
    },

    {
        id: "arrivals",
        icon: "Truck",
        color: "from-blue-500 to-cyan-600",
        badge: "Step 3",
        title: "Arrivals & Gate Entry (Purchase / Inward)",
        subtitle: "Log incoming produce and generate Farmer Bills (Patti)",
        overview:
            "When a farmer's vehicle arrives at your mandi gate, you first record the Gate Entry (vehicle number, farmer name, approximate quantity). After unloading and weighing, the Arrival is confirmed with actual weights, and the system automatically calculates the Farmer's Payable Amount after deducting freight, labour, commission, and other charges. You can also use Quick Purchase for fast inward entries without a lot.",
        steps: [
            {
                step: 1,
                title: "Gate Entry (Optional)",
                detail:
                    "Go to Purchase → Gate Entry. Enter the Vehicle Number, select the Farmer, and choose the commodity. Save the Gate Entry — this creates a record of the vehicle arrival before weighing.",
            },
            {
                step: 2,
                title: "Confirm Arrival (Inward)",
                detail:
                    "Go to Purchase → Arrivals (Inward). Find the pending gate entry or click '+ New Arrival'. Select the Farmer, Lot No., Commodity, and enter the Gross Weight (weight of truck + produce).",
            },
            {
                step: 3,
                title: "Enter Weights",
                detail:
                    "Enter Gross Weight and Tare Weight (empty vehicle weight). The system auto-calculates Net Weight = Gross − Tare. You can also enter Crate Count if the farmer brought crates.",
            },
            {
                step: 4,
                title: "Set Rate",
                detail:
                    "Enter the agreed Rate per Unit (e.g. ₹1,200 per Quintal). The Gross Amount = Net Weight × Rate is calculated automatically.",
            },
            {
                step: 5,
                title: "Add Deductions",
                detail:
                    "Add any freight charges, loading/unloading charges, packing charges, or moisture deduction (% weight loss). All deductions are itemized and subtracted from Gross Amount.",
            },
            {
                step: 6,
                title: "Generate Patti (Farmer Bill)",
                detail:
                    "Click 'Confirm Arrival'. The system creates the Purchase Bill (Patti/Kisan Bill) showing: Gross Amount − Commission − Freight − Other charges = Net Payable to Farmer. Print this and hand it to the farmer.",
            },
            {
                step: 7,
                title: "Quick Purchase",
                detail:
                    "Use Quick Purchase (top nav button) for fast inward entries — just select farmer, commodity, quantity and rate. Ideal when multiple farmers arrive simultaneously and you need speed over detail.",
            },
        ],
        tips: [
            "Lot No. auto-generates daily (e.g. LOT-NBS-001) — use this to track stock lot-wise.",
            "If a farmer has an existing advance (Peshgi), it is automatically shown on the Patti.",
            "Use 'Udhar' (Credit) mode if you will pay the farmer later — this adds to outstanding balance.",
            "You can print the Patti directly from the arrival screen with one click.",
        ],
        warnings: [
            "Once an Arrival is submitted, editing weights requires cancellation and re-entry.",
        ],
    },

    {
        id: "sales",
        icon: "IndianRupee",
        color: "from-amber-500 to-orange-600",
        badge: "Step 4",
        title: "Sales & Billing (Bikri / Auction)",
        subtitle: "Process buyer sales, invoices, POS billing & crate management",
        overview:
            "Sales in MandiGrow covers everything from the morning mandi auction (lot-wise quick sales) to formal GST Tax Invoices for large buyers. The Purchase + Sale screen is the power screen for simultaneous purchase and sale processing. POS mode allows rapid lot-by-lot billing during the auction. Crate Management automatically tracks issued vs. returned crates for every buyer.",
        steps: [
            {
                step: 1,
                title: "Purchase + Sale Screen (Commission Agent Mode)",
                detail:
                    "Go to Purchase → Purchase + Sale. This is the main screen for commission agents. Add a Farmer on the left (creates the purchase), select a Buyer on the right (creates the sale). Both happen simultaneously during the mandi auction.",
            },
            {
                step: 2,
                title: "Add Farmers (Left Panel)",
                detail:
                    "In the Farmer section, search and select the Farmer. Enter Commodity, Quantity (bags/crates), Weight, and Rate. Click Add. You can add multiple farmers to the same lot session.",
            },
            {
                step: 3,
                title: "Add Buyer (Bottom Panel)",
                detail:
                    "In the Buyer section at the bottom, search and select the Buyer Name. Enter the sale rate. The system auto-matches purchase quantity to sale quantity and calculates commission income.",
            },
            {
                step: 4,
                title: "Quick Sales (Lot Billing)",
                detail:
                    "Go to Sales from top nav. For each lot, select the Buyer and the available stock lot. Enter quantity sold and rate. This creates a Sale entry that reduces your stock and increases the buyer's receivable balance.",
            },
            {
                step: 5,
                title: "New Sales Invoice",
                detail:
                    "Go to Sales → New Invoice for formal buyers who need a GST Tax Invoice. Fill in Buyer details, add line items from stock, apply any discounts. The system calculates CGST/SGST/IGST automatically based on commodity setup.",
            },
            {
                step: 6,
                title: "POS (Point of Sale) Mode",
                detail:
                    "Use Sales → POS for rapid auction-floor billing. Scan or search item, enter quantity and rate, select buyer, press Confirm. Each transaction takes under 10 seconds — perfect for the 5–6 AM auction rush.",
            },
            {
                step: 7,
                title: "Crate Management",
                detail:
                    "When you issue crates to a buyer, log it in the Crate section. Each buyer's Crate Balance shows how many crates are with them. When they return crates, log the return to settle the balance. A crate deposit amount can be charged for non-return.",
            },
            {
                step: 8,
                title: "Returns",
                detail:
                    "Go to Sales → Returns to process goods returned by a buyer. Select the original sale, enter the returned quantity. The system creates a Credit Note and adjusts the buyer's outstanding balance and your stock.",
            },
        ],
        tips: [
            "The Purchase + Sale screen is designed for the mandi commission agent workflow — use it during the morning session.",
            "Buyer crate count is shown on every invoice as a reminder to collect pending crates.",
            "You can partial-ship a sale — invoice 50 bags today and 50 bags tomorrow from the same lot.",
            "POS keyboard shortcuts: press Enter to confirm each item, Ctrl+P to print.",
        ],
        warnings: [
            "Sales can only be made against available stock. Ensure arrivals are confirmed before billing.",
        ],
    },

    {
        id: "finance",
        icon: "Wallet",
        color: "from-rose-500 to-pink-600",
        badge: "Step 5",
        title: "Finance — Payments, Ledger & Daybook",
        subtitle: "Manage cash flow, record payments, view Khata & Daybook",
        overview:
            "The Finance module is your real-time accounting dashboard. Every arrival, sale, payment, and advance is automatically recorded in the double-entry ledger. Here you can record payments to farmers (cash/cheque/UPI), receive payments from buyers, view any party's complete Khata (ledger), manage cheque clearance, set payment reminders, and view the daily Daybook (cash flow summary).",
        steps: [
            {
                step: 1,
                title: "Record a Payment to Farmer",
                detail:
                    "Go to Finance → Payments. Click '+ New Payment'. Select Party Type = Supplier/Farmer, choose the farmer, enter amount. Choose payment mode: Cash, Bank Transfer, Cheque, or UPI. The system auto-allocates against oldest outstanding bills (FIFO).",
            },
            {
                step: 2,
                title: "Receive Payment from Buyer",
                detail:
                    "Click '+ New Receipt'. Select Party Type = Customer/Buyer, choose the buyer, enter amount received. This is auto-adjusted against their oldest unpaid invoices.",
            },
            {
                step: 3,
                title: "View Party Ledger (Khata)",
                detail:
                    "Go to Reports → Ledger. Search for any party — farmer, buyer, or vendor. You will see a complete chronological list of all transactions: arrivals, bills, payments, advances, and the running balance.",
            },
            {
                step: 4,
                title: "Track Purchase Bills (Farmer Dues)",
                detail:
                    "Go to Finance → Purchase Bills. This shows all outstanding Farmer Bills with their status: Paid, Partial, or Pending. Use this to plan your daily farmer payment schedule.",
            },
            {
                step: 5,
                title: "Buyer Settlements",
                detail:
                    "Go to Finance → Buyer Settlements to see all buyers with outstanding balances. You can send WhatsApp payment reminders directly from this screen.",
            },
            {
                step: 6,
                title: "Cheque Management",
                detail:
                    "Go to Finance → Cheque Management. All issued cheques appear here with status: Pending / Cleared. When a cheque is cleared by the bank, mark it as 'Cleared' with the clearance date — this updates your bank balance in real-time.",
            },
            {
                step: 7,
                title: "Daily Daybook",
                detail:
                    "Go to Reports → Daybook. This shows ALL cash, bank, and credit transactions for any selected date — total receipts, total payments, and net cash position. This is your daily closing statement.",
            },
            {
                step: 8,
                title: "Advance (Peshgi) Management",
                detail:
                    "Go to Finance → Payments and select 'Advance' mode to record an advance given to a farmer before produce arrives. This advance automatically appears on the farmer's Patti when their produce comes in.",
            },
        ],
        tips: [
            "UPI payments are auto-marked as 'Bank Entry' with instant clearance — no manual cheque tracking needed.",
            "The Ledger always shows RUNNING BALANCE — you can see exactly how much is owed at any point in time.",
            "Payments are FIFO-allocated — oldest bills are settled first automatically.",
            "Set Reminders on overdue buyer balances — the system will notify you on the due date.",
        ],
        warnings: [
            "Cancelling a payment reverses all ledger entries — do this only if an error was made.",
            "Cheques: do NOT mark a cheque as cleared before confirming it with your bank.",
        ],
    },

    {
        id: "pl",
        icon: "TrendingUp",
        color: "from-teal-500 to-cyan-600",
        badge: "Step 6",
        title: "Profit & Loss (P&L) and Reports",
        subtitle: "Track your earnings, margin, and business health",
        overview:
            "MandiGrow automatically calculates your Profit & Loss at every moment — no end-of-month accounting needed. The P&L Dashboard shows your total commission income (Aadhat earned), trading profit (buying low, selling high), operating expenses, and net profit for any date range. Additional reports cover GST compliance, stock levels, buyer collection efficiency, and market price trends.",
        steps: [
            {
                step: 1,
                title: "Trading P&L Dashboard",
                detail:
                    "Go to Trading P&L from the sidebar. Select a date range (Today, This Week, This Month, Custom). You will see: Total Purchases, Total Sales, Gross Profit from Trading, Total Commission Earned, Total Expenses, and Net Profit.",
            },
            {
                step: 2,
                title: "Commission Income Breakdown",
                detail:
                    "The P&L splits commission income by commodity and by farmer — so you can see which produce is most profitable for your commission business.",
            },
            {
                step: 3,
                title: "Daybook (Daily Cash Report)",
                detail:
                    "Reports → Daybook gives you a day-by-day cash position. Filter by date to see exactly what cash came in and went out, and your bank balance at end of day.",
            },
            {
                step: 4,
                title: "Ledger Report (Khata)",
                detail:
                    "Reports → Ledger: Select any party and date range. See all transactions with running balance. Export to PDF to share with the party as their account statement.",
            },
            {
                step: 5,
                title: "Stock Status Report",
                detail:
                    "Reports → Stock Status shows current lot-wise inventory: what came in, how much is sold, and what remains unsold with aging. Use this to identify slow-moving stock.",
            },
            {
                step: 6,
                title: "Buyer Collections Report",
                detail:
                    "Reports → Buyer Collections shows all outstanding buyer receivables, aged by days (0–30 days, 31–60 days, 60+ days). Use this for collections planning.",
            },
            {
                step: 7,
                title: "GST Compliance Report",
                detail:
                    "Reports → GST shows GSTR-1 ready data (sales to registered buyers), GSTR-2 ready data (purchases from registered farmers), and monthly tax liability summary.",
            },
            {
                step: 8,
                title: "Balance Sheet",
                detail:
                    "Reports → Balance Sheet gives a real-time snapshot of your total Assets (cash, bank, receivables, stock) vs. Liabilities (payables to farmers) and Net Worth (capital).",
            },
        ],
        tips: [
            "Set your fiscal year start date in Settings → Compliance for accurate year-to-date P&L.",
            "The Margin Report shows commodity-wise buying vs. selling price trends — use it to optimize auction pricing.",
            "Price Forecast uses your historical data to predict likely rates for the coming week.",
            "Export any report to PDF or Excel using the download button at the top right of each report.",
        ],
    },

    {
        id: "settings",
        icon: "Settings",
        color: "from-slate-500 to-gray-600",
        badge: "Admin",
        title: "Settings & Configuration",
        subtitle: "Branding, team access, banks, compliance and more",
        overview:
            "The Settings section is your control panel for MandiGrow. Configure your business name and brand color, add bank accounts for payment tracking, manage your team (staff access and roles), set up GST/compliance details, and control which features are enabled for your plan.",
        steps: [
            {
                step: 1,
                title: "Branding",
                detail:
                    "Settings → Branding: Set your Mandi / Business name, logo, and brand colour. This name and colour appears on all printouts (Patti, Invoices, Receipts) and in the sidebar.",
            },
            {
                step: 2,
                title: "Bank Accounts",
                detail:
                    "Settings → Banks: Add your current account and savings account details (Bank Name, Account No., IFSC). These appear in payment receipts and allow you to track bank-wise balances separately.",
            },
            {
                step: 3,
                title: "Team Access",
                detail:
                    "Settings → Team: Add staff members (accountant, gate operator, manager). Assign roles — 'Operator' for data entry only, 'Manager' for approvals, 'Accountant' for finance access. Each user gets their own login.",
            },
            {
                step: 4,
                title: "GST & Compliance",
                detail:
                    "Settings → Compliance: Enter your GSTIN, PAN, and Market Committee License No. Set your fiscal year start date. These details appear on all invoices and GST reports.",
            },
            {
                step: 5,
                title: "Subscription & Billing",
                detail:
                    "Settings → Subscription Billing: View your current plan, renewal date, and upgrade options. All plan details, user limits, and feature access are managed here.",
            },
            {
                step: 6,
                title: "Field Governance",
                detail:
                    "Settings → Field Governance: Show or hide specific data fields across the app (e.g. hide 'GST' fields if you are not GST-registered). This keeps your screens clean and focused.",
            },
        ],
        tips: [
            "Brand colour is inherited by all active buttons and highlights across the entire app.",
            "Operator-role users CANNOT edit or delete — they can only create entries.",
            "If you change your GSTIN, update it in Compliance immediately to ensure correct invoices.",
        ],
    },
];
