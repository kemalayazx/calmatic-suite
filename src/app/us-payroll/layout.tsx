import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "US Payroll Calculator — Federal & State Taxes | Calmatic Suite",
  description: "Calculate federal and state taxes, FICA, and net pay for all 50 US states. Free US payroll calculator.",
  keywords: ["US payroll calculator","federal tax calculator","state tax calculator","FICA calculator","net pay calculator","W-4 withholding"],
  openGraph: {
    title: "US Payroll Calculator — Federal & State Taxes | Calmatic Suite",
    description: "Calculate federal and state taxes, FICA, and net pay for all 50 US states. Free US payroll calculator.",
    url: "https://calmatic.vercel.app/us-payroll",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "US Payroll Calculator — Federal & State Taxes | Calmatic Suite",
    description: "Calculate federal and state taxes, FICA, and net pay for all 50 US states. Free US payroll calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/us-payroll",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
