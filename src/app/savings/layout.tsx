import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings Calculator — Savings Goal & Emergency Fund | Calmatic Suite",
  description: "Calculate savings goals, emergency fund needs, and CD deposit returns. Free savings calculator.",
  keywords: ["savings calculator","savings goal calculator","emergency fund calculator","CD calculator","deposit calculator"],
  openGraph: {
    title: "Savings Calculator — Savings Goal & Emergency Fund | Calmatic Suite",
    description: "Calculate savings goals, emergency fund needs, and CD deposit returns. Free savings calculator.",
    url: "https://calmatic.webzip.studio/savings",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Savings Calculator — Savings Goal & Emergency Fund | Calmatic Suite",
    description: "Calculate savings goals, emergency fund needs, and CD deposit returns. Free savings calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/savings",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
