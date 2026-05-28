import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { LandingHeader } from '@/components/layout/LandingHeader';

export const metadata: Metadata = {
    title: 'HSN Codes & GST Rates for Fruits, Sabji & Anaj | MandiGrow',
    description:
        'The ultimate directory of HSN codes and GST rates for Indian Mandi traders. Find correct tax rates for fresh vegetables, fruits, dry chillies, spices, grains, and pulses.',
    keywords: [
        'HSN code for fruits',
        'GST on vegetables',
        'HSN code for sabji',
        'GST on anaj',
        'GST on agricultural products',
        'Mandi software',
        'commission agent software',
        'MandiGrow'
    ],
    alternates: { canonical: 'https://www.mandigrow.com/hsn-gst-rates-mandi-commodities' },
    openGraph: {
        title: 'HSN Codes & GST Rates for Fruits, Sabji & Anaj | MandiGrow',
        description:
            'Find correct tax rates for fresh vegetables, fruits, dry chillies, spices, grains, and pulses. Essential for Indian Mandi Commission Agents.',
        url: 'https://www.mandigrow.com/hsn-gst-rates-mandi-commodities',
        type: 'article',
    },
};

const COMMODITIES = [
    { category: 'Vegetables', item: 'Potatoes (Aloo)', hsn: '0701', condition: 'Fresh / Chilled', rate: '0%' },
    { category: 'Vegetables', item: 'Tomatoes (Tamatar)', hsn: '0702', condition: 'Fresh / Chilled', rate: '0%' },
    { category: 'Vegetables', item: 'Onions & Garlic (Pyaz, Lahsun)', hsn: '0703', condition: 'Fresh / Chilled', rate: '0%' },
    { category: 'Vegetables', item: 'Brinjal, Okra, Lauki, Karela', hsn: '0709', condition: 'Fresh / Chilled', rate: '0%' },
    { category: 'Vegetables', item: 'Fresh Green Chili', hsn: '0709', condition: 'Fresh', rate: '0%' },
    { category: 'Vegetables', item: 'Fresh Coriander (Dhaniya), Spinach', hsn: '0709', condition: 'Fresh', rate: '0%' },
    { category: 'Vegetables', item: 'Frozen / Processed Veggies', hsn: '0710 / 0711', condition: 'Frozen / Preserved', rate: '5%' },
    { category: 'Fruits', item: 'Mangoes, Guava, Papaya', hsn: '0804', condition: 'Fresh', rate: '0%' },
    { category: 'Fruits', item: 'Bananas', hsn: '0803', condition: 'Fresh', rate: '0%' },
    { category: 'Fruits', item: 'Apples & Pears', hsn: '0808', condition: 'Fresh', rate: '0%' },
    { category: 'Fruits', item: 'Citrus (Lemon/Nimbu, Orange)', hsn: '0805', condition: 'Fresh', rate: '0%' },
    { category: 'Fruits', item: 'Watermelon, Muskmelon', hsn: '0807', condition: 'Fresh', rate: '0%' },
    { category: 'Fruits', item: 'Dry Fruits (Almonds, Walnuts)', hsn: '0802', condition: 'In shell / Shelled', rate: '5% / 12%' },
    { category: 'Spices', item: 'Dry Red Chili (Sukhi Lal Mirch)', hsn: '0904', condition: 'Dried', rate: '5%' },
    { category: 'Spices', item: 'Cumin Seeds (Jeera)', hsn: '0909', condition: 'Dried', rate: '5%' },
    { category: 'Spices', item: 'Turmeric (Haldi)', hsn: '0910', condition: 'Fresh / Dried', rate: '0% / 5%' },
    { category: 'Spices', item: 'Fresh Ginger (Adrak)', hsn: '0910', condition: 'Fresh', rate: '0%' },
    { category: 'Grains', item: 'Wheat (Gehun)', hsn: '1001', condition: 'Loose / Unbranded', rate: '0%' },
    { category: 'Grains', item: 'Rice / Basmati (Chawal)', hsn: '1006', condition: 'Loose / Unbranded', rate: '0%' },
    { category: 'Grains', item: 'Maize (Corn / Makka)', hsn: '1005', condition: 'Loose / Unbranded', rate: '0%' },
    { category: 'Grains', item: 'Bajra, Jowar (Millets)', hsn: '1008', condition: 'Loose / Unbranded', rate: '0%' },
    { category: 'Grains/Dal', item: 'Branded/Packaged Grains & Dal', hsn: '1001-1008, 0713', condition: 'Packaged with Brand', rate: '5%' },
    { category: 'Pulses', item: 'Moong, Urad, Tur/Arhar, Chana', hsn: '0713', condition: 'Loose / Unbranded', rate: '0%' },
    { category: 'Oilseeds', item: 'Soyabean, Mustard Seed', hsn: '1201 / 1207', condition: 'Seeds for processing', rate: '0% / 5%' },
];

export default function HSNFinderPage() {
    return (
        <main className="min-h-screen bg-[#f7fbf3] text-gray-900 pt-20">
            <LandingHeader />

            {/* Hero Section */}
            <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
                <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-4">
                    MandiGrow Resources · India
                </p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.05] mb-6">
                    Mandi HSN Codes & GST Rates Finder
                </h1>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
                    Confused about GST on agricultural products? Below is the ultimate directory of HSN codes and GST rates for fresh fruits, sabji, spices, and anaj traded in Indian Mandis.
                </p>
            </section>

            {/* Explanation Sections */}
            <section className="max-w-4xl mx-auto px-6 pb-16">
                <div className="prose prose-emerald lg:prose-lg max-w-none text-gray-700">
                    <p className="lead">
                        If you are a Commission Agent (Arhtiya), trader, or farmer operating in an Indian APMC Mandi, staying compliant with GST regulations is critical. Applying the wrong HSN code or GST rate can lead to compliance issues, penalties, or rejected e-Way bills.
                    </p>

                    <h3 className="text-2xl font-black mt-10 mb-4 text-gray-900">1. Fresh Vegetables (Sabji) - HSN Chapter 07</h3>
                    <p>
                        In general, <strong>fresh and chilled vegetables are completely exempt from GST (0%)</strong>. The government keeps essential daily food items tax-free to protect consumers and farmers. However, if you are trading in frozen, canned, or processed vegetables, GST applies. For example, frozen peas or processed potatoes might attract a 5% GST rate.
                    </p>

                    <h3 className="text-2xl font-black mt-10 mb-4 text-gray-900">2. Fresh Fruits - HSN Chapter 08</h3>
                    <p>
                        Similar to vegetables, <strong>fresh fruits are 100% exempt from GST (0%)</strong>. Whether it is apples from Himachal or bananas from Maharashtra, fresh trade in the Mandi is tax-free. The catch? If you deal in dry fruits (like almonds or walnuts) or sliced/processed fruits, the GST rate jumps to 5% or 12% depending on the packaging and processing level.
                    </p>

                    <h3 className="text-2xl font-black mt-10 mb-4 text-gray-900">3. Cereals, Grains & Pulses (Anaj & Dal) - HSN Chapters 10 & 07</h3>
                    <p>
                        The rules for grains (wheat, rice, maize) and pulses (chana, moong, arhar dal) are heavily dependent on <strong>branding and packaging</strong>.
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Loose / Unbranded Grains & Pulses:</strong> If you sell these loose in the Mandi without a registered brand name, they attract <strong>0% GST</strong>.</li>
                        <li><strong>Pre-packaged & Labeled:</strong> If put into a unit container and bearing a registered brand name, they attract <strong>5% GST</strong>.</li>
                    </ul>

                    <h3 className="text-2xl font-black mt-10 mb-4 text-gray-900">4. Spices (Masala) & Chillies - HSN Chapter 09</h3>
                    <p>
                        Spices are a massive part of Mandi trade. The GST rate for spices depends on whether they are sold fresh or dried/crushed.
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Fresh Spices (e.g., Fresh Green Chili, Fresh Ginger):</strong> These are treated similarly to vegetables and attract <strong>0% GST</strong>.</li>
                        <li><strong>Dried Spices (e.g., Dry Red Chili, Cumin/Jeera):</strong> Dried whole spices or crushed spices generally attract <strong>5% GST</strong>.</li>
                    </ul>
                </div>
            </section>

            {/* Big Table Section */}
            <section className="max-w-6xl mx-auto px-6 py-16 border-t border-emerald-100">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-gray-900">
                        The Ultimate Mandi Quick Reference Table
                    </h2>
                    <p className="text-lg text-gray-600">
                        Use this simplified table for your daily billing and gate passes. 
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-50 border-b border-emerald-100">
                                    <th className="p-4 font-black text-emerald-900">Category</th>
                                    <th className="p-4 font-black text-emerald-900">Commodity / Item</th>
                                    <th className="p-4 font-black text-emerald-900">HSN Code</th>
                                    <th className="p-4 font-black text-emerald-900">Condition</th>
                                    <th className="p-4 font-black text-emerald-900 text-right">GST Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMMODITIES.map((c, idx) => (
                                    <tr key={idx} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                        <td className="p-4 text-sm font-bold text-gray-600">{c.category}</td>
                                        <td className="p-4 text-sm font-semibold text-gray-900">{c.item}</td>
                                        <td className="p-4 text-sm font-mono text-emerald-700 bg-emerald-50/50 rounded inline-block mt-3 ml-4">{c.hsn}</td>
                                        <td className="p-4 text-sm text-gray-600">{c.condition}</td>
                                        <td className="p-4 text-sm font-black text-right text-gray-900">{c.rate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-900 font-medium">
                        <strong>Disclaimer:</strong> GST rules and HSN classifications are subject to change based on GST Council meetings. Always consult your Chartered Accountant (CA) before finalizing tax settings in your ERP.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">
                    Tired of manual HSN & GST mapping?
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    MandiGrow automatically maps the correct HSN codes and calculates item-level GST on every sale patti. Stop writing paper bills and start automating your Mandi business.
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-10 py-5 bg-emerald-700 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-800 transition text-lg"
                >
                    Start Free Trial with Automated GST →
                </Link>
            </section>
            
            <LandingFooter />
        </main>
    );
}
