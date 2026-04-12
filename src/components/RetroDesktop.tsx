"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RetroRadio from "@/components/RetroRadio";
import RetroMinesweeper from "@/components/RetroMinesweeper";
import RetroNotepad from "@/components/RetroNotepad";
import RetroPaint from "@/components/RetroPaint";
import {
  Calculator, TrendingUp, Receipt, Hash, BarChart2, DollarSign,
  Ruler, Calendar, Tag, Zap, Users, FileText, Atom, Palette,
  Heart, Coffee, Home, LineChart, Scale, Percent, ChefHat,
  GraduationCap, Fuel, Shield, Shuffle, Type, Globe, Cake,
  PiggyBank, Car, CreditCard, Dice5, Building, Lightbulb, Timer, Apple,
  Volume2, Settings, LogOut, Monitor, Trash2, Radio,
} from "lucide-react";

// ── Win95 Folder SVG icon ─────────────────────────────────────────────────────
function Win95Folder({ size = 48 }: { size?: number }) {
  const h = Math.round(size * 0.8);
  return (
    <svg width={size} height={h} viewBox="0 0 48 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Drop shadow */}
      <rect x="3" y="13" width="44" height="24" fill="#808000" opacity="0.3"/>
      {/* Tab */}
      <path d="M1 11 L1 14 L16 14 L20 11 Z" fill="#FFD700" stroke="#8B6914" strokeWidth="1" strokeLinejoin="round"/>
      {/* Tab highlight */}
      <line x1="2" y1="12" x2="14" y2="12" stroke="#FFFF80" strokeWidth="1"/>
      {/* Folder body */}
      <rect x="1" y="13" width="44" height="23" fill="#FFD700" stroke="#8B6914" strokeWidth="1"/>
      {/* Top highlight */}
      <line x1="2" y1="14" x2="43" y2="14" stroke="#FFFF99" strokeWidth="1.5"/>
      {/* Left highlight */}
      <line x1="2" y1="14" x2="2" y2="34" stroke="#FFFF99" strokeWidth="1.5"/>
      {/* Bottom shadow */}
      <line x1="2" y1="35" x2="44" y2="35" stroke="#806000" strokeWidth="1.5"/>
      {/* Right shadow */}
      <line x1="44" y1="14" x2="44" y2="35" stroke="#806000" strokeWidth="1.5"/>
      {/* Inner document lines */}
      <line x1="9" y1="21" x2="39" y2="21" stroke="#C8A000" strokeWidth="1" opacity="0.7"/>
      <line x1="9" y1="26" x2="34" y2="26" stroke="#C8A000" strokeWidth="1" opacity="0.7"/>
      <line x1="9" y1="31" x2="30" y2="31" stroke="#C8A000" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type AppItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

interface FolderWindow {
  id: string;
  title: string;
  items: AppItem[];
  x: number;
  y: number;
  zIndex: number;
}

// ── Language data ─────────────────────────────────────────────────────────────

const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧", tr: "🇹🇷", de: "🇩🇪", fr: "🇫🇷", es: "🇪🇸",
  pt: "🇵🇹", it: "🇮🇹", nl: "🇳🇱", pl: "🇵🇱", ru: "🇷🇺",
  ar: "🇸🇦", ja: "🇯🇵", zh: "🇨🇳", ko: "🇰🇷", hi: "🇮🇳",
};

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English", tr: "Türkçe", de: "Deutsch", fr: "Français", es: "Español",
  pt: "Português", it: "Italiano", nl: "Nederlands", pl: "Polski", ru: "Русский",
  ar: "العربية", ja: "日本語", zh: "中文", ko: "한국어", hi: "हिंदी",
};

// ── Folder / desktop data ─────────────────────────────────────────────────────
// (FOLDERS and START_MENU_CATEGORIES are built inside the component via useMemo so labels can use t())

// ── useDrag hook ──────────────────────────────────────────────────────────────

function useDrag(initialX: number, initialY: number) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 120),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 80),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  return { pos, onMouseDown };
}

// ── FolderWindowComponent ─────────────────────────────────────────────────────

function FolderWindowComponent({
  win,
  onClose,
  onFocus,
}: {
  win: FolderWindow;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  const router = useRouter();
  const { pos, onMouseDown } = useDrag(win.x, win.y);

  return (
    <div
      className="retro-folder-window"
      style={{ left: pos.x, top: pos.y, zIndex: win.zIndex }}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* Title bar — drag handle */}
      <div
        className="retro-title-bar"
        onMouseDown={onMouseDown}
        style={{ cursor: "move" }}
      >
        <span>📂 {win.title}</span>
        <div className="retro-title-bar-buttons">
          <button
            className="retro-title-bar-btn"
            onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toolbar strip — decorative only, no inputs */}
      <div style={{
        padding: "3px 8px",
        borderBottom: "1px solid #808080",
        fontSize: "13px",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        background: "#c0c0c0",
        userSelect: "none",
      }}>
        File&nbsp;&nbsp;Edit&nbsp;&nbsp;View&nbsp;&nbsp;Help
      </div>

      {/* Content grid */}
      <div className="retro-folder-content">
        {win.items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="retro-folder-item"
              onClick={() => router.push(item.href)}
            >
              <Icon size={28} color="#000080" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div style={{
        padding: "3px 8px",
        fontSize: "12px",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        borderTop: "1px inset #c0c0c0",
        background: "#c0c0c0",
      }}>
        {win.items.length} object(s)
      </div>
    </div>
  );
}

// ── IE SVG icon ──────────────────────────────────────────────────────────────
function IEIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue "e" */}
      <circle cx="24" cy="24" r="18" fill="#0078D4" />
      <path d="M15 22h18c0-6-4-11-10-11s-10 5-10 11z" fill="#fff" />
      <path d="M15 26c0 6 4.5 11 10.5 11 5 0 9-3 10-7H26c-1 2-3 3-5 3-4 0-6-3-6-7z" fill="#fff" />
      <rect x="14" y="22" width="20" height="4" rx="1" fill="#0078D4" />
      {/* Orbit ring */}
      <ellipse cx="24" cy="24" rx="22" ry="8" stroke="#FFD700" strokeWidth="2.5" fill="none" transform="rotate(-30 24 24)" />
    </svg>
  );
}

// ── IEBrowserWindow ──────────────────────────────────────────────────────────
function IEBrowserWindow({
  zIndex,
  onClose,
  onFocus,
}: {
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
}) {
  const { pos, onMouseDown } = useDrag(40, 20);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex,
        width: "min(820px, calc(100vw - 40px))",
        height: "min(560px, calc(100vh - 80px))",
        background: "#c0c0c0",
        border: "2px outset #ffffff",
        boxShadow: "2px 2px 0 #000",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div className="retro-title-bar" onMouseDown={onMouseDown} style={{ cursor: "move" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <IEIcon size={16} /> Internet Explorer
        </span>
        <div className="retro-title-bar-buttons">
          <button className="retro-title-bar-btn" onClick={(e) => { e.stopPropagation(); }}>_</button>
          <button className="retro-title-bar-btn" onClick={(e) => { e.stopPropagation(); }}>□</button>
          <button className="retro-title-bar-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
        </div>
      </div>

      {/* Menu bar */}
      <div style={{
        display: "flex",
        gap: "2px",
        padding: "2px 6px",
        fontSize: "13px",
        borderBottom: "1px solid #808080",
      }}>
        {["File", "Edit", "View", "Favorites", "Tools", "Help"].map((m) => (
          <span key={m} style={{ padding: "1px 6px", cursor: "default" }}>{m}</span>
        ))}
      </div>

      {/* Toolbar with nav buttons + address bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "3px 6px",
        borderBottom: "1px solid #808080",
      }}>
        {["←", "→", "✕", "⟳", "🏠"].map((btn, i) => (
          <button key={i} style={{
            width: "24px", height: "22px",
            background: "#c0c0c0", border: "1px outset #c0c0c0",
            fontSize: "12px", cursor: "default", padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{btn}</button>
        ))}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginLeft: "6px",
        }}>
          <span style={{ fontSize: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>Address</span>
          <div style={{
            flex: 1,
            background: "#fff",
            border: "2px inset #808080",
            padding: "2px 4px",
            fontSize: "12px",
            color: "#000",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}>
            https://archive.org/details/@rohankar
          </div>
          <button style={{
            background: "#c0c0c0", border: "1px outset #c0c0c0",
            fontSize: "11px", padding: "2px 8px", cursor: "default",
          }}>Go</button>
        </div>
      </div>

      {/* Browser content — fake retro page */}
      <div style={{
        flex: 1, border: "2px inset #808080", margin: "2px 4px 4px",
        overflow: "auto", background: "#fff", padding: "20px",
        fontSize: "13px", color: "#000", fontFamily: "'Segoe UI', Tahoma, sans-serif",
      }}>
        {/* IE error style page */}
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
            <div style={{ fontSize: "32px", flexShrink: 0 }}>⚠️</div>
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: "16px", color: "#000080" }}>
                Internet Explorer cannot display the webpage
              </h2>
              <p style={{ margin: "0 0 12px", color: "#444", fontSize: "12px", lineHeight: "1.6" }}>
                Most likely causes:
              </p>
              <ul style={{ margin: "0 0 16px", paddingLeft: "20px", fontSize: "12px", lineHeight: "2", color: "#333" }}>
                <li>You are not connected to the Internet.</li>
                <li>The website is encountering problems.</li>
                <li>There might be a typing error in the address.</li>
                <li>This browser was manufactured in 1998.</li>
              </ul>
            </div>
          </div>

          <div style={{ border: "1px solid #ccc", padding: "12px", background: "#f5f5f0", marginBottom: "16px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "bold" }}>What you can try:</p>
            <p style={{ margin: "0", fontSize: "12px", lineHeight: "1.8" }}>
              <a
                href="https://archive.org/details/@rohankar"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0000ff", textDecoration: "underline", cursor: "pointer" }}
              >
                🔗 Open this page in a modern browser
              </a>
              <br />
              <span style={{ color: "#888" }}>
                (archive.org/details/@rohankar)
              </span>
            </p>
          </div>

          <div style={{ borderTop: "1px solid #ccc", paddingTop: "12px", fontSize: "11px", color: "#888", textAlign: "center" }}>
            <p style={{ margin: 0 }}>Internet Explorer 5.0 · Windows 95 · 16 MB RAM</p>
            <p style={{ margin: "4px 0 0", fontSize: "10px" }}>© 1998 Microsoft Corporation. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        fontSize: "12px", padding: "2px 8px",
        borderTop: "1px solid #808080", color: "#000",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span>Done</span>
        <div style={{ flex: 1 }} />
        <span>Internet</span>
      </div>
    </div>
  );
}

// ── RecycleBinWindow ──────────────────────────────────────────────────────────

function RecycleBinWindow({
  x,
  y,
  zIndex,
  onClose,
  onFocus,
}: {
  x: number;
  y: number;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
}) {
  const { pos, onMouseDown } = useDrag(x, y);

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex,
        width: "280px",
        background: "#c0c0c0",
        border: "2px outset #ffffff",
        boxShadow: "2px 2px 0 #000",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="retro-title-bar"
        onMouseDown={onMouseDown}
        style={{ cursor: "move" }}
      >
        <span>🗑️ Recycle Bin</span>
        <div className="retro-title-bar-buttons">
          <button
            className="retro-title-bar-btn"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: "20px 24px",
        textAlign: "center",
        fontSize: "13px",
        color: "#000",
        lineHeight: "1.7",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗑️</div>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>The Recycle Bin is empty.</div>
        <div style={{ color: "#444", fontSize: "12px" }}>No deleted calculations.</div>
      </div>

      {/* OK button */}
      <div style={{ padding: "8px 0 14px", textAlign: "center" }}>
        <button
          style={{
            padding: "4px 24px",
            background: "#c0c0c0",
            border: "2px outset #ffffff",
            fontFamily: "'Segoe UI', Tahoma, sans-serif",
            fontSize: "13px",
            cursor: "pointer",
            minWidth: "80px",
          }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

// ── TaskbarLanguageSelector ───────────────────────────────────────────────────

function TaskbarLanguageSelector() {
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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "13px",
          fontFamily: "'Segoe UI', Tahoma, sans-serif",
          color: "#000",
          padding: "0 4px",
        }}
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span style={{ textTransform: "uppercase" }}>{locale}</span>
      </button>
      {open && (
        <div
          className="retro-menu"
          style={{
            position: "absolute",
            bottom: "32px",
            right: 0,
            width: "200px",
            maxHeight: "320px",
            overflowY: "auto",
            zIndex: 99999,
          }}
        >
          {(Object.keys(LOCALE_NAMES) as Locale[]).map((l) => (
            <div
              key={l}
              className="retro-menu-item"
              onClick={() => { setLocale(l); setOpen(false); }}
            >
              <span>{LOCALE_FLAGS[l]}</span>
              <span style={{ flex: 1 }}>{LOCALE_NAMES[l]}</span>
              {l === locale && <span>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RetroDesktop() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [startOpen, setStartOpen] = useState(false);
  const [openStartSub, setOpenStartSub] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<FolderWindow[]>([]);
  const [maxZ, setMaxZ] = useState(10);
  const [time, setTime] = useState("");
  const [shutDown, setShutDown] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [recycleBinZ, setRecycleBinZ] = useState(11);
  const [showRadio, setShowRadio] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserZ, setBrowserZ] = useState(11);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [minesweeperZ, setMinesweeperZ] = useState(11);
  const [showNotepad, setShowNotepad] = useState(false);
  const [notepadZ, setNotepadZ] = useState(11);
  const [showPaint, setShowPaint] = useState(false);
  const [paintZ, setPaintZ] = useState(11);
  const startRef = useRef<HTMLDivElement>(null);
  const nextOffset = useRef(0);

  // ── Translatable folder/menu data
  const FOLDERS = useMemo(() => [
    {
      id: "finance",
      label: t("nav.finance"),
      items: [
        { label: "Mortgage", href: "/mortgage", icon: Home },
        { label: "Investment", href: "/investment", icon: LineChart },
        { label: "Savings", href: "/savings", icon: PiggyBank },
        { label: "Auto Loan", href: "/auto-loan", icon: Car },
        { label: "Credit Card", href: "/credit-card", icon: CreditCard },
        { label: "Loan Compare", href: "/loans", icon: Scale },
        { label: "Currency", href: "/currency", icon: DollarSign },
        { label: "Rent/Buy", href: "/rent-buy", icon: Building },
      ],
    },
    {
      id: "engineering",
      label: t("retro.engineering"),
      items: [
        { label: "Electronics", href: "/electronics", icon: Zap },
        { label: "Geometry", href: "/geometry", icon: Ruler },
        { label: "Advanced Math", href: "/math", icon: Calculator },
        { label: "Probability", href: "/probability", icon: Dice5 },
        { label: "Statistics", href: "/statistics", icon: BarChart2 },
      ],
    },
    {
      id: "tax",
      label: t("nav.taxPayroll"),
      items: [
        { label: "US Payroll", href: "/us-payroll", icon: Users },
        { label: "TR Payroll", href: "/payroll", icon: FileText },
        { label: "Tax Calculator", href: "/taxes", icon: Receipt },
        { label: "Accounting", href: "/accounting", icon: Receipt },
      ],
    },
    {
      id: "converters",
      label: t("nav.converters"),
      items: [
        { label: "Unit Converter", href: "/units", icon: Ruler },
        { label: "Number Base", href: "/converter", icon: Hash },
        { label: "Color Converter", href: "/colors", icon: Palette },
        { label: "Time Zone", href: "/timezone", icon: Globe },
        { label: "Speed", href: "/speed", icon: Timer },
        { label: "Fuel", href: "/fuel", icon: Fuel },
      ],
    },
    {
      id: "lifestyle",
      label: t("nav.lifestyle"),
      items: [
        { label: "Health & BMI", href: "/health", icon: Heart },
        { label: "Food Calories", href: "/calories", icon: Apple },
        { label: "Cooking", href: "/cooking", icon: ChefHat },
        { label: "GPA", href: "/gpa", icon: GraduationCap },
        { label: "Age", href: "/age", icon: Cake },
        { label: "Tip", href: "/tip", icon: Coffee },
        { label: "Discount", href: "/discount", icon: Tag },
      ],
    },
    {
      id: "games",
      label: t("retro.gamesTools"),
      items: [
        { label: "Random", href: "/random", icon: Shuffle },
        { label: "Password", href: "/password", icon: Shield },
        { label: "Text Counter", href: "/text", icon: Type },
      ],
    },
  ], [t]);

  const DIRECT_ICONS: AppItem[] = useMemo(() => [
    { label: "Calculator", href: "/basic", icon: Calculator },
    { label: "Scientific", href: "/scientific", icon: Atom },
    { label: "Date Calc", href: "/dates", icon: Calendar },
    { label: "Electricity", href: "/electricity", icon: Lightbulb },
  ], []);

  const MY_COMPUTER_ITEMS: AppItem[] = useMemo(() => [
    ...FOLDERS.flatMap(f => f.items),
    ...DIRECT_ICONS,
  ], [FOLDERS, DIRECT_ICONS]);

  const START_MENU_CATEGORIES = useMemo(() => [
    {
      title: "Calculators",
      items: [
        { label: "Basic Calculator", href: "/basic" },
        { label: "Scientific", href: "/scientific" },
        { label: "Percentage", href: "/percentage" },
      ],
    },
    {
      title: t("nav.finance"),
      items: FOLDERS[0].items.map((i) => ({ label: i.label, href: i.href })),
    },
    {
      title: t("nav.taxPayroll"),
      items: FOLDERS[2].items.map((i) => ({ label: i.label, href: i.href })),
    },
    {
      title: t("retro.engineering"),
      items: FOLDERS[1].items.map((i) => ({ label: i.label, href: i.href })),
    },
    {
      title: t("nav.converters"),
      items: FOLDERS[3].items.map((i) => ({ label: i.label, href: i.href })),
    },
    {
      title: t("nav.lifestyle"),
      items: FOLDERS[4].items.map((i) => ({ label: i.label, href: i.href })),
    },
    {
      title: t("retro.gamesTools"),
      items: FOLDERS[5].items.map((i) => ({ label: i.label, href: i.href })),
    },
  ], [t, FOLDERS]);

  // Clock — update every second
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close start menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false);
        setOpenStartSub(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Shut down — after 2s switch to dark theme
  useEffect(() => {
    if (!shutDown) return;
    const id = setTimeout(() => {
      setShutDown(false);
      setTheme("dark");
    }, 2000);
    return () => clearTimeout(id);
  }, [shutDown, setTheme]);

  if (theme !== "retro") return null;

  // ── Shut down screen
  if (shutDown) {
    return (
      <div className="retro-shutdown">
        <div>
          It is now safe to turn off<br />your computer.
        </div>
      </div>
    );
  }

  // ── Handlers

  function openFolder(folder: (typeof FOLDERS)[0]) {
    const existing = openFolders.find((w) => w.id === folder.id);
    if (existing) {
      bringToFront(folder.id);
      return;
    }
    const offset = 80 + nextOffset.current * 20;
    nextOffset.current = (nextOffset.current + 1) % 10;
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setOpenFolders((prev) => [
      ...prev,
      {
        id: folder.id,
        title: folder.label,
        items: folder.items,
        x: offset,
        y: offset,
        zIndex: newZ,
      },
    ]);
  }

  function openMyComputer() {
    const existing = openFolders.find((w) => w.id === "__mycomputer__");
    if (existing) {
      bringToFront("__mycomputer__");
      return;
    }
    const offset = 80 + nextOffset.current * 20;
    nextOffset.current = (nextOffset.current + 1) % 10;
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setOpenFolders((prev) => [
      ...prev,
      {
        id: "__mycomputer__",
        title: t("retro.myComputer"),
        items: MY_COMPUTER_ITEMS,
        x: offset,
        y: offset,
        zIndex: newZ,
      },
    ]);
  }

  function closeFolder(id: string) {
    setOpenFolders((prev) => prev.filter((w) => w.id !== id));
  }

  function bringToFront(id: string) {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setOpenFolders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w))
    );
  }

  function openRecycleBin() {
    const newZ = maxZ + 1;
    setMaxZ(newZ);
    setRecycleBinZ(newZ);
    setShowRecycleBin(true);
  }

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div
        className="retro-desktop-bg"
        style={{
          position: "fixed",
          inset: 0,
          bottom: "36px",
          zIndex: 0,
          overflow: "hidden",
        }}
        onClick={() => { setStartOpen(false); setOpenStartSub(null); }}
      >
        {/* Desktop icon grid — 2 columns, ordered layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 80px)",
            gridAutoRows: "84px",
            gap: "6px",
            padding: "16px",
            alignContent: "start",
          }}
        >
          {/* Row 1: My Computer | Finance */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openMyComputer(); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
              <Monitor size={36} color="#c0c0c0" strokeWidth={1.5} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("retro.myComputer")}</span>
          </div>

          {/* Finance folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[0]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("nav.finance")}</span>
          </div>

          {/* Engineering folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[1]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("retro.engineering")}</span>
          </div>

          {/* Tax & Payroll folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[2]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("nav.taxPayroll")}</span>
          </div>

          {/* Converters folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[3]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("nav.converters")}</span>
          </div>

          {/* Lifestyle folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[4]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("nav.lifestyle")}</span>
          </div>

          {/* Games & Tools folder */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openFolder(FOLDERS[5]); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <Win95Folder size={46} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("retro.gamesTools")}</span>
          </div>

          {/* Calculator direct icon */}
          <Link href="/basic" style={{ textDecoration: "none" }}>
            <div className="retro-desktop-icon" style={{ cursor: "pointer" }}>
              <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
                <Calculator size={28} color="#000080" />
              </div>
              <span style={{ wordBreak: "break-word" }}>Calculator</span>
            </div>
          </Link>

          {/* Scientific direct icon */}
          <Link href="/scientific" style={{ textDecoration: "none" }}>
            <div className="retro-desktop-icon" style={{ cursor: "pointer" }}>
              <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
                <Atom size={28} color="#000080" />
              </div>
              <span style={{ wordBreak: "break-word" }}>Scientific</span>
            </div>
          </Link>

          {/* Date Calc direct icon */}
          <Link href="/dates" style={{ textDecoration: "none" }}>
            <div className="retro-desktop-icon" style={{ cursor: "pointer" }}>
              <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
                <Calendar size={28} color="#000080" />
              </div>
              <span style={{ wordBreak: "break-word" }}>Date Calc</span>
            </div>
          </Link>

          {/* Electricity direct icon */}
          <Link href="/electricity" style={{ textDecoration: "none" }}>
            <div className="retro-desktop-icon" style={{ cursor: "pointer" }}>
              <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
                <Lightbulb size={28} color="#000080" />
              </div>
              <span style={{ wordBreak: "break-word" }}>Electricity</span>
            </div>
          </Link>

          {/* Minesweeper icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!showMinesweeper) {
                const newZ = maxZ + 1;
                setMaxZ(newZ);
                setMinesweeperZ(newZ);
              }
              setShowMinesweeper(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              💣
            </div>
            <span style={{ wordBreak: "break-word" }}>Minesweeper</span>
          </div>

          {/* Internet Explorer icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!showBrowser) {
                const newZ = maxZ + 1;
                setMaxZ(newZ);
                setBrowserZ(newZ);
              }
              setShowBrowser(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box">
              <IEIcon size={40} />
            </div>
            <span style={{ wordBreak: "break-word" }}>Internet Explorer</span>
          </div>

          {/* Radio icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); setShowRadio((v) => !v); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
              <Radio size={28} color="#000080" />
            </div>
            <span style={{ wordBreak: "break-word" }}>Radio</span>
          </div>

          {/* Notepad icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!showNotepad) {
                const newZ = maxZ + 1;
                setMaxZ(newZ);
                setNotepadZ(newZ);
              }
              setShowNotepad(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              📝
            </div>
            <span style={{ wordBreak: "break-word" }}>Notepad</span>
          </div>

          {/* Paint icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => {
              e.stopPropagation();
              if (!showPaint) {
                const newZ = maxZ + 1;
                setMaxZ(newZ);
                setPaintZ(newZ);
              }
              setShowPaint(true);
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🎨
            </div>
            <span style={{ wordBreak: "break-word" }}>Paint</span>
          </div>

          {/* Recycle Bin — last icon */}
          <div
            className="retro-desktop-icon"
            onClick={(e) => { e.stopPropagation(); openRecycleBin(); }}
            style={{ cursor: "pointer" }}
          >
            <div className="retro-icon-box" style={{ background: "#c0c0c0", border: "1px solid #808080" }}>
              <Trash2 size={32} color="#555" strokeWidth={1.5} />
            </div>
            <span style={{ wordBreak: "break-word" }}>{t("retro.recycleBin")}</span>
          </div>
        </div>

        {/* Folder windows */}
        {openFolders.map((win) => (
          <FolderWindowComponent
            key={win.id}
            win={win}
            onClose={closeFolder}
            onFocus={bringToFront}
          />
        ))}

        {/* Recycle Bin window */}
        {showRecycleBin && (
          <RecycleBinWindow
            x={200}
            y={150}
            zIndex={recycleBinZ}
            onClose={() => setShowRecycleBin(false)}
            onFocus={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setRecycleBinZ(newZ);
            }}
          />
        )}

        {/* IE Browser window */}
        {showBrowser && (
          <IEBrowserWindow
            zIndex={browserZ}
            onClose={() => setShowBrowser(false)}
            onFocus={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setBrowserZ(newZ);
            }}
          />
        )}

        {/* Minesweeper window */}
        {showMinesweeper && (
          <RetroMinesweeper
            zIndex={minesweeperZ}
            onClose={() => setShowMinesweeper(false)}
            onFocus={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setMinesweeperZ(newZ);
            }}
          />
        )}

        {/* Notepad window */}
        {showNotepad && (
          <RetroNotepad
            zIndex={notepadZ}
            onClose={() => setShowNotepad(false)}
            onFocus={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setNotepadZ(newZ);
            }}
          />
        )}

        {/* Paint window */}
        {showPaint && (
          <RetroPaint
            zIndex={paintZ}
            onClose={() => setShowPaint(false)}
            onFocus={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setPaintZ(newZ);
            }}
          />
        )}

        {/* Radio player */}
        {showRadio && (
          <RetroRadio onClose={() => setShowRadio(false)} initialZ={maxZ + 1} />
        )}

        {/* ── "Activate Windows" watermark ────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "16px",
            textAlign: "right",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", fontFamily: "'Segoe UI', Tahoma, sans-serif", marginBottom: "2px" }}>
            Windows&apos;u Etkinleştirin
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Segoe UI', Tahoma, sans-serif", marginBottom: "6px" }}>
            Windows&apos;u etkinleştirmek için Ayarlar&apos;a gidin.
          </div>
          <a
            href="https://www.youtube.com/@Dailytooshorts"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "12px",
              fontFamily: "'Segoe UI', Tahoma, sans-serif",
              textDecoration: "none",
              pointerEvents: "all",
              padding: "3px 7px",
              borderRadius: "2px",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.15)"; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,215,0,0.85)" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Kemal&apos;den sevgilerle</span>
          </a>
        </div>
      </div>

      {/* ── Taskbar ─────────────────────────────────────────────── */}
      <div className="retro-taskbar" ref={startRef}>
        {/* Start button */}
        <button
          className="retro-start-btn"
          onClick={(e) => { e.stopPropagation(); setStartOpen(!startOpen); setOpenStartSub(null); }}
        >
          <span style={{ fontSize: "14px" }}>🪟</span>
          <span>Start</span>
        </button>

        <div style={{ width: "1px", height: "22px", background: "#808080", margin: "0 2px" }} />

        {/* Open folder window buttons */}
        {openFolders.map((win) => (
          <button
            key={win.id}
            className="retro-taskbar-window-btn"
            onClick={() => bringToFront(win.id)}
          >
            📂 {win.title}
          </button>
        ))}

        {/* IE taskbar button */}
        {showBrowser && (
          <button
            className="retro-taskbar-window-btn"
            onClick={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setBrowserZ(newZ);
            }}
          >
            🌐 Internet Explorer
          </button>
        )}

        {/* Minesweeper taskbar button */}
        {showMinesweeper && (
          <button
            className="retro-taskbar-window-btn"
            onClick={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setMinesweeperZ(newZ);
            }}
          >
            💣 Minesweeper
          </button>
        )}

        {/* Notepad taskbar button */}
        {showNotepad && (
          <button
            className="retro-taskbar-window-btn"
            onClick={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setNotepadZ(newZ);
            }}
          >
            📝 Notepad
          </button>
        )}

        {/* Paint taskbar button */}
        {showPaint && (
          <button
            className="retro-taskbar-window-btn"
            onClick={() => {
              const newZ = maxZ + 1;
              setMaxZ(newZ);
              setPaintZ(newZ);
            }}
          >
            🎨 Paint
          </button>
        )}

        {/* Radio taskbar button — Radio manages its own z-index internally */}
        {showRadio && (
          <button
            className="retro-taskbar-window-btn"
          >
            ♪ Radio
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* System tray */}
        <div className="retro-systray">
          <TaskbarLanguageSelector />
          <Volume2 size={14} color="#000" />
          <span>{time}</span>
        </div>

        {/* Start Menu */}
        {startOpen && (
          <div
            className="retro-menu"
            style={{
              position: "absolute",
              bottom: "36px",
              left: "0",
              width: "280px",
              maxHeight: "480px",
              overflowY: "auto",
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left blue strip */}
            <div
              style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0, width: "26px",
                background: "linear-gradient(180deg, #000080, #1084d0)",
                display: "flex", alignItems: "flex-end",
                justifyContent: "center", paddingBottom: "8px",
              }}
            >
              <span style={{
                color: "white", fontWeight: "bold", fontSize: "12px",
                writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "2px",
              }}>
                Calmatic Suite
              </span>
            </div>

            {/* Menu items */}
            <div style={{ marginLeft: "26px" }}>
              {/* Programs header */}
              <div style={{
                padding: "6px 12px",
                fontWeight: "bold",
                fontSize: "13px",
                color: "#000080",
                background: "#d4d0c8",
                borderBottom: "1px solid #808080",
              }}>
                📁 Programs
              </div>

              {/* Category submenus — accordion style (click to expand) */}
              {START_MENU_CATEGORIES.map((cat) => (
                <div key={cat.title}>
                  <div
                    className={`retro-menu-category-header${openStartSub === cat.title ? " open" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStartSub(openStartSub === cat.title ? null : cat.title);
                    }}
                  >
                    <span>📁</span>
                    <span style={{ flex: 1 }}>{cat.title}</span>
                    <span style={{ fontSize: "11px" }}>
                      {openStartSub === cat.title ? "▾" : "▸"}
                    </span>
                  </div>

                  {openStartSub === cat.title && (
                    <div style={{ background: "#d4d0c8" }}>
                      {cat.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{ textDecoration: "none", color: "#000" }}
                        >
                          <div
                            className="retro-menu-item"
                            style={{ paddingLeft: "28px", fontSize: "12px", minHeight: "26px" }}
                            onClick={() => { setStartOpen(false); setOpenStartSub(null); }}
                          >
                            <span style={{ fontSize: "12px" }}>📄</span>
                            {item.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="retro-menu-divider" />

              {/* Disclaimer */}
              <Link href="/disclaimer" style={{ textDecoration: "none", color: "#000" }}>
                <div
                  className="retro-menu-item"
                  onClick={() => { setStartOpen(false); setOpenStartSub(null); }}
                >
                  <span>📄</span> Disclaimer
                </div>
              </Link>

              <div className="retro-menu-divider" />

              {/* Settings — switch theme */}
              <div
                className="retro-menu-item"
                onClick={() => { setTheme("dark"); setStartOpen(false); }}
              >
                <Settings size={14} /> {t("retro.switchTheme")}
              </div>

              {/* Shut Down */}
              <div
                className="retro-menu-item"
                onClick={() => { setStartOpen(false); setShutDown(true); }}
              >
                <LogOut size={14} /> {t("retro.shutDown")}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
