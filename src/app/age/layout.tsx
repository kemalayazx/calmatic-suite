import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Calculator — Exact Age & Birthday | Calmatic Suite",
  description: "Calculate your exact age, days until your next birthday, and zodiac sign. Free age calculator.",
  keywords: ["age calculator","birthday calculator","exact age calculator","zodiac sign calculator","how old am I"],
  openGraph: {
    title: "Age Calculator — Exact Age & Birthday | Calmatic Suite",
    description: "Calculate your exact age, days until your next birthday, and zodiac sign. Free age calculator.",
    url: "https://calmatic.webzip.studio/age",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Age Calculator — Exact Age & Birthday | Calmatic Suite",
    description: "Calculate your exact age, days until your next birthday, and zodiac sign. Free age calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/age",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
