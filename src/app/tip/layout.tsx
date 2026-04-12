import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tip Calculator — Bill Splitter & Gratuity | Calmatic Suite",
  description: "Calculate tip amount and split the bill among friends. Free online tip calculator with bill splitter.",
  keywords: ["tip calculator","bill splitter","gratuity calculator","restaurant tip","split bill calculator"],
  openGraph: {
    title: "Tip Calculator — Bill Splitter & Gratuity | Calmatic Suite",
    description: "Calculate tip amount and split the bill among friends. Free online tip calculator with bill splitter.",
    url: "https://calmatic.webzip.studio/tip",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tip Calculator — Bill Splitter & Gratuity | Calmatic Suite",
    description: "Calculate tip amount and split the bill among friends. Free online tip calculator with bill splitter.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/tip",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
