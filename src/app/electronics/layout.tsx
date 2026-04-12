import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electronics Calculator — Ohm's Law & LED Calculator | Calmatic Suite",
  description: "Ohm's law calculator, resistor color codes, LED forward voltage, RC circuits. Free electronics calculator.",
  keywords: ["electronics calculator","ohm law calculator","resistor calculator","LED calculator","RC circuit calculator"],
  openGraph: {
    title: "Electronics Calculator — Ohm's Law & LED Calculator | Calmatic Suite",
    description: "Ohm's law calculator, resistor color codes, LED forward voltage, RC circuits. Free electronics calculator.",
    url: "https://calmatic.webzip.studio/electronics",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electronics Calculator — Ohm's Law & LED Calculator | Calmatic Suite",
    description: "Ohm's law calculator, resistor color codes, LED forward voltage, RC circuits. Free electronics calculator.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/electronics",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
