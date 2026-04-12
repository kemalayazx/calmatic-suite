import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — Legal Information | Calmatic Suite",
  description: "Legal disclaimer and volunteer project information for Calmatic Suite calculator tools.",
  keywords: ["disclaimer","legal disclaimer","terms of use","calculator disclaimer","informational only"],
  openGraph: {
    title: "Disclaimer — Legal Information | Calmatic Suite",
    description: "Legal disclaimer and volunteer project information for Calmatic Suite calculator tools.",
    url: "https://calmatic.vercel.app/disclaimer",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer — Legal Information | Calmatic Suite",
    description: "Legal disclaimer and volunteer project information for Calmatic Suite calculator tools.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/disclaimer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
