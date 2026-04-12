import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fuel Calculator — Trip Cost & MPG Converter | Calmatic Suite",
  description: "Calculate trip fuel cost, split costs among travelers, and convert MPG to L/100km. Free fuel calculator.",
  keywords: ["fuel calculator","trip cost calculator","MPG calculator","gas cost calculator","fuel cost splitter"],
  openGraph: {
    title: "Fuel Calculator — Trip Cost & MPG Converter | Calmatic Suite",
    description: "Calculate trip fuel cost, split costs among travelers, and convert MPG to L/100km. Free fuel calculator.",
    url: "https://calmatic.webzip.studio/fuel",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fuel Calculator — Trip Cost & MPG Converter | Calmatic Suite",
    description: "Calculate trip fuel cost, split costs among travelers, and convert MPG to L/100km. Free fuel calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/fuel",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
