import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Calculator — Income Tax & Invoice Breakdown | Calmatic Suite",
  description: "Invoice tax breakdown, income tax brackets, and withholding calculator. Free online tax calculator.",
  keywords: ["tax calculator","income tax calculator","invoice tax","withholding calculator","tax bracket calculator"],
  openGraph: {
    title: "Tax Calculator — Income Tax & Invoice Breakdown | Calmatic Suite",
    description: "Invoice tax breakdown, income tax brackets, and withholding calculator. Free online tax calculator.",
    url: "https://calmatic.vercel.app/taxes",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tax Calculator — Income Tax & Invoice Breakdown | Calmatic Suite",
    description: "Invoice tax breakdown, income tax brackets, and withholding calculator. Free online tax calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/taxes",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
