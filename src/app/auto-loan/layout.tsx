import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Loan Calculator — Monthly Payment & Lease vs Buy | Calmatic Suite",
  description: "Calculate monthly car payment, check affordability, and compare lease vs buy options. Free auto loan calculator.",
  keywords: ["auto loan calculator","car payment calculator","lease vs buy calculator","car loan affordability","vehicle financing"],
  openGraph: {
    title: "Auto Loan Calculator — Monthly Payment & Lease vs Buy | Calmatic Suite",
    description: "Calculate monthly car payment, check affordability, and compare lease vs buy options. Free auto loan calculator.",
    url: "https://calmatic.webzip.studio/auto-loan",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Loan Calculator — Monthly Payment & Lease vs Buy | Calmatic Suite",
    description: "Calculate monthly car payment, check affordability, and compare lease vs buy options. Free auto loan calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/auto-loan",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
