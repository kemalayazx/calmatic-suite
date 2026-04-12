import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounting Tools — VAT & Depreciation | Calmatic Suite",
  description: "VAT calculator, depreciation calculator, and profit-loss analysis. Free online accounting tools.",
  keywords: ["accounting calculator","VAT calculator","depreciation calculator","profit loss calculator","bookkeeping tools"],
  openGraph: {
    title: "Accounting Tools — VAT & Depreciation | Calmatic Suite",
    description: "VAT calculator, depreciation calculator, and profit-loss analysis. Free online accounting tools.",
    url: "https://calmatic.webzip.studio/accounting",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accounting Tools — VAT & Depreciation | Calmatic Suite",
    description: "VAT calculator, depreciation calculator, and profit-loss analysis. Free online accounting tools.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/accounting",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
