import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TR Payroll Calculator — SGK & Net Salary | Calmatic Suite",
  description: "Calculate Turkish payroll taxes, SGK deductions, and net salary. Free Turkey payroll calculator.",
  keywords: ["Turkey payroll calculator","SGK calculator","Turkish net salary","maaş hesaplama","Türkiye vergi hesaplama"],
  openGraph: {
    title: "TR Payroll Calculator — SGK & Net Salary | Calmatic Suite",
    description: "Calculate Turkish payroll taxes, SGK deductions, and net salary. Free Turkey payroll calculator.",
    url: "https://calmatic.vercel.app/payroll",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TR Payroll Calculator — SGK & Net Salary | Calmatic Suite",
    description: "Calculate Turkish payroll taxes, SGK deductions, and net salary. Free Turkey payroll calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/payroll",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
