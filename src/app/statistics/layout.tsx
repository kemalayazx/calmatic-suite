import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics Calculator — Mean, Median & Standard Deviation | Calmatic Suite",
  description: "Calculate mean, median, mode, standard deviation, variance, and view histogram. Free statistics calculator.",
  keywords: ["statistics calculator","mean median mode","standard deviation calculator","variance calculator","histogram calculator"],
  openGraph: {
    title: "Statistics Calculator — Mean, Median & Standard Deviation | Calmatic Suite",
    description: "Calculate mean, median, mode, standard deviation, variance, and view histogram. Free statistics calculator.",
    url: "https://calmatic.webzip.studio/statistics",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statistics Calculator — Mean, Median & Standard Deviation | Calmatic Suite",
    description: "Calculate mean, median, mode, standard deviation, variance, and view histogram. Free statistics calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/statistics",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
