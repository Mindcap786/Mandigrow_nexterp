import type { Metadata } from 'next'
import { HomePageShell } from '@/components/home/HomePageShell'

export const metadata: Metadata = {
    title: "India's #1 Mandi ERP Software — Commission, Ledger & APMC Billing | MandiGrow",
    description:
        "MandiGrow is India's #1 Mandi ERP software. Complete commission management, farmer & trader ledger, daybook, APMC billing, and GST compliance. Trusted by mandis across Andhra Pradesh, Telangana & Maharashtra. Free 14-day trial.",
    keywords: [
        'mandi ERP software',
        'APMC management software India',
        'mandi commission software',
        'agricultural market software India',
        'mandi billing software',
        'commission agent software India',
        'grain mandi ERP',
        'mandi khata software',
        'APMC billing software',
        'mandi management system India',
        'sabzi mandi software',
        'fruits vegetable ERP India',
    ],
    alternates: {
        canonical: 'https://www.mandigrow.com',
    },
    openGraph: {
        title: "India's #1 Mandi ERP Software — MandiGrow",
        description:
            'Commission management, farmer & trader ledger, daybook, APMC billing — all in one. Built for Indian mandis. Free 14-day trial.',
        url: 'https://www.mandigrow.com',
        type: 'website',
    },
}

export default function HomePage() {
    return <HomePageShell />
}
