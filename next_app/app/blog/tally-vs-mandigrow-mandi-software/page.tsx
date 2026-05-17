import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { CheckCircle2, XCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Tally vs MandiGrow: Why Standard ERP Fails Mandi Traders',
    description:
        'A deep dive into why generic accounting tools like Tally ERP 9 and Zoho fail for fruit & vegetable commission agents in APMC mandis.',
    alternates: { canonical: 'https://www.mandigrow.com/blog/tally-vs-mandigrow-mandi-software' },
    openGraph: {
        title: 'Tally vs MandiGrow: Why Standard ERP Fails Mandi Traders',
        description: 'Why standard accounting software fails the Indian Mandi trader.',
        url: 'https://www.mandigrow.com/blog/tally-vs-mandigrow-mandi-software',
        type: 'article',
    },
};

export default function BlogPostPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900 pt-20">
            <LandingHeader />

            <article className="max-w-4xl mx-auto px-6 pt-24 pb-20">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/blog" className="text-emerald-700 font-bold hover:underline text-sm">
                            ← Back to Blog
                        </Link>
                        <span className="text-gray-300">|</span>
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            Software Comparison
                        </span>
                        <span className="text-gray-500 text-sm font-medium">
                            May 17, 2026
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6">
                        Tally vs. MandiGrow: Why General Accounting Software Fails Fruit & Vegetable Traders
                    </h1>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed">
                        If you walk into any APMC mandi in India, you will see a familiar sight: a fast-paced morning auction, hundreds of crates changing hands, and a munim desperately scribbling in a paper bahi. But when they try to move to a digital ERP like Tally, the system breaks. Here is why.
                    </p>
                </header>

                <div className="prose prose-lg prose-emerald max-w-none">
                    <h2>The Problem with General-Purpose ERPs</h2>
                    <p>
                        Accounting software like Tally, Zoho, or Busy are built for standard retail or manufacturing. They operate on a simple principle: <strong>Buy Item A at ₹10, Sell Item A at ₹15. The profit is ₹5.</strong>
                    </p>
                    <p>
                        But the sabzi mandi <em>doesn't work like that</em>.
                    </p>
                    <p>
                        In a mandi, a commission agent (arhtiya) doesn't own the goods. They facilitate a sale between a farmer and a buyer. Their revenue isn't a markup; it's a <strong>percentage commission</strong>, minus <strong>market fees</strong> (mandi tax), minus <strong>labor charges</strong> (hamali/palledari). A standard ERP simply doesn't have the native fields to handle this without forcing you to make dozens of manual journal vouchers every single day.
                    </p>

                    <h2>1. Lot Tracking vs. SKU Tracking</h2>
                    <p>
                        In Tally, you create an item master: "Tomato". But in the mandi, a farmer brings a "Lot" of tomatoes. Lot #120 might have 50 crates of Grade A tomatoes, and Lot #121 might have 30 crates of Grade B tomatoes. They are sold separately, to different buyers, at different prices.
                    </p>
                    <div className="my-8 grid sm:grid-cols-2 gap-4">
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h4 className="flex items-center gap-2 text-red-800 font-bold mb-3">
                                <XCircle className="w-5 h-5" /> In Tally
                            </h4>
                            <p className="text-sm text-red-900 m-0">You have to create a new item for every lot, polluting your item master, or dump everything into "Tomatoes" and lose track of which farmer sold what.</p>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <h4 className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                                <CheckCircle2 className="w-5 h-5" /> In MandiGrow
                            </h4>
                            <p className="text-sm text-emerald-900 m-0">Lots are natively tracked. You generate an Arrival Slip (Gate Pass), which creates a unique Lot ID. When sold, the lot is closed automatically.</p>
                        </div>
                    </div>

                    <h2>2. The Burden of Commission & Hamali</h2>
                    <p>
                        When a trader sells a crate of apples for ₹1000, the buyer pays ₹1000 + Mandi Tax (e.g., 1%). The farmer receives ₹1000 - Commission (e.g., 6%) - Hamali (e.g., ₹5/crate).
                    </p>
                    <p>
                        In standard software, recording this single transaction requires:
                    </p>
                    <ul>
                        <li>A sales invoice to the buyer.</li>
                        <li>A purchase voucher from the farmer.</li>
                        <li>A journal entry for commission income.</li>
                        <li>A journal entry for hamali expense.</li>
                        <li>A journal entry for mandi tax payable.</li>
                    </ul>
                    <p>
                        <strong>MandiGrow handles all of this in one screen.</strong> You define the commission and charges once. When you enter the sale, MandiGrow instantly updates the Buyer Ledger, Farmer Khata, Commission Income, and Tax accounts simultaneously. What takes 5 minutes in Tally takes 5 seconds in MandiGrow.
                    </p>

                    <h2>3. The Digital Khata (Ledger)</h2>
                    <p>
                        In the mandi, trust is everything. Farmers take advances, buyers take goods on <em>udhaar</em> (credit). You need to see a live "Khata" (ledger) at the exact moment of settlement. 
                        MandiGrow is designed with a native Khata view. You can select 50 farmers, hit "Settle", and instantly generate a payable list with all deductions clearly printed in Hindi or English.
                    </p>

                    <h2>The Verdict</h2>
                    <p>
                        Tally is a phenomenal accounting tool for standard businesses. But forcing a commission agent to use Tally is like forcing a carpenter to use a spoon instead of a hammer. 
                    </p>
                    <p>
                        MandiGrow was built from the ground up inside the APMC mandis of India. It speaks the language of the arhtiya, understands crates and lots, and automates the back-office so you can focus on the morning auction.
                    </p>

                    <div className="mt-12 p-8 bg-emerald-900 text-white rounded-3xl text-center">
                        <h3 className="text-2xl font-black mb-4 text-white">Ready to upgrade your Mandi Business?</h3>
                        <p className="text-emerald-100 mb-6">Join hundreds of fruit and vegetable traders who have switched to India's #1 Mandi ERP.</p>
                        <Link
                            href="/subscribe"
                            className="inline-block px-8 py-4 bg-white text-emerald-900 font-black rounded-xl shadow-lg hover:bg-emerald-50 transition"
                        >
                            Start Your 14-Day Free Trial
                        </Link>
                    </div>
                </div>
            </article>

            <LandingFooter />
        </main>
    );
}
