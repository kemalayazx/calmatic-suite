import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Speed Calculator — Distance, Time & Pace Converter | Calmatic Suite",
  description: "Calculate speed, distance, or time given any two values. Unit conversion and running pace calculator with finish time prediction. Free tool.",
  keywords: ["speed calculator", "distance time calculator", "pace calculator", "speed distance time", "running pace converter"],
  openGraph: {
    title: "Speed Calculator — Distance, Time & Pace Converter | Calmatic Suite",
    description: "Calculate speed, distance, or time given any two values. Unit conversion and running pace calculator with finish time prediction. Free tool.",
    url: `${SITE_URL}/speed`,
  },
  twitter: {
    title: "Speed Calculator — Distance, Time & Pace Converter | Calmatic Suite",
    description: "Calculate speed, distance, or time given any two values. Unit conversion and running pace calculator with finish time prediction. Free tool.",
  },
  alternates: {
    canonical: `${SITE_URL}/speed`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
