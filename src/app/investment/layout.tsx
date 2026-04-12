import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Calculator — Compound Growth & ROI | Calmatic Suite",
  description: "Calculate compound investment growth, ROI, retirement planning, and dollar cost averaging. Free investment calculator.",
  keywords: ["investment calculator","compound growth calculator","ROI calculator","retirement calculator","dollar cost averaging"],
  openGraph: {
    title: "Investment Calculator — Compound Growth & ROI | Calmatic Suite",
    description: "Calculate compound investment growth, ROI, retirement planning, and dollar cost averaging. Free investment calculator.",
    url: "https://calmatic.vercel.app/investment",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investment Calculator — Compound Growth & ROI | Calmatic Suite",
    description: "Calculate compound investment growth, ROI, retirement planning, and dollar cost averaging. Free investment calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/investment",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
