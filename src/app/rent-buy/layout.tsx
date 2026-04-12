import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Rent vs Buy Calculator — Should You Rent or Buy a Home?",
  description: "Compare the true cost of renting vs buying a home over time. Includes mortgage, property tax, equity buildup, opportunity cost, and crossover analysis.",
  keywords: ["rent vs buy calculator", "should I rent or buy", "home buying calculator", "mortgage vs rent", "real estate calculator"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
