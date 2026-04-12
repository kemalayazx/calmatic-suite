import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Date Calculator — Date Difference & Countdown | Calmatic Suite",
  description: "Calculate date difference, add or subtract days, and view live countdown timer. Free date calculator.",
  keywords: ["date calculator","date difference calculator","countdown timer","add days calculator","days between dates"],
  openGraph: {
    title: "Date Calculator — Date Difference & Countdown | Calmatic Suite",
    description: "Calculate date difference, add or subtract days, and view live countdown timer. Free date calculator.",
    url: "https://calmatic.webzip.studio/dates",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Date Calculator — Date Difference & Countdown | Calmatic Suite",
    description: "Calculate date difference, add or subtract days, and view live countdown timer. Free date calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/dates",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
