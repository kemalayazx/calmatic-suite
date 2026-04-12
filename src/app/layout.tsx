"use client";

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const navCategories = [
  {
    title: "Basic",
    links: [
      { href: "/basic", label: "Calculator" },
      { href: "/scientific", label: "Scientific" },
      { href: "/percentage", label: "Percentage" },
      { href: "/tip", label: "Tip Calculator" },
      { href: "/discount", label: "Discount" },
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
    ],
  },
  {
    title: "Lifestyle",
    links: [
      { href: "/health", label: "Health & BMI" },
      { href: "/cooking", label: "Cooking" },
      { href: "/gpa", label: "GPA Calculator" },
      { href: "/age", label: "Age Calculator" },
    ],
  },
];

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
        borderBottom: "1px solid #27272a",
        background: "rgba(9,9,11,0.92)",
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

        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid #3f3f46",
              background: open ? "#27272a" : "transparent",
              color: "#fafafa",
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
              <path d="M2 5l5 5 5-5" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.75rem",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
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
                        color: "#a1a1aa",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        transition: "all 0.1s",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "#27272a";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#fafafa";
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "#a1a1aa";
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
      <body className="min-h-screen" style={{ background: "#09090b", color: "#fafafa" }}>
        <Navbar />

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
