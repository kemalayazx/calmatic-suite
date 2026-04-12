import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: {
    default: "Calmatic Suite — Free Online Calculator Tools",
    template: "%s | Calmatic Suite",
  },
  description:
    "40+ free online calculators: mortgage, payroll, scientific, statistics, unit converter, GPA, investment, and more. No ads, no sign-up, open source.",
  keywords: [
    "online calculator", "free calculator", "mortgage calculator",
    "scientific calculator", "payroll calculator", "GPA calculator",
    "unit converter", "investment calculator", "compound interest",
    "tax calculator", "BMI calculator", "statistics calculator",
    "currency converter", "loan calculator", "percentage calculator",
    "geometry calculator", "cooking converter", "date calculator",
    "color converter", "electronics calculator",
  ],
  authors: [{ name: "Calmatic Suite Contributors" }],
  creator: "Calmatic Suite",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Calmatic Suite",
    title: "Calmatic Suite — Free Online Calculator Tools",
    description: "40+ free online calculators for finance, math, science, and everyday life.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Calmatic Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calmatic Suite — Free Online Calculator Tools",
    description: "40+ free calculators. No ads, no sign-up.",
    images: [`${SITE_URL}/og-image.png`],
  },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#7c3aed",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Source viewer easter egg */}
        <script dangerouslySetInnerHTML={{ __html: `
          console.log("%c🔍 Hey seni gidi meraklı! Yanlış yere bakıyorsun 😄", "font-size:20px;color:#7c3aed;font-weight:bold");
          console.log("%cCalmatic Suite — Free & Open Source Calculator Tools", "font-size:14px;color:#666");
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Calmatic Suite",
              description: "40+ free online calculator tools for finance, math, science, and everyday life",
              url: SITE_URL,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              author: { "@type": "Organization", name: "Calmatic Suite Contributors" },
            }),
          }}
        />
      </head>
      <body
        className="min-h-screen"
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          fontFamily:
            "'Inter', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Noto Sans Arabic', 'Noto Sans Devanagari', system-ui, sans-serif",
        }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
