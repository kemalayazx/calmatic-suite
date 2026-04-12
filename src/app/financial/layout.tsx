import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculator — Interest & Loans | Calmatic Suite",
  description: "Calculate simple interest, compound interest, and loan payments online. Free financial calculator for all your money math.",
  keywords: ["financial calculator","simple interest","compound interest","loan payment calculator","interest rate calculator"],
  openGraph: {
    title: "Financial Calculator — Interest & Loans | Calmatic Suite",
    description: "Calculate simple interest, compound interest, and loan payments online. Free financial calculator for all your money math.",
    url: "https://calmatic.webzip.studio/financial",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Calculator — Interest & Loans | Calmatic Suite",
    description: "Calculate simple interest, compound interest, and loan payments online. Free financial calculator for all your money math.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/financial",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
