"use client";

import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  Receipt,
  Hash,
  BarChart2,
  DollarSign,
  GraduationCap,
  Briefcase,
  Code2,
  Wallet,
  ShoppingCart,
  Ruler,
  Calendar,
  Tag,
} from "lucide-react";

const userPaths = [
  {
    icon: GraduationCap,
    label: "Student",
    description: "Math, statistics, number systems",
    links: ["/basic", "/statistics", "/converter", "/units"],
    color: "#7c3aed",
  },
  {
    icon: Briefcase,
    label: "Business / Accounting",
    description: "VAT, depreciation, financial planning",
    links: ["/accounting", "/financial", "/currency"],
    color: "#0891b2",
  },
  {
    icon: Code2,
    label: "Developer",
    description: "Binary, hex, octal, ASCII",
    links: ["/converter", "/basic", "/statistics"],
    color: "#059669",
  },
  {
    icon: Wallet,
    label: "Personal Finance",
    description: "Loans, interest, currency exchange",
    links: ["/financial", "/currency", "/accounting"],
    color: "#d97706",
  },
  {
    icon: ShoppingCart,
    label: "Everyday Use",
    description: "Quick calculations, discounts, tips",
    links: ["/basic", "/accounting", "/currency", "/discount", "/dates"],
    color: "#db2777",
  },
];

const modules = [
  {
    href: "/basic",
    icon: Calculator,
    title: "Basic Calculator",
    description: "Standard arithmetic, square root, percentage, keyboard support.",
    color: "from-violet-600 to-violet-800",
    glow: "hover:shadow-violet-900/40",
  },
  {
    href: "/financial",
    icon: TrendingUp,
    title: "Financial",
    description: "Simple interest, compound interest, loan payment schedule.",
    color: "from-blue-600 to-blue-800",
    glow: "hover:shadow-blue-900/40",
  },
  {
    href: "/accounting",
    icon: Receipt,
    title: "Accounting",
    description: "VAT calculator with copy, depreciation straight-line & declining balance.",
    color: "from-emerald-600 to-emerald-800",
    glow: "hover:shadow-emerald-900/40",
  },
  {
    href: "/converter",
    icon: Hash,
    title: "Number Converter",
    description: "Dec / Bin / Hex / Oct conversions and ASCII ↔ binary translation.",
    color: "from-amber-600 to-amber-800",
    glow: "hover:shadow-amber-900/40",
  },
  {
    href: "/statistics",
    icon: BarChart2,
    title: "Statistics",
    description: "Mean, median, mode, std dev, variance + histogram chart.",
    color: "from-rose-600 to-rose-800",
    glow: "hover:shadow-rose-900/40",
  },
  {
    href: "/currency",
    icon: DollarSign,
    title: "Currency",
    description: "Live exchange rates via Frankfurter API. 12 major currencies.",
    color: "from-teal-600 to-teal-800",
    glow: "hover:shadow-teal-900/40",
  },
  {
    href: "/units",
    icon: Ruler,
    title: "Unit Converter",
    description: "Length, weight, temperature, area, speed — all in one place.",
    color: "from-indigo-600 to-indigo-800",
    glow: "hover:shadow-indigo-900/40",
  },
  {
    href: "/dates",
    icon: Calendar,
    title: "Date Calculator",
    description: "Date difference, add/subtract days, live countdown timer.",
    color: "from-pink-600 to-pink-800",
    glow: "hover:shadow-pink-900/40",
  },
  {
    href: "/discount",
    icon: Tag,
    title: "Discount Calculator",
    description: "Discount price, find discount %, and bulk product savings.",
    color: "from-orange-600 to-orange-800",
    glow: "hover:shadow-orange-900/40",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "4rem", paddingTop: "2rem" }}>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "1.25rem",
            background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Calmatic Suite
        </h1>
        <p style={{ fontSize: "1.125rem", color: "#71717a", maxWidth: "480px", margin: "0 auto" }}>
          Nine powerful calculator modules in one place. Free, open-source, no ads.
        </p>
      </div>

      {/* User Path Section */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{ textAlign: "center", color: "#52525b", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
          Jump to what you need
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.625rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {userPaths.map(({ icon: Icon, label, description, links, color }) => (
            <Link
              key={label}
              href={links[0]}
              style={{ textDecoration: "none" }}
              title={description}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "2rem",
                  border: `1px solid ${color}33`,
                  background: `${color}11`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontSize: "0.875rem",
                  color: "#d4d4d8",
                  fontWeight: 500,
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = `${color}22`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${color}66`;
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = `${color}11`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${color}33`;
                }}
              >
                <Icon size={15} color={color} />
                {label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {modules.map(({ href, icon: Icon, title, description, color, glow }) => (
          <Link
            key={href}
            href={href}
            style={{ textDecoration: "none" }}
          >
            <div
              className={`group transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${glow}`}
              style={{
                borderRadius: "1rem",
                border: "1px solid #27272a",
                background: "rgba(24,24,27,0.6)",
                backdropFilter: "blur(8px)",
                padding: "1.75rem",
                cursor: "pointer",
                height: "100%",
              }}
            >
              <div
                className={`bg-gradient-to-br ${color}`}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Icon size={22} color="white" />
              </div>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "#fafafa",
                  marginBottom: "0.5rem",
                }}
              >
                {title}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#71717a", lineHeight: 1.6 }}>
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
