import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Math — Matrix, Equations & Calculus | Calmatic Suite",
  description: "Matrix operations, equation solver, derivatives, integrals, and complex numbers. Free advanced math calculator.",
  keywords: ["matrix calculator","equation solver","derivative calculator","integral calculator","complex numbers calculator"],
  openGraph: {
    title: "Advanced Math — Matrix, Equations & Calculus | Calmatic Suite",
    description: "Matrix operations, equation solver, derivatives, integrals, and complex numbers. Free advanced math calculator.",
    url: "https://calmatic.vercel.app/math",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Math — Matrix, Equations & Calculus | Calmatic Suite",
    description: "Matrix operations, equation solver, derivatives, integrals, and complex numbers. Free advanced math calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/math",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
