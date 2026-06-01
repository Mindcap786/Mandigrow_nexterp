import { Metadata } from "next";
import { UserGuideClient } from "./UserGuideClient";

export const metadata: Metadata = {
    title: "MandiGrow User Guide | Complete Help Centre for Mandi ERP",
    description:
        "Step-by-step guide to use MandiGrow ERP — from initial setup and adding parties, to recording arrivals (purchases), processing sales, managing finance, and reading P&L reports. Designed for mandi clerks, accountants and business owners.",
    keywords:
        "MandiGrow user guide, mandi software help, how to use mandi ERP, APMC billing software tutorial, sabji mandi billing help, fruit mandi ERP guide, mandi khata software, commission agent software help",
    openGraph: {
        title: "MandiGrow User Guide | Complete Help Centre for Mandi ERP",
        description:
            "Step-by-step guide to use MandiGrow — from first setup to daily trading, finance and reports. Written for mandi clerks and business owners.",
        url: "https://www.mandigrow.com/user-guide",
        siteName: "MandiGrow",
        images: [{ url: "https://www.mandigrow.com/og-image.png", width: 1200, height: 630 }],
        locale: "en_IN",
        type: "website",
    },
    alternates: {
        canonical: "https://www.mandigrow.com/user-guide",
    },
};

export default function UserGuidePage() {
    return <UserGuideClient />;
}
