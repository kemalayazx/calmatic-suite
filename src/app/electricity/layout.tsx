import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Electricity Cost Calculator — Appliance, Solar & Bulb Comparison | Calmatic Suite",
  description: "Calculate electricity costs for appliances, estimate solar panel savings, and compare LED vs CFL vs incandescent bulb costs. Free tool.",
  keywords: ["electricity cost calculator", "appliance energy calculator", "solar savings calculator", "LED vs CFL vs incandescent", "electricity bill calculator"],
  openGraph: {
    title: "Electricity Cost Calculator — Appliance, Solar & Bulb Comparison | Calmatic Suite",
    description: "Calculate electricity costs for appliances, estimate solar panel savings, and compare LED vs CFL vs incandescent bulb costs. Free tool.",
    url: `${SITE_URL}/electricity`,
  },
  twitter: {
    title: "Electricity Cost Calculator — Appliance, Solar & Bulb Comparison | Calmatic Suite",
    description: "Calculate electricity costs for appliances, estimate solar panel savings, and compare LED vs CFL vs incandescent bulb costs. Free tool.",
  },
  alternates: {
    canonical: `${SITE_URL}/electricity`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
