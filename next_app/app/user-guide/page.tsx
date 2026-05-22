import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  ShoppingCart, 
  Banknote, 
  Wallet, 
  BookText, 
  TrendingUp, 
  Tags, 
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'MandiGrow User Guide | Simple Help for Mandi Clerks & Staff',
  description: 'Learn how to use MandiGrow ERP easily. A step-by-step guide for mandi clerks and staff to manage purchases, sales, daybook, and ledgers without technical skills.',
  keywords: 'MandiGrow user guide, mandi software help, how to use mandi ERP, APMC software tutorial, sabji mandi billing software, fruit mandi software guide',
  openGraph: {
    title: 'MandiGrow User Guide | Simple Help for Mandi Clerks & Staff',
    description: 'A step-by-step guide for mandi clerks and staff to manage purchases, sales, daybook, and ledgers without technical skills.',
    url: 'https://www.mandigrow.com/user-guide',
    siteName: 'MandiGrow',
    images: [{ url: 'https://www.mandigrow.com/og-image.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  }
};

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-6">
            <BookOpen className="w-4 h-4" />
            <span>Official Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
            MandiGrow User Guide:<br className="hidden md:block" />
            <span className="text-indigo-600">Simple Help for Mandi Staff</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to MandiGrow! This guide is written specifically for you—the clerks, accountants, and staff who keep the mandi running every day. Everything is explained in plain English.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16 lg:py-24 space-y-24">
        
        {/* Roles Section */}
        <section id="roles" className="scroll-mt-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Understanding User Roles</h2>
          </div>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            MandiGrow has different "roles" so everyone only sees what they need to see. This keeps the software simple and secures your business data.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <RoleCard 
              title="Owner / Super Admin" 
              desc="Has full control. Can see all reports, change settings, and see the final Profit & Loss."
              color="bg-purple-50 border-purple-100 text-purple-700"
            />
            <RoleCard 
              title="Clerk / Operator" 
              desc="Can enter daily Purchases, Sales, and Payments, but cannot delete old records."
              color="bg-emerald-50 border-emerald-100 text-emerald-700"
            />
            <RoleCard 
              title="Accountant" 
              desc="Can view the Daybook, Ledger, and manage cash flow to ensure all accounts match."
              color="bg-amber-50 border-amber-100 text-amber-700"
            />
          </div>
        </section>

        {/* Modules Grid */}
        <section className="space-y-16">
          <ModuleFeature 
            id="purchase"
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Purchase (Buying from Farmers)"
            color="emerald"
            whatItIs="This is where you record the crops or goods you are receiving from the farmers (suppliers)."
            whatYouSee={[
              "Party / Farmer Name: Who are you buying from?",
              "Item / Commodity: What are they bringing? (e.g., Apple, Onion)",
              "Quantity & Rate: How many boxes/bags, and at what price?",
              "Expenses: Any unloading or commission charges?"
            ]}
            howToUse="When a farmer unloads their goods, click 'New Purchase'. Select the farmer's name, add the items, and hit save. MandiGrow will automatically update the farmer's account so you know exactly how much you owe them."
          />

          <ModuleFeature 
            id="sales"
            icon={<Banknote className="w-6 h-6" />}
            title="Sales & Billing (Selling to Buyers)"
            color="blue"
            whatItIs="This is where you record selling the goods to buyers, wholesalers, or retailers."
            whatYouSee={[
              "Buyer Name: Who is buying the goods?",
              "Item Sold: What are you selling?",
              "Final Price: The total amount the buyer needs to pay."
            ]}
            howToUse="When a buyer takes a lot of goods, click 'New Sale'. Enter their name and the items sold. Once saved, MandiGrow instantly adds this amount to the buyer's outstanding balance. You can even print a simple bill (Parcha) instantly."
          />

          <ModuleFeature 
            id="finance"
            icon={<Wallet className="w-6 h-6" />}
            title="Finance (Payments & Receipts)"
            color="amber"
            whatItIs="This module handles the actual cash or bank transfers. Buying and selling only update the balances. The Finance section is where you record the money actually changing hands."
            whatYouSee={[
              "Receipt (Money In): Use this when a buyer pays you cash or transfers money to clear their balance.",
              "Payment (Money Out): Use this when you pay the farmer for their goods."
            ]}
            howToUse="Click 'Receive Money' when cash comes in, or 'Make Payment' when cash goes out. Select the party name, enter the amount, and save. Their ledger will automatically update!"
          />

          <ModuleFeature 
            id="daybook"
            icon={<BookText className="w-6 h-6" />}
            title="Daybook (The Daily Cash Register)"
            color="indigo"
            whatItIs="The Daybook shows you the entire story of 'Today'."
            whatYouSee={[
              "Every single cash receipt, cash payment, and expense that happened today.",
              "Opening Balance: Cash you had in the morning.",
              "Closing Balance: Cash you should have in your drawer right now."
            ]}
            howToUse="At the end of the day, before closing the shop, open the Daybook. Count the physical cash in your drawer. The amount in your hand should exactly match the 'Closing Balance' shown on the screen. If it matches, your day is perfect!"
          />

          <ModuleFeature 
            id="ledger"
            icon={<Users className="w-6 h-6" />}
            title="Ledger (Khata / Account Statement)"
            color="rose"
            whatItIs="The Ledger is a detailed account statement for one specific person (a farmer or a buyer)."
            whatYouSee={[
              "A list of all their past bills.",
              "The payments they made.",
              "Outstanding Balance: How much they owe you, or you owe them."
            ]}
            howToUse="If a buyer asks, 'How much do I owe you?', open the Ledger, search their name, and instantly tell them their exact balance. You can also print this or send it to them via WhatsApp."
          />

          <ModuleFeature 
            id="pnl"
            icon={<TrendingUp className="w-6 h-6" />}
            title="Trading Profit & Loss (P&L)"
            color="teal"
            whatItIs="A report that shows if the business is making money or losing money over a specific time."
            whatYouSee={[
              "Total Sales: How much you sold.",
              "Total Purchases: How much you bought.",
              "Direct Expenses: Mandi taxes, labor, etc.",
              "Gross Profit: The money you made after basic costs."
            ]}
            howToUse="Owners use this at the end of the month or season to understand the health of their business. It does all the hard math for you instantly."
          />

          <ModuleFeature 
            id="tags"
            icon={<Tags className="w-6 h-6" />}
            title="Tags (Organizing Your Data)"
            color="slate"
            whatItIs="Tags are like sticky notes you can attach to bills or payments to organize them."
            whatYouSee={[
              "Custom labels like 'Pending Transport', 'VIP Customer', or 'Bad Debt'."
            ]}
            howToUse="If a bill needs special attention, just attach a tag to it. Later, you can easily search for all bills that have the 'Pending Transport' tag."
          />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-200">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FaqItem 
              q="Do I need to be a computer expert to use MandiGrow?" 
              a="Not at all! If you know how to use a smartphone or basic WhatsApp, you can easily use MandiGrow. The buttons are big, and everything is written clearly."
            />
            <FaqItem 
              q="What happens if I enter the wrong amount in a bill?" 
              a="Don't worry! Depending on your role, you can simply click 'Edit' on the bill to correct the amount, or ask your admin to adjust it for you."
            />
            <FaqItem 
              q="Does the system work on mobile phones?" 
              a="Yes! MandiGrow is fully mobile-friendly. You can stand in the mandi yard and enter purchases directly from your phone while the goods are being unloaded."
            />
            <FaqItem 
              q="How is the Daybook different from the Ledger?" 
              a="The Daybook shows everyone's cash transactions for ONE day. The Ledger shows ONE person's transactions across MANY days."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center pb-12">
          <div className="bg-indigo-600 rounded-3xl p-10 md:p-16 text-white shadow-2xl shadow-indigo-600/20">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to use MandiGrow?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
              MandiGrow is dedicated to making agricultural trading simple, fast, and transparent. Log in now to get started.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-white text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-lg">
                Log In to MandiGrow
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold bg-indigo-700 text-white hover:bg-indigo-800 rounded-xl transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Subcomponents

function RoleCard({ title, desc, color }: { title: string, desc: string, color: string }) {
  return (
    <div className={`p-6 rounded-2xl border ${color} bg-opacity-50`}>
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" />
        {title}
      </h3>
      <p className="text-sm font-medium opacity-90 leading-relaxed">{desc}</p>
    </div>
  );
}

function ModuleFeature({ id, icon, title, color, whatItIs, whatYouSee, howToUse }: any) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-100 text-teal-600',
    slate: 'bg-slate-200 text-slate-700',
  };

  return (
    <div id={id} className="scroll-mt-32 bg-white rounded-3xl p-8 md:p-10 shadow-lg shadow-slate-200/40 border border-slate-200 hover:border-indigo-200 transition-colors group">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${colorMap[color]}`}>
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">What it is</h3>
            <p className="text-lg text-slate-700 font-medium leading-relaxed">{whatItIs}</p>
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">How to use it</h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-slate-600 leading-relaxed text-sm">{howToUse}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">What you will see</h3>
          <ul className="space-y-3">
            {whatYouSee.map((item: string, idx: number) => {
              const [boldPart, rest] = item.includes(':') ? item.split(':') : [item, ''];
              return (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <ChevronRight className={`w-5 h-5 shrink-0 mt-0.5 ${colorMap[color].split(' ')[1]}`} />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">{boldPart}</strong>
                    {rest ? `:${rest}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-lg text-slate-900 flex gap-3">
        <span className="text-indigo-600 font-black">Q.</span> {q}
      </h4>
      <p className="text-slate-600 leading-relaxed pl-7">{a}</p>
    </div>
  );
}
