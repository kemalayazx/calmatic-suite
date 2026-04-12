"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Home } from "lucide-react";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import dynamic from "next/dynamic";
import { LanguageProvider, useLanguage, type Locale } from "@/context/LanguageContext";
import { LOCALE_NAMES, LOCALE_FLAGS } from "@/i18n/translations";
import WelcomeModal from "@/components/WelcomeModal";

const RetroDesktop = dynamic(() => import("@/components/RetroDesktop"), { ssr: false });
const RetroBoot = dynamic(() => import("@/components/RetroBoot"), { ssr: false });

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
      {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const locales = Object.keys(LOCALE_NAMES) as Locale[];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Select language"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.375rem 0.625rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--border-color)",
          background: open ? "var(--bg-tertiary)" : "transparent",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: 600,
          transition: "all 0.15s",
          flexShrink: 0,
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-tertiary)"; }}
        onMouseOut={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        <span style={{ fontSize: "1rem" }}>{LOCALE_FLAGS[locale]}</span>
        <span style={{ textTransform: "uppercase" }}>{locale}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            padding: "0.5rem",
            zIndex: 200,
            minWidth: "160px",
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.45rem 0.625rem",
                borderRadius: "0.375rem",
                border: "none",
                background: l === locale ? "var(--bg-tertiary)" : "transparent",
                color: l === locale ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                textAlign: "left",
                transition: "all 0.1s",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-tertiary)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = l === locale ? "var(--bg-tertiary)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = l === locale ? "var(--text-primary)" : "var(--text-secondary)"; }}
            >
              <span style={{ fontSize: "1.1rem" }}>{LOCALE_FLAGS[l]}</span>
              <span>{LOCALE_NAMES[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { setTheme } = useTheme();
  const router = useRouter();
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <button
            onClick={() => {
              localStorage.removeItem("calmatic-retro-welcomed");
              setTheme("retro");
              router.push("/");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            title="Retro Mode"
          >
            <Home size={18} />
          </button>
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
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ThemeToggle />
          <LanguageSelector />

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
              {t("nav.allCalculators")}
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
                  position: "fixed",
                  top: "60px",
                  right: "1rem",
                  left: "1rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                  padding: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "1.5rem",
                  zIndex: 100,
                  maxHeight: "calc(100vh - 80px)",
                  overflowY: "auto",
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

function AppFooter() {
  const { t } = useLanguage();
  return (
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
        {t("footer.opensource")}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
        <Link href="/disclaimer" style={{ color: "var(--text-dim)", textDecoration: "underline", fontSize: "0.8rem" }}>
          {t("footer.disclaimer")}
        </Link>
        <span style={{ color: "var(--border-color)" }}>·</span>
        <span style={{ color: "var(--border-color)", fontSize: "0.8rem" }}>
          {t("footer.info")}
        </span>
      </div>
    </footer>
  );
}

const PATHNAME_TO_TITLE_KEY: Record<string, string> = {
  "/basic": "calc.basic.title",
  "/scientific": "calc.scientific.title",
  "/percentage": "calc.percentage.title",
  "/tip": "calc.tip.title",
  "/discount": "calc.discount.title",
  "/random": "calc.random.title",
  "/financial": "calc.financial.title",
  "/mortgage": "calc.mortgage.title",
  "/investment": "calc.investment.title",
  "/loans": "calc.loans.title",
  "/currency": "calc.currency.title",
  "/savings": "calc.savings.title",
  "/auto-loan": "calc.autoLoan.title",
  "/credit-card": "calc.creditCard.title",
  "/rent-buy": "calc.rentBuy.title",
  "/electricity": "calc.electricity.title",
  "/us-payroll": "calc.usPayroll.title",
  "/payroll": "calc.payroll.title",
  "/taxes": "calc.taxes.title",
  "/accounting": "calc.accounting.title",
  "/math": "calc.math.title",
  "/statistics": "calc.statistics.title",
  "/converter": "calc.converter.title",
  "/electronics": "calc.electronics.title",
  "/geometry": "calc.geometry.title",
  "/probability": "calc.probability.title",
  "/units": "calc.units.title",
  "/colors": "calc.colors.title",
  "/dates": "calc.dates.title",
  "/fuel": "calc.fuel.title",
  "/timezone": "calc.timezone.title",
  "/speed": "calc.speed.title",
  "/health": "calc.health.title",
  "/cooking": "calc.cooking.title",
  "/gpa": "calc.gpa.title",
  "/age": "calc.age.title",
  "/password": "calc.password.title",
  "/text": "calc.text.title",
  "/calories": "calc.calories.title",
};

function RetroCalcWindow({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [pos, setPos] = useState({ x: 60, y: 30 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const titleKey = PATHNAME_TO_TITLE_KEY[pathname ?? ""] ?? "calc.basic.title";
  const title = t(titleKey);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 120),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 60),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 20,
        width: "min(900px, calc(100vw - 20px))",
        maxHeight: "calc(100vh - 50px)",
        background: "#c0c0c0",
        border: "2px outset #fff",
        boxShadow: "3px 3px 0 #000",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        [data-retro-window] { background:#d4d0c8!important; color:#000!important; font-family:'Segoe UI',Tahoma,Arial,sans-serif!important; }
        [data-retro-window] [style*="rgb(9, 9, 11)"],
        [data-retro-window] [style*="rgb(24, 24, 27)"],
        [data-retro-window] [style*="rgb(39, 39, 42)"],
        [data-retro-window] [style*="rgb(28, 28, 28)"] { background:#c0c0c0!important; }
        [data-retro-window] [style*="color: rgb(250, 250, 250)"],
        [data-retro-window] [style*="color: rgb(255, 255, 255)"],
        [data-retro-window] [style*="color: rgb(248, 248, 248)"] { color:#000!important; }
        [data-retro-window] [style*="color: rgb(161, 161, 170)"],
        [data-retro-window] [style*="color: rgb(113, 113, 122)"],
        [data-retro-window] [style*="color: rgb(82, 82, 91)"] { color:#444!important; }
        [data-retro-window] h1,[data-retro-window] h2,[data-retro-window] h3 { color:#000080!important; }
        [data-retro-window] input,[data-retro-window] select,[data-retro-window] textarea { background:#fff!important; color:#000!important; border:2px inset #808080!important; border-radius:0!important; }
        [data-retro-window] th { background:#000080!important; color:#fff!important; }
        [data-retro-window] td { background:#fff!important; color:#000!important; border:1px solid #d0d0d0!important; }
        [data-retro-window] tr:nth-child(even) td { background:#f0f0f0!important; }
        [data-retro-window] p { color:#000!important; }
      `}</style>
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          color: "white",
          fontWeight: "bold",
          fontSize: "13px",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "28px",
          cursor: "move",
          userSelect: "none",
          flexShrink: 0,
        }}
        onMouseDown={(e) => {
          dragging.current = true;
          dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
      >
        <span>🧮 {title}</span>
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            title="Close"
            onClick={() => router.push("/")}
            style={{
              width: "16px",
              height: "14px",
              background: "#c0c0c0",
              border: "2px outset #fff",
              cursor: "pointer",
              fontSize: "9px",
              lineHeight: 1,
              padding: 0,
              fontFamily: "monospace",
              fontWeight: "bold",
              color: "#000",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            ✕
          </button>
        </div>
      </div>

      <div data-theme="light" data-retro-window style={{ overflowY: "auto", flex: 1, background: "#d4d0c8", color: "#000000" }}>
        {children}
      </div>
    </div>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    // Block right-click
    const blockCtx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", blockCtx);

    // Block Ctrl+U (view source) and Ctrl+S (save page)
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockCtx);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  const isRetroCalcPage =
    theme === "retro" &&
    pathname !== "/" &&
    pathname !== "/disclaimer" &&
    pathname != null;

  if (isRetroCalcPage) {
    return (
      <>
        <RetroBoot />
        <RetroDesktop />
        <RetroCalcWindow>{children}</RetroCalcWindow>
      </>
    );
  }

  return (
    <>
      {theme !== "retro" && <Navbar />}
      <RetroBoot />
      <RetroDesktop />
      <main
        style={{
          maxWidth: theme === "retro" ? "100%" : "1280px",
          margin: theme === "retro" ? "0" : "0 auto",
          padding: theme === "retro" ? "0" : "2rem 1.5rem",
          position: theme === "retro" ? "relative" : "static",
          zIndex: theme === "retro" ? 1 : "auto",
          paddingBottom: theme === "retro" ? "40px" : "0",
        }}
      >
        {children}
      </main>
      {theme !== "retro" && <AppFooter />}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WelcomeModal />
        <LayoutInner>{children}</LayoutInner>
      </LanguageProvider>
    </ThemeProvider>
  );
}
