import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Probability Calculator — Dice, Coins & Binomial | Calmatic Suite",
  description: "Basic probability calculator, dice and coin simulations, binomial distribution. Free probability tools.",
  keywords: ["probability calculator","dice probability","coin flip calculator","binomial distribution","statistics probability"],
  openGraph: {
    title: "Probability Calculator — Dice, Coins & Binomial | Calmatic Suite",
    description: "Basic probability calculator, dice and coin simulations, binomial distribution. Free probability tools.",
    url: "https://calmatic.vercel.app/probability",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Probability Calculator — Dice, Coins & Binomial | Calmatic Suite",
    description: "Basic probability calculator, dice and coin simulations, binomial distribution. Free probability tools.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/probability",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
