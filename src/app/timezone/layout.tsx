import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Zone Converter — 30+ World Time Zones | Calmatic Suite",
  description: "Convert times between 30+ time zones worldwide. Free online time zone converter.",
  keywords: ["time zone converter","world clock","UTC converter","EST PST converter","international time zones"],
  openGraph: {
    title: "Time Zone Converter — 30+ World Time Zones | Calmatic Suite",
    description: "Convert times between 30+ time zones worldwide. Free online time zone converter.",
    url: "https://calmatic.webzip.studio/timezone",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Zone Converter — 30+ World Time Zones | Calmatic Suite",
    description: "Convert times between 30+ time zones worldwide. Free online time zone converter.",
  },
  alternates: {
    canonical: "https://calmatic.webzip.studio/timezone",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
