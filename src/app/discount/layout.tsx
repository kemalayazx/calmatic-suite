import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discount Calculator — Sale Price & Savings | Calmatic Suite",
  description: "Calculate discount price, find original price, and compare bulk savings. Free online discount calculator.",
  keywords: ["discount calculator","sale price calculator","percent off calculator","bulk savings calculator","coupon calculator"],
  openGraph: {
    title: "Discount Calculator — Sale Price & Savings | Calmatic Suite",
    description: "Calculate discount price, find original price, and compare bulk savings. Free online discount calculator.",
    url: "https://calmatic.webzip.studio/discount",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discount Calculator — Sale Price & Savings | Calmatic Suite",
    description: "Calculate discount price, find original price, and compare bulk savings. Free online discount calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/discount",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
