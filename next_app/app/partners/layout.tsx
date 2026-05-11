import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Partner Program — Earn 30% Commission | MandiGrow',
  description: "Join MandiGrow's Partner Network. Earn 30% recurring commission selling India's #1 Mandi ERP to APMCs across India.",
  openGraph: {
    title: 'Partner Program — Earn 30% Commission | MandiGrow',
    description: "Join MandiGrow's Partner Network. Earn 30% recurring commission selling India's #1 Mandi ERP to APMCs across India.",
    images: [{ url: 'https://www.mandigrow.com/images/og-partners.jpg' }]
  }
};

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
