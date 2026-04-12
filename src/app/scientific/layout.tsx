import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scientific Calculator — Trigonometry & Logarithms | Calmatic Suite",
  description: "Free online scientific calculator with trigonometry, logarithms, and mathematical constants. Sin, cos, tan, log, ln, and more.",
  keywords: ["scientific calculator","trigonometry calculator","logarithm calculator","sin cos tan","math constants"],
  openGraph: {
    title: "Scientific Calculator — Trigonometry & Logarithms | Calmatic Suite",
    description: "Free online scientific calculator with trigonometry, logarithms, and mathematical constants. Sin, cos, tan, log, ln, and more.",
    url: "https://calmatic.vercel.app/scientific",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scientific Calculator — Trigonometry & Logarithms | Calmatic Suite",
    description: "Free online scientific calculator with trigonometry, logarithms, and mathematical constants. Sin, cos, tan, log, ln, and more.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/scientific",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
