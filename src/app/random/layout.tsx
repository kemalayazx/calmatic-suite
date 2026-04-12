import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Random Number Generator — Dice, Coin Flip & List Randomizer | Calmatic Suite",
  description: "Generate cryptographically secure random numbers, shuffle lists, flip coins, and roll dice. Free online random number generator.",
  keywords: ["random number generator", "dice roller", "coin flip", "list randomizer", "random picker", "secure random"],
  openGraph: {
    title: "Random Number Generator — Dice, Coin Flip & List Randomizer | Calmatic Suite",
    description: "Generate cryptographically secure random numbers, shuffle lists, flip coins, and roll dice. Free online random number generator.",
    url: `${SITE_URL}/random`,
  },
  twitter: {
    title: "Random Number Generator — Dice, Coin Flip & List Randomizer | Calmatic Suite",
    description: "Generate cryptographically secure random numbers, shuffle lists, flip coins, and roll dice. Free online random number generator.",
  },
  alternates: {
    canonical: `${SITE_URL}/random`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
