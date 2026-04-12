import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Calculator — BMI & Calorie Calculator | Calmatic Suite",
  description: "Calculate BMI, daily calorie needs, and ideal weight. Free online health calculator.",
  keywords: ["BMI calculator","calorie calculator","ideal weight calculator","body mass index","daily calorie needs"],
  openGraph: {
    title: "Health Calculator — BMI & Calorie Calculator | Calmatic Suite",
    description: "Calculate BMI, daily calorie needs, and ideal weight. Free online health calculator.",
    url: "https://calmatic.webzip.studio/health",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Calculator — BMI & Calorie Calculator | Calmatic Suite",
    description: "Calculate BMI, daily calorie needs, and ideal weight. Free online health calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/health",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
