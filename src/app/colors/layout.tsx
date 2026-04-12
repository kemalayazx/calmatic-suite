import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter — HEX, RGB & HSL | Calmatic Suite",
  description: "Convert between HEX, RGB, and HSL color formats with color palette suggestions. Free color converter tool.",
  keywords: ["color converter","HEX to RGB","RGB to HSL","color picker","color palette generator"],
  openGraph: {
    title: "Color Converter — HEX, RGB & HSL | Calmatic Suite",
    description: "Convert between HEX, RGB, and HSL color formats with color palette suggestions. Free color converter tool.",
    url: "https://calmatic.vercel.app/colors",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Converter — HEX, RGB & HSL | Calmatic Suite",
    description: "Convert between HEX, RGB, and HSL color formats with color palette suggestions. Free color converter tool.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/colors",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
