import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPA Calculator — US, UK & International Grading | Calmatic Suite",
  description: "Calculate GPA with US, UK, and international grading scales. Free GPA calculator for students.",
  keywords: ["GPA calculator","grade point average","US GPA calculator","UK grade converter","international grading scale"],
  openGraph: {
    title: "GPA Calculator — US, UK & International Grading | Calmatic Suite",
    description: "Calculate GPA with US, UK, and international grading scales. Free GPA calculator for students.",
    url: "https://calmatic.vercel.app/gpa",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GPA Calculator — US, UK & International Grading | Calmatic Suite",
    description: "Calculate GPA with US, UK, and international grading scales. Free GPA calculator for students.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/gpa",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
