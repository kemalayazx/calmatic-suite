import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator — Debt Payoff Timeline | Calmatic Suite",
  description: "Calculate credit card payoff timeline, minimum payment analysis, and balance transfer savings. Free debt calculator.",
  keywords: ["credit card payoff calculator","debt payoff calculator","minimum payment calculator","balance transfer calculator","credit card debt"],
  openGraph: {
    title: "Credit Card Payoff Calculator — Debt Payoff Timeline | Calmatic Suite",
    description: "Calculate credit card payoff timeline, minimum payment analysis, and balance transfer savings. Free debt calculator.",
    url: "https://calmatic.webzip.studio/credit-card",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Card Payoff Calculator — Debt Payoff Timeline | Calmatic Suite",
    description: "Calculate credit card payoff timeline, minimum payment analysis, and balance transfer savings. Free debt calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/credit-card",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
