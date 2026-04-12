import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Electricity Cost Calculator — Appliance, Solar & Bulb Comparison",
  description: "Calculate electricity costs for appliances, estimate solar panel savings and payback period, and compare LED vs CFL vs incandescent bulb costs.",
  keywords: ["electricity cost calculator", "appliance energy calculator", "solar savings calculator", "LED vs CFL vs incandescent", "electricity bill calculator"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
