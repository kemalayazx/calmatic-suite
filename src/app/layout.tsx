import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Calmatic Suite",
  description: "All-in-one calculator suite — free forever",
};

const navLinks = [
  { href: "/basic", label: "Basic" },
  { href: "/financial", label: "Financial" },
  { href: "/accounting", label: "Accounting" },
  { href: "/converter", label: "Converter" },
  { href: "/statistics", label: "Statistics" },
  { href: "/currency", label: "Currency" },
  { href: "/units", label: "Units" },
  { href: "/dates", label: "Dates" },
  { href: "/discount", label: "Discount" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#09090b", color: "#fafafa" }}>
        <header
          style={{
            borderBottom: "1px solid #27272a",
            background: "rgba(9,9,11,0.85)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "0 1.5rem",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Calmatic Suite
              </span>
            </Link>
            <nav style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                    color: "#a1a1aa",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
          {children}
        </main>

        <footer
          style={{
            borderTop: "1px solid #27272a",
            textAlign: "center",
            padding: "1.5rem",
            color: "#52525b",
            fontSize: "0.875rem",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            Open Source · Free Forever · No Ads · No Data Collection
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <Link href="/disclaimer" style={{ color: "#52525b", textDecoration: "underline", fontSize: "0.8rem" }}>
              Disclaimer
            </Link>
            <span style={{ color: "#3f3f46" }}>·</span>
            <span style={{ color: "#3f3f46", fontSize: "0.8rem" }}>
              For informational use only — not professional advice
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
