import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Number Base Converter — Binary, Hex & Octal | Calmatic Suite",
  description: "Convert between decimal, binary, hexadecimal, octal, and ASCII. Free number system converter.",
  keywords: ["number base converter","binary converter","hexadecimal converter","octal converter","ASCII converter"],
  openGraph: {
    title: "Number Base Converter — Binary, Hex & Octal | Calmatic Suite",
    description: "Convert between decimal, binary, hexadecimal, octal, and ASCII. Free number system converter.",
    url: "https://calmatic.vercel.app/converter",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Number Base Converter — Binary, Hex & Octal | Calmatic Suite",
    description: "Convert between decimal, binary, hexadecimal, octal, and ASCII. Free number system converter.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
