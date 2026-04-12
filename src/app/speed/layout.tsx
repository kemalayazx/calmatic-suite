import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Speed Calculator — Distance, Time, Pace Converter",
  description: "Calculate speed, distance, or time given any two values. Includes unit conversion and running pace calculator with finish time prediction.",
  keywords: ["speed calculator", "distance time calculator", "pace calculator", "speed distance time", "running pace converter"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
