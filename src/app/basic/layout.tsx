import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Calculator — Free Online Calculator | Calmatic Suite",
  description: "Free online basic calculator with keyboard support. Addition, subtraction, multiplication, division, square root, and percentage.",
  keywords: ["basic calculator","online calculator","free calculator","math calculator","arithmetic calculator"],
  openGraph: {
    title: "Basic Calculator — Free Online Calculator | Calmatic Suite",
    description: "Free online basic calculator with keyboard support. Addition, subtraction, multiplication, division, square root, and percentage.",
    url: "https://calmatic.vercel.app/basic",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basic Calculator — Free Online Calculator | Calmatic Suite",
    description: "Free online basic calculator with keyboard support. Addition, subtraction, multiplication, division, square root, and percentage.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/basic",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
