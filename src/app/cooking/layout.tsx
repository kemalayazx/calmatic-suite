import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cooking Calculator — Recipe Scaler & Unit Converter | Calmatic Suite",
  description: "Scale recipes, convert cooking units, and calculate baking ratios. Free cooking calculator.",
  keywords: ["cooking calculator","recipe scaler","cooking unit converter","baking calculator","kitchen measurement converter"],
  openGraph: {
    title: "Cooking Calculator — Recipe Scaler & Unit Converter | Calmatic Suite",
    description: "Scale recipes, convert cooking units, and calculate baking ratios. Free cooking calculator.",
    url: "https://calmatic.webzip.studio/cooking",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cooking Calculator — Recipe Scaler & Unit Converter | Calmatic Suite",
    description: "Scale recipes, convert cooking units, and calculate baking ratios. Free cooking calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/cooking",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
