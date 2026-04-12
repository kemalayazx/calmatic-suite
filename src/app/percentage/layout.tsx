import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Percentage Calculator — X% of Y & Percentage Change | Calmatic Suite",
  description: "Calculate what is X% of Y, percentage change, margin vs markup. Free online percentage calculator.",
  keywords: ["percentage calculator","percent of calculator","percentage change calculator","margin calculator","markup calculator"],
  openGraph: {
    title: "Percentage Calculator — X% of Y & Percentage Change | Calmatic Suite",
    description: "Calculate what is X% of Y, percentage change, margin vs markup. Free online percentage calculator.",
    url: "https://calmatic.webzip.studio/percentage",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Percentage Calculator — X% of Y & Percentage Change | Calmatic Suite",
    description: "Calculate what is X% of Y, percentage change, margin vs markup. Free online percentage calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/percentage",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
