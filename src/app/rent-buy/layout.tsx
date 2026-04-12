import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator — Should You Rent or Buy a Home? | Calmatic Suite",
  description: "Compare the true cost of renting vs buying a home. Includes mortgage, property tax, equity buildup, opportunity cost, and crossover analysis.",
  keywords: ["rent vs buy calculator", "should I rent or buy", "home buying calculator", "mortgage vs rent", "real estate calculator"],
  openGraph: {
    title: "Rent vs Buy Calculator — Should You Rent or Buy a Home? | Calmatic Suite",
    description: "Compare the true cost of renting vs buying a home. Includes mortgage, property tax, equity buildup, opportunity cost, and crossover analysis.",
    url: `${SITE_URL}/rent-buy`,
  },
  twitter: {
    title: "Rent vs Buy Calculator — Should You Rent or Buy a Home? | Calmatic Suite",
    description: "Compare the true cost of renting vs buying a home. Includes mortgage, property tax, equity buildup, opportunity cost, and crossover analysis.",
  },
  alternates: {
    canonical: `${SITE_URL}/rent-buy`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
