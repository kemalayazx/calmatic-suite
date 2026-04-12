import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter — Live Exchange Rates | Calmatic Suite",
  description: "Live exchange rates for 12+ currencies. Convert USD, EUR, GBP, JPY, and more. Free currency converter.",
  keywords: ["currency converter","exchange rate calculator","USD EUR converter","live exchange rates","forex converter"],
  openGraph: {
    title: "Currency Converter — Live Exchange Rates | Calmatic Suite",
    description: "Live exchange rates for 12+ currencies. Convert USD, EUR, GBP, JPY, and more. Free currency converter.",
    url: "https://calmatic.vercel.app/currency",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Currency Converter — Live Exchange Rates | Calmatic Suite",
    description: "Live exchange rates for 12+ currencies. Convert USD, EUR, GBP, JPY, and more. Free currency converter.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/currency",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
