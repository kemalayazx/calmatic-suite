import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Random Number Generator — Dice, Coin Flip & List Randomizer",
  description: "Generate cryptographically secure random numbers, shuffle lists, pick random items, flip coins, and roll dice. Free online random generator.",
  keywords: ["random number generator", "dice roller", "coin flip", "list randomizer", "random picker", "secure random"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
