"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calculator, TrendingUp, Receipt, Hash, BarChart2, DollarSign,
  Ruler, Calendar, Tag, Zap, Users, FileText, Atom, Palette,
  Heart, Coffee, Home, LineChart, Scale, Percent, ChefHat,
  GraduationCap, Fuel, Shield, Shuffle, Type, Globe, Cake,
  PiggyBank, Car, CreditCard, Dice5, Building, Lightbulb, Timer, Apple,
  Folder, Volume2, Settings, LogOut,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type AppItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
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

const FOLDERS: Array<{ id: string; label: string; items: AppItem[] }> = [
  {
    id: "finance",
    label: "Finance",
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
    label: "Engineering",
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
    label: "Tax & Payroll",
    items: [
      { label: "US Payroll", href: "/us-payroll", icon: Users },
      { label: "TR Payroll", href: "/payroll", icon: FileText },
      { label: "Tax Calculator", href: "/taxes", icon: Receipt },
      { label: "Accounting", href: "/accounting", icon: Receipt },
    ],
  },
  {
    id: "converters",
    label: "Converters",
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
    label: "Lifestyle",
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
    label: "Games & Tools",
    items: [
      { label: "Random", href: "/random", icon: Shuffle },
      { label: "Password", href: "/password", icon: Shield },
      { label: "Text Counter", href: "/text", icon: Type },
    ],
  },
];

const DIRECT_ICONS: AppItem[] = [
  { label: "Calculator", href: "/basic", icon: Calculator },
  { label: "Scientific", href: "/scientific", icon: Atom },
  { label: "Date Calc", href: "/dates", icon: Calendar },
  { label: "Electricity", href: "/electricity", icon: Lightbulb },
];

// Start menu categories (flat representation for menu)
const START_MENU_CATEGORIES = [
  {
    title: "Calculators",
    items: [
      { label: "Basic Calculator", href: "/basic" },
      { label: "Scientific", href: "/scientific" },
      { label: "Percentage", href: "/percentage" },
    ],
  },
  {
    title: "Finance",
    items: FOLDERS[0].items.map((i) => ({ label: i.label, href: i.href })),
  },
  {
    title: "Tax & Payroll",
    items: FOLDERS[2].items.map((i) => ({ label: i.label, href: i.href })),
  },
  {
    title: "Science",
    items: FOLDERS[1].items.map((i) => ({ label: i.label, href: i.href })),
  },
  {
    title: "Converters",
    items: FOLDERS[3].items.map((i) => ({ label: i.label, href: i.href })),
  },
  {
    title: "Lifestyle",
    items: FOLDERS[4].items.map((i) => ({ label: i.label, href: i.href })),
  },
  {
    title: "Games & Tools",
    items: FOLDERS[5].items.map((i) => ({ label: i.label, href: i.href })),
  },
];

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
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
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

      {/* Toolbar strip */}
      <div style={{
        padding: "2px 4px",
        borderBottom: "1px solid #808080",
        fontSize: "11px",
        fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
        background: "#c0c0c0",
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
              <Icon size={24} color="#000080" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div style={{
        padding: "1px 4px",
        fontSize: "10px",
        fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
        borderTop: "1px inset #c0c0c0",
        background: "#c0c0c0",
      }}>
        {win.items.length} object(s)
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
          fontSize: "11px",
          fontFamily: "'MS Sans Serif', Tahoma, sans-serif",
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
            bottom: "28px",
            right: 0,
            width: "180px",
            maxHeight: "300px",
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
  const [startOpen, setStartOpen] = useState(false);
  const [openStartSub, setOpenStartSub] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<FolderWindow[]>([]);
  const [maxZ, setMaxZ] = useState(10);
  const [time, setTime] = useState("");
  const [shutDown, setShutDown] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const nextOffset = useRef(0);

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
      // bring to front
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

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          bottom: "32px",
          background: "#008080",
          zIndex: 0,
          overflow: "hidden",
        }}
        onClick={() => { setStartOpen(false); setOpenStartSub(null); }}
      >
        {/* Desktop icon column — folders first, then direct shortcuts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(1, 72px)",
            gridAutoRows: "80px",
            gap: "4px",
            padding: "16px",
            alignContent: "start",
          }}
        >
          {/* Folder icons */}
          {FOLDERS.map((folder) => (
            <div
              key={folder.id}
              className="retro-desktop-icon"
              onClick={(e) => { e.stopPropagation(); openFolder(folder); }}
            >
              <div style={{
                width: "32px", height: "32px", margin: "0 auto 4px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Folder size={28} color="#ffcc00" />
              </div>
              <span style={{ fontSize: "10px", wordBreak: "break-word", lineHeight: 1.2 }}>
                {folder.label}
              </span>
            </div>
          ))}

          {/* Direct shortcut icons */}
          {DIRECT_ICONS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="retro-desktop-icon">
                <div style={{
                  width: "32px", height: "32px", margin: "0 auto 4px",
                  background: "#c0c0c0", border: "1px solid #808080",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} color="#000080" />
                </div>
                <span style={{ fontSize: "10px", wordBreak: "break-word", lineHeight: 1.2 }}>
                  {label}
                </span>
              </div>
            </Link>
          ))}
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

        <div style={{ width: "1px", height: "20px", background: "#808080", margin: "0 2px" }} />

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
              bottom: "32px",
              left: "0",
              width: "260px",
              maxHeight: "420px",
              overflowY: "auto",
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left blue strip */}
            <div
              style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0, width: "24px",
                background: "linear-gradient(180deg, #000080, #1084d0)",
                display: "flex", alignItems: "flex-end",
                justifyContent: "center", paddingBottom: "8px",
              }}
            >
              <span style={{
                color: "white", fontWeight: "bold", fontSize: "11px",
                writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "2px",
              }}>
                Calmatic Suite
              </span>
            </div>

            {/* Menu items */}
            <div style={{ marginLeft: "24px" }}>
              {/* Programs submenu header */}
              <div style={{
                padding: "4px 8px",
                fontWeight: "bold",
                fontSize: "11px",
                color: "#000080",
                background: "#d4d0c8",
                borderBottom: "1px solid #808080",
              }}>
                📁 Programs ▶
              </div>

              {/* Category submenus */}
              {START_MENU_CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setOpenStartSub(cat.title)}
                  onMouseLeave={() => setOpenStartSub(null)}
                >
                  <div className="retro-menu-item" style={{ justifyContent: "space-between" }}>
                    <span>📁 {cat.title}</span>
                    <span>▶</span>
                  </div>

                  {/* Flyout submenu */}
                  {openStartSub === cat.title && (
                    <div
                      className="retro-menu"
                      style={{
                        position: "absolute",
                        left: "100%",
                        top: 0,
                        width: "200px",
                        zIndex: 100000,
                      }}
                    >
                      {cat.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{ textDecoration: "none", color: "#000" }}
                        >
                          <div
                            className="retro-menu-item"
                            onClick={() => { setStartOpen(false); setOpenStartSub(null); }}
                          >
                            <span style={{ fontSize: "11px" }}>📄</span>
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

              {/* Settings — switch theme */}
              <div
                className="retro-menu-item"
                onClick={() => { setTheme("dark"); setStartOpen(false); }}
              >
                <Settings size={12} /> Switch to Modern
              </div>

              <div className="retro-menu-divider" />

              {/* Shut Down */}
              <div
                className="retro-menu-item"
                onClick={() => { setStartOpen(false); setShutDown(true); }}
              >
                <LogOut size={12} /> Shut Down...
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
