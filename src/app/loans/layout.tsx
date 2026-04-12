import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loan Comparison Calculator — Compare Up to 3 Loans | Calmatic Suite",
  description: "Compare up to 3 loans side by side to find the best deal. Free loan comparison calculator.",
  keywords: ["loan comparison calculator","compare loans","best loan calculator","loan side by side","personal loan calculator"],
  openGraph: {
    title: "Loan Comparison Calculator — Compare Up to 3 Loans | Calmatic Suite",
    description: "Compare up to 3 loans side by side to find the best deal. Free loan comparison calculator.",
    url: "https://calmatic.vercel.app/loans",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loan Comparison Calculator — Compare Up to 3 Loans | Calmatic Suite",
    description: "Compare up to 3 loans side by side to find the best deal. Free loan comparison calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/loans",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
