import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import './mobile-native.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Toaster } from "@/components/ui/toaster"
import { OfflineSyncManager } from '@/components/layout/offline-sync-manager'
import { SubscriptionEnforcer } from '@/components/layout/subscription-enforcer'
import { LanguageProvider } from '@/components/i18n/language-provider'
import { ShortcutProvider } from '@/components/providers/shortcut-provider'
import { ImpersonationBanner } from '@/components/admin/impersonation-banner'
import { PaymentReminderBanner } from '@/components/layout/payment-reminder-banner'
import { KeyboardHelpOverlay } from '@/components/layout/keyboard-help-overlay'
// ── Capacitor Native Shell ────────────────────────────────────────────────────
import { CapacitorProvider } from '@/components/capacitor/capacitor-provider'
import { NativeAuthGuard } from '@/components/capacitor/native-auth-guard'
import { FeatureFlagsProvider } from '@/components/providers/FeatureFlagsProvider'
// ─────────────────────────────────────────────────────────────────────────────

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    metadataBase: new URL('https://www.mandigrow.com'),
    title: {
        default: 'Fruit Mandi Software India | Sabji & Vegetable Billing ERP | MandiGrow',
        template: '%s | MandiGrow',
    },
    description: "India's best mandi ERP software — sabji lot billing, fruit invoicing, anaj mandi, commission calculation, GST, and digital khata. Try our live patti calculator free. Android + web, 7 Indian languages, ₹0 setup.",
    applicationName: 'MandiGrow',
    keywords: [
        'mandi ERP software',
        'fruit mandi software',
        'sabji mandi software',
        'vegetable mandi billing software',
        'anaj mandi software',
        'agriculture billing software',
        'fruits and vegetable ERP',
        'mandi software India',
        'vegetable merchant software',
        'fruits vegetable accounting software',
        'commission agent software mandi',
        'digital mandi khata software',
        'Tally alternative for mandi',
        'sabzi mandi ERP software',
        'fruit mandi billing software',
        'sabji billing software',
        'sabzi mandi billing',
        'wholesale market ERP India',
    ],
    authors: [{ name: 'MandiGrow', url: 'https://www.mandigrow.com' }],
    creator: 'MandiGrow',
    publisher: 'MandiGrow',
    manifest: '/manifest.json',
    alternates: {
        canonical: 'https://www.mandigrow.com',
        // NOTE: hreflang entries removed until real /hi /ta /te /kn /ml routes
        // exist. Lying to Google about alternates is worse than omitting them.
    },
    openGraph: {
        type: 'website',
        url: 'https://www.mandigrow.com',
        siteName: 'MandiGrow',
        title: 'Mandi ERP Software for Fruits & Vegetable Traders | MandiGrow',
        description:
            "India's #1 mandi ERP for fruits & vegetable merchants. GST billing, mandi khata, commission, stock & reports — in Hindi & English.",
        locale: 'en_IN',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'MandiGrow — Mandi ERP for Fruits & Vegetable Traders',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Mandi ERP Software for Fruits & Vegetable Traders | MandiGrow',
        description:
            "India's #1 mandi ERP for fruits & vegetable merchants. GST billing, khata, commission, stock & reports.",
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        },
    },
    verification: {
        google: '4asvN_FQ0dORJNhDxI2DnWUP8aWhEo13xo6y6gwUCYs',
    },
    category: 'Business Software',
    icons: {
        icon: [
            { url: '/icons/icon.svg', type: 'image/svg+xml' },
            { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
        ],
        apple: [
            { url: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#1B5E20',
    // CRITICAL for iOS: enables env(safe-area-inset-*) CSS variables for notch/Dynamic Island
    viewportFit: 'cover',
    // Android 13+ Chromium WebView: resize layout viewport when keyboard shows,
    // so dvh / inner height reflect the available space instead of overlaying.
    interactiveWidget: 'resizes-content',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        // lang and dir are managed dynamically by LanguageProvider's useEffect
        // They default to 'en' / 'ltr' and update on client after hydration
        <html lang="en" dir="ltr" className="light">
            <head>
            {/* ── Favicon chain: covers all browsers + Google Search ─────────── */}
                {/* SVG favicon (modern browsers, Google uses this) */}
                <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
                {/* Fallback ICO for IE and legacy crawlers */}
                <link rel="shortcut icon" href="/icons/icon.svg" />
                {/* Apple Touch Icon (iOS home screen, iMessage link previews) */}
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon.svg" />
                {/* Chrome / Android PWA theme */}
                <meta name="msapplication-TileColor" content="#1B5E20" />
                {/* ─────────────────────────────────────────────────────────────── */}
                {/* Preconnect to Google Fonts for Indic / Urdu script support */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {/* Organization schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'MandiGrow',
                            url: 'https://www.mandigrow.com',
                            logo: 'https://www.mandigrow.com/logo.png',
                            contactPoint: {
                                '@type': 'ContactPoint',
                                contactType: 'Sales',
                                areaServed: 'IN',
                                availableLanguage: ['Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Urdu', 'English'],
                            },
                        }),
                    }}
                />


                {/* SoftwareApplication schema for SEO — see ARCHITECTURE.md / SEO pack */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: 'MandiGrow',
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'Android, Web',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'INR',
                                description: 'Free trial available',
                            },
                            description:
                                "MandiGrow is India's #1 mandi ERP software for commission agents, fruit and vegetable traders, and warehouse managers. Auto commission, GST billing, mandi khata, APMC compliance.",
                            url: 'https://www.mandigrow.com',
                            screenshot: 'https://www.mandigrow.com/og-image.png',
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.8',
                                reviewCount: '48',
                            },
                        }),
                    }}
                />
                {/* Fallback theme-color for older iOS that don't read viewport.themeColor above */}
                <meta name="theme-color" content="#050510" />

            </head>
            <body className={`${inter.className} min-h-screen bg-gray-50 antialiased`}>
                {/* CapacitorProvider: adds native class, deep links, back button, keyboard */}
                {/* NativeAuthGuard: client-side session check (web = transparent pass-through) */}
                <FeatureFlagsProvider>
                    <CapacitorProvider>
                        <NativeAuthGuard>
                            <LanguageProvider>
                                <ShortcutProvider>
                                    <AuthProvider>
                                        <ImpersonationBanner />
                                        <PaymentReminderBanner />

                                        <Script id="json-ld-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                                            "@context": "https://schema.org",
                                            "@graph": [
                                                {
                                                    "@type": "SoftwareApplication",
                                                    "name": "MandiGrow",
                                                    "operatingSystem": "Web, iOS, Android",
                                                    "applicationCategory": "BusinessApplication",
                                                    "aggregateRating": {
                                                        "@type": "AggregateRating",
                                                        "ratingValue": "4.9",
                                                        "ratingCount": "184"
                                                    },
                                                    "offers": {
                                                        "@type": "Offer",
                                                        "price": "500",
                                                        "priceCurrency": "INR"
                                                    }
                                                },
                                                {
                                                    "@type": "Organization",
                                                    "name": "MandiGrow",
                                                    "url": "https://www.mandigrow.com",
                                                    "logo": "https://www.mandigrow.com/icons/icon.svg",
                                                    "description": "India's leading APMC Mandi ERP software for commission agents, fruit & vegetable traders.",
                                                    "email": "support@mandigrow.com",
                                                    "contactPoint": {
                                                        "@type": "ContactPoint",
                                                        "contactType": "customer support",
                                                        "availableLanguage": ["English", "Hindi"],
                                                        "areaServed": "IN"
                                                    },
                                                    "sameAs": [
                                                        "https://twitter.com/mandigrow",
                                                        "https://www.facebook.com/mandigrow",
                                                        "https://www.linkedin.com/company/mandigrow"
                                                    ]
                                                },
                                                {
                                                    "@type": "LocalBusiness",
                                                    "name": "MandiGrow — Mandi ERP Software",
                                                    "image": "https://www.mandigrow.com/icons/icon.svg",
                                                    "url": "https://www.mandigrow.com",
                                                    "telephone": "+91-9999999999",
                                                    "priceRange": "₹₹",
                                                    "address": {
                                                        "@type": "PostalAddress",
                                                        "addressLocality": "New Delhi",
                                                        "addressRegion": "Delhi",
                                                        "postalCode": "110001",
                                                        "addressCountry": "IN"
                                                    },
                                                    "geo": {
                                                        "@type": "GeoCoordinates",
                                                        "latitude": 28.6139,
                                                        "longitude": 77.2090
                                                    },
                                                    "openingHoursSpecification": {
                                                        "@type": "OpeningHoursSpecification",
                                                        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                                                        "opens": "09:00",
                                                        "closes": "20:00"
                                                    },
                                                    "aggregateRating": {
                                                        "@type": "AggregateRating",
                                                        "ratingValue": "4.9",
                                                        "reviewCount": "184"
                                                    }
                                                },
                                                {
                                                    "@type": "WebSite",
                                                    "name": "MandiGrow",
                                                    "url": "https://www.mandigrow.com",
                                                    "potentialAction": {
                                                        "@type": "SearchAction",
                                                        "target": {
                                                            "@type": "EntryPoint",
                                                            "urlTemplate": "https://www.mandigrow.com/blog?q={search_term_string}"
                                                        },
                                                        "query-input": "required name=search_term_string"
                                                    }
                                                }
                                            ]
                                        })}} />

                                        {children}
                                        <Toaster />
                                        <OfflineSyncManager />
                                        <SubscriptionEnforcer />
                                        <KeyboardHelpOverlay />
                                    </AuthProvider>
                                </ShortcutProvider>
                            </LanguageProvider>
                        </NativeAuthGuard>
                    </CapacitorProvider>
                </FeatureFlagsProvider>

                {/* Google Analytics */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-6P8FT725J6"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-6P8FT725J6');
                    `}
                </Script>
            </body>
        </html>
    )
}
