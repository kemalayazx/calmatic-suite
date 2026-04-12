import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator — Monthly Payment & Amortization | Calmatic Suite",
  description: "Calculate monthly mortgage payments, view amortization schedule, and check affordability. Free online mortgage calculator.",
  keywords: ["mortgage calculator","monthly payment calculator","amortization calculator","home loan calculator","mortgage affordability"],
  openGraph: {
    title: "Mortgage Calculator — Monthly Payment & Amortization | Calmatic Suite",
    description: "Calculate monthly mortgage payments, view amortization schedule, and check affordability. Free online mortgage calculator.",
    url: "https://calmatic.webzip.studio/mortgage",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator — Monthly Payment & Amortization | Calmatic Suite",
    description: "Calculate monthly mortgage payments, view amortization schedule, and check affordability. Free online mortgage calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/mortgage",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
