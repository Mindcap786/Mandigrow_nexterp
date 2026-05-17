import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

export const metadata: Metadata = {
    title: 'Paper Khata vs Digital Mandi Khata | MandiGrow',
    description: 'The risks of paper bahis and the benefits of a live, digital mandi khata. See how to settle farmer accounts instantly.',
    alternates: { canonical: 'https://www.mandigrow.com/blog/paper-khata-vs-digital-mandi-khata' },
    openGraph: {
        title: 'Paper Khata vs Digital Mandi Khata',
        description: 'Why it is time to throw away the red bahi and move your mandi business to a digital khata.',
        url: 'https://www.mandigrow.com/blog/paper-khata-vs-digital-mandi-khata',
        type: 'article',
    },
};

export default function DigitalKhataBlogPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900 pt-20">
            <LandingHeader />

            <article className="max-w-4xl mx-auto px-6 pt-24 pb-20">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/blog" className="text-emerald-700 font-bold hover:underline text-sm">← Back to Blog</Link>
                        <span className="text-gray-300">|</span>
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Business Growth</span>
                        <span className="text-gray-500 text-sm font-medium">May 20, 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6">
                        Paper Khata vs Digital Mandi Khata: Transitioning Your Commission Business
                    </h1>
                    <p className="text-xl text-gray-600 font-medium leading-relaxed">
                        The traditional red bahi (ledger book) has been the heart of the Indian Mandi for centuries. But as trade volumes grow and margins tighten, relying on paper khatas is becoming a massive financial liability.
                    </p>
                </header>

                <div className="prose prose-lg prose-emerald max-w-none">
                    <h2>The Hidden Costs of the Paper Bahi</h2>
                    <p>
                        While a paper notebook seems free, it is costing your business thousands of rupees every month in invisible ways:
                    </p>
                    <ul>
                        <li><strong>Reconciliation Errors:</strong> A forgotten advance payment entry or a miscalculated total directly impacts your profit.</li>
                        <li><strong>Time Loss:</strong> Munims spend hours every evening tallying the daybook, cross-referencing sales pattis with farmer ledgers.</li>
                        <li><strong>Data Vulnerability:</strong> A lost, damaged, or misplaced bahi means completely losing track of your outstanding receivables (udhaar).</li>
                        <li><strong>Lack of Insights:</strong> You cannot instantly pull up a report to see which buyer owes you the most money, or which farmer brought the highest quality produce this season.</li>
                    </ul>

                    <h2>The Power of the Digital Khata</h2>
                    <p>
                        A Digital Mandi Khata, like the one natively built into MandiGrow, transforms your operation from a reactive accounting nightmare into a proactive, transparent business.
                    </p>
                    
                    <h3>Live Updates, Zero Effort</h3>
                    <p>
                        In a digital khata, you do not "make entries" into the ledger. The ledger updates itself. When you record a purchase, the farmer's khata is credited. When you give a cash advance, the khata is debited. When a buyer takes goods on credit, their outstanding balance increases instantly. You know exactly who owes what, down to the paisa, at 10:00 AM or 10:00 PM.
                    </p>

                    <h3>Transparency Builds Trust</h3>
                    <p>
                        Farmers want to know exactly how their payout was calculated. With MandiGrow, you can generate a digital Patti that breaks down the gross sale, commission, hamali, and net payable. You can print it in Hindi or instantly share it with the farmer via WhatsApp. Absolute transparency guarantees that farmers will continue bringing their produce to your shop.
                    </p>

                    <h2>Transitioning is Easier Than You Think</h2>
                    <p>
                        The biggest fear of moving to a digital khata is the transition period. MandiGrow makes this seamless. You simply enter the "Opening Balance" for your parties, and the software takes over from there. The interface is simple enough that a munim who has only ever used paper can learn to operate the Android app in 15 minutes.
                    </p>

                    <div className="mt-12 p-8 bg-emerald-900 text-white rounded-3xl text-center">
                        <h3 className="text-2xl font-black mb-4 text-white">Retire the Red Bahi Today</h3>
                        <p className="text-emerald-100 mb-6">Secure your data, stop revenue leakage, and scale your business with a digital khata.</p>
                        <Link href="/subscribe" className="inline-block px-8 py-4 bg-white text-emerald-900 font-black rounded-xl shadow-lg hover:bg-emerald-50 transition">
                            Try MandiGrow Free
                        </Link>
                    </div>
                </div>
            </article>
            <LandingFooter />
        </main>
    );
}
