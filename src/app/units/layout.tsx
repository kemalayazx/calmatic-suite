import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter — Length, Weight & Temperature | Calmatic Suite",
  description: "Convert length, weight, temperature, area, and speed units. Free comprehensive unit converter.",
  keywords: ["unit converter","length converter","weight converter","temperature converter","speed converter","metric converter"],
  openGraph: {
    title: "Unit Converter — Length, Weight & Temperature | Calmatic Suite",
    description: "Convert length, weight, temperature, area, and speed units. Free comprehensive unit converter.",
    url: "https://calmatic.vercel.app/units",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unit Converter — Length, Weight & Temperature | Calmatic Suite",
    description: "Convert length, weight, temperature, area, and speed units. Free comprehensive unit converter.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/units",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
