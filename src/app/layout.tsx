"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

const navCategories = [
  {
    title: "Basic",
    links: [
      { href: "/basic", label: "Calculator" },
      { href: "/scientific", label: "Scientific" },
      { href: "/percentage", label: "Percentage" },
      { href: "/tip", label: "Tip Calculator" },
      { href: "/discount", label: "Discount" },
      { href: "/random", label: "Random Generator" },
    ],
  },
  {
    title: "Finance",
    links: [
      { href: "/financial", label: "Interest & Loans" },
      { href: "/mortgage", label: "Mortgage" },
      { href: "/investment", label: "Investment" },
      { href: "/loans", label: "Loan Compare" },
      { href: "/currency", label: "Currency" },
      { href: "/savings", label: "Savings Goal" },
      { href: "/auto-loan", label: "Auto Loan" },
      { href: "/credit-card", label: "Credit Card Payoff" },
      { href: "/rent-buy", label: "Rent vs Buy" },
      { href: "/electricity", label: "Electricity Cost" },
    ],
  },
  {
    title: "Tax & Payroll",
    links: [
      { href: "/us-payroll", label: "US Payroll" },
      { href: "/payroll", label: "TR Payroll" },
      { href: "/taxes", label: "Tax Calculator" },
      { href: "/accounting", label: "Accounting" },
    ],
  },
  {
    title: "Science & Math",
    links: [
      { href: "/math", label: "Advanced Math" },
      { href: "/statistics", label: "Statistics" },
      { href: "/converter", label: "Number Systems" },
      { href: "/electronics", label: "Electronics" },
      { href: "/geometry", label: "Geometry" },
      { href: "/probability", label: "Probability" },
    ],
  },
  {
    title: "Converters",
    links: [
      { href: "/units", label: "Unit Converter" },
      { href: "/colors", label: "Color Converter" },
      { href: "/dates", label: "Date Calculator" },
      { href: "/fuel", label: "Fuel Calculator" },
      { href: "/timezone", label: "Time Zone" },
      { href: "/speed", label: "Speed Calculator" },
    ],
  },
  {
    title: "Lifestyle",
    links: [
      { href: "/health", label: "Health & BMI" },
      { href: "/cooking", label: "Cooking" },
      { href: "/gpa", label: "GPA Calculator" },
      { href: "/age", label: "Age Calculator" },
      { href: "/password", label: "Password Gen" },
      { href: "/text", label: "Text Counter" },
      { href: "/calories", label: "Food Calories" },
    ],
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "0.5rem",
        border: "1px solid var(--border-color)",
        background: "transparent",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-tertiary)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-color)",
        background: "var(--header-bg)",
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ThemeToggle />

          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                background: open ? "var(--bg-tertiary)" : "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              All Calculators
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
              >
                <path d="M2 5l5 5 5-5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                  padding: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 200px)",
                  gap: "1.5rem",
                  zIndex: 100,
                  minWidth: "640px",
                }}
              >
                {navCategories.map((cat) => (
                  <div key={cat.title}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#7c3aed",
                        fontWeight: 700,
                        marginBottom: "0.625rem",
                      }}
                    >
                      {cat.title}
                    </div>
                    {cat.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "block",
                          padding: "0.3rem 0.5rem",
                          borderRadius: "0.375rem",
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                          transition: "all 0.1s",
                        }}
                        onMouseOver={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-tertiary)";
                          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Calmatic Suite — Free Online Calculator Tools</title>
        <meta name="description" content="30+ free online calculators: mortgage, payroll, scientific, statistics, unit converter, GPA, investment, and more. No ads, no sign-up, open source." />
        <meta name="keywords" content="online calculator, free calculator, mortgage calculator, scientific calculator, payroll calculator, GPA calculator, unit converter, investment calculator, compound interest, tax calculator, BMI calculator, statistics calculator, currency converter, loan calculator, percentage calculator, geometry calculator" />
        <meta name="author" content="Calmatic Suite Contributors" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://calmatic.vercel.app" />
        <meta property="og:site_name" content="Calmatic Suite" />
        <meta property="og:title" content="Calmatic Suite — Free Online Calculator Tools" />
        <meta property="og:description" content="30+ free online calculators for finance, math, science, and everyday life." />
        <meta property="og:image" content="https://calmatic.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Calmatic Suite" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Calmatic Suite — Free Online Calculator Tools" />
        <meta name="twitter:description" content="30+ free calculators. No ads, no sign-up." />
        <meta name="twitter:image" content="https://calmatic.vercel.app/og-image.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="canonical" href="https://calmatic.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Calmatic Suite",
              "description": "30+ free online calculator tools for finance, math, science, and everyday life",
              "url": "https://calmatic.vercel.app",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Calmatic Suite Contributors"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ThemeProvider>
          <Navbar />

          <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
            {children}
          </main>

          <footer
            style={{
              borderTop: "1px solid var(--border-color)",
              textAlign: "center",
              padding: "1.5rem",
              color: "var(--text-dim)",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              Open Source · Free Forever · No Ads · No Data Collection
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <Link href="/disclaimer" style={{ color: "var(--text-dim)", textDecoration: "underline", fontSize: "0.8rem" }}>
                Disclaimer
              </Link>
              <span style={{ color: "var(--border-color)" }}>·</span>
              <span style={{ color: "var(--border-color)", fontSize: "0.8rem" }}>
                For informational use only — not professional advice
              </span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
