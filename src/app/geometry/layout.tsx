import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geometry Calculator — Area, Volume & Perimeter | Calmatic Suite",
  description: "Calculate area, perimeter, volume, and surface area for 2D and 3D shapes. Free geometry calculator.",
  keywords: ["geometry calculator","area calculator","perimeter calculator","volume calculator","surface area calculator"],
  openGraph: {
    title: "Geometry Calculator — Area, Volume & Perimeter | Calmatic Suite",
    description: "Calculate area, perimeter, volume, and surface area for 2D and 3D shapes. Free geometry calculator.",
    url: "https://calmatic.vercel.app/geometry",
    siteName: "Calmatic Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Geometry Calculator — Area, Volume & Perimeter | Calmatic Suite",
    description: "Calculate area, perimeter, volume, and surface area for 2D and 3D shapes. Free geometry calculator.",
  },
  alternates: {
    canonical: "https://calmatic.vercel.app/geometry",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
