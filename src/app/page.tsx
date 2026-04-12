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
  Zap,
  Users,
  FileText,
  Brain,
  Palette,
  Heart,
  Coffee,
  BadgeDollarSign,
  Home,
  LineChart,
  Scale,
  Percent,
  ChefHat,
  Fuel,
  Atom,
  Shapes,
  Globe,
  Cake,
  PiggyBank,
  Car,
  CreditCard,
  Dice5,
  Shield,
  Building2,
  Lightbulb,
  Timer,
  Shuffle,
  Type,
} from "lucide-react";

const userPaths = [
  {
    icon: GraduationCap,
    label: "Student",
    description: "Math, statistics, number systems",
    links: ["/math", "/gpa", "/statistics", "/converter", "/percentage", "/scientific", "/geometry", "/probability"],
    color: "#7c3aed",
  },
  {
    icon: Briefcase,
    label: "Business / Accounting",
    description: "VAT, depreciation, payroll, financial planning",
    links: ["/accounting", "/financial", "/us-payroll", "/payroll", "/taxes", "/mortgage"],
    color: "#0891b2",
  },
  {
    icon: Code2,
    label: "Developer",
    description: "Binary, hex, octal, ASCII",
    links: ["/converter", "/colors", "/math", "/electronics", "/password", "/random", "/text"],
    color: "#059669",
  },
  {
    icon: Wallet,
    label: "Personal Finance",
    description: "Loans, interest, mortgage, investments",
    links: ["/financial", "/currency", "/mortgage", "/investment", "/loans", "/fuel", "/savings", "/auto-loan", "/credit-card", "/rent-buy", "/electricity"],
    color: "#d97706",
  },
  {
    icon: ShoppingCart,
    label: "Everyday Use",
    description: "Quick calculations, discounts, cooking, tips",
    links: ["/basic", "/discount", "/tip", "/health", "/cooking", "/percentage", "/dates", "/age", "/timezone", "/random", "/text", "/speed"],
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
  {
    href: "/electronics",
    icon: Zap,
    title: "Electronics",
    description: "Ohm's Law, resistor color code, LED resistor, RC/RL circuits, dB conversions.",
    color: "from-yellow-600 to-yellow-800",
    glow: "hover:shadow-yellow-900/40",
  },
  {
    href: "/payroll",
    icon: Users,
    title: "Payroll (Turkey)",
    description: "Gross/net salary, SGK, overtime, employer cost — 2025 parameters.",
    color: "from-cyan-600 to-cyan-800",
    glow: "hover:shadow-cyan-900/40",
  },
  {
    href: "/taxes",
    icon: FileText,
    title: "Tax Calculator",
    description: "VAT invoice breakdown, annual income tax brackets, withholding (stopaj).",
    color: "from-red-600 to-red-800",
    glow: "hover:shadow-red-900/40",
  },
  {
    href: "/math",
    icon: Brain,
    title: "Advanced Math",
    description: "Matrix ops, equation solver, derivative, integral (Simpson), permutations, complex numbers.",
    color: "from-purple-600 to-purple-800",
    glow: "hover:shadow-purple-900/40",
  },
  {
    href: "/colors",
    icon: Palette,
    title: "Color Converter",
    description: "HEX / RGB / HSL live sync, opacity slider, CSS output, complementary & triadic palettes.",
    color: "from-fuchsia-600 to-fuchsia-800",
    glow: "hover:shadow-fuchsia-900/40",
  },
  {
    href: "/health",
    icon: Heart,
    title: "Health",
    description: "BMI with visual gauge, BMR & daily calorie (Harris-Benedict), ideal weight (4 formulas).",
    color: "from-green-600 to-green-800",
    glow: "hover:shadow-green-900/40",
  },
  {
    href: "/tip",
    icon: Coffee,
    title: "Tip Calculator",
    description: "Bill split with preset tip pills, custom rate, per-person breakdown. ₺ $ € support.",
    color: "from-lime-600 to-lime-800",
    glow: "hover:shadow-lime-900/40",
  },
  {
    href: "/us-payroll",
    icon: BadgeDollarSign,
    title: "US Payroll",
    description: "Federal tax 2025 brackets, FICA, state tax for top 10 states, hourly ↔ salary.",
    color: "from-sky-600 to-sky-800",
    glow: "hover:shadow-sky-900/40",
  },
  {
    href: "/mortgage",
    icon: Home,
    title: "Mortgage",
    description: "Monthly payment, full amortization schedule, affordability (28/36 rule), refinance.",
    color: "from-stone-600 to-stone-800",
    glow: "hover:shadow-stone-900/40",
  },
  {
    href: "/investment",
    icon: LineChart,
    title: "Investment",
    description: "Compound growth chart, ROI/CAGR, retirement FIRE calculator, dollar-cost averaging.",
    color: "from-emerald-600 to-emerald-800",
    glow: "hover:shadow-emerald-900/40",
  },
  {
    href: "/loans",
    icon: Scale,
    title: "Loan Compare",
    description: "Side-by-side loan comparison with effective APR and total cost winner highlight.",
    color: "from-zinc-600 to-zinc-800",
    glow: "hover:shadow-zinc-900/40",
  },
  {
    href: "/percentage",
    icon: Percent,
    title: "Percentage",
    description: "What is X% of Y, percent change, margin vs markup calculator.",
    color: "from-violet-500 to-violet-700",
    glow: "hover:shadow-violet-900/40",
  },
  {
    href: "/cooking",
    icon: ChefHat,
    title: "Cooking",
    description: "Recipe scaler, cooking unit converter (cups, oz, °F), baking ratios.",
    color: "from-orange-500 to-orange-700",
    glow: "hover:shadow-orange-900/40",
  },
  {
    href: "/gpa",
    icon: GraduationCap,
    title: "GPA Calculator",
    description: "Weighted GPA by credits, 4 grading scales, cumulative GPA tracker.",
    color: "from-blue-500 to-blue-700",
    glow: "hover:shadow-blue-900/40",
  },
  {
    href: "/fuel",
    icon: Fuel,
    title: "Fuel Calculator",
    description: "Trip fuel cost, cost per person splitter, MPG ↔ L/100km converter.",
    color: "from-amber-500 to-amber-700",
    glow: "hover:shadow-amber-900/40",
  },
  {
    href: "/scientific",
    icon: Atom,
    title: "Scientific Calculator",
    description: "sin, cos, tan, log, ln, eˣ, factorial, memory, radians/degrees toggle.",
    color: "from-violet-500 to-violet-700",
    glow: "hover:shadow-violet-900/40",
  },
  {
    href: "/geometry",
    icon: Shapes,
    title: "Geometry",
    description: "2D areas & perimeters, 3D volumes & surface areas, Pythagorean theorem.",
    color: "from-sky-500 to-sky-700",
    glow: "hover:shadow-sky-900/40",
  },
  {
    href: "/timezone",
    icon: Globe,
    title: "Time Zone Converter",
    description: "Convert between 30 timezones, live world clock for 6 major cities.",
    color: "from-cyan-500 to-cyan-700",
    glow: "hover:shadow-cyan-900/40",
  },
  {
    href: "/age",
    icon: Cake,
    title: "Age Calculator",
    description: "Exact age in years/months/days, zodiac, Chinese zodiac, next birthday countdown.",
    color: "from-pink-500 to-pink-700",
    glow: "hover:shadow-pink-900/40",
  },
  {
    href: "/savings",
    icon: PiggyBank,
    title: "Savings Goal",
    description: "Savings goal planner, emergency fund tiers, CD/deposit calculator.",
    color: "from-green-500 to-green-700",
    glow: "hover:shadow-green-900/40",
  },
  {
    href: "/auto-loan",
    icon: Car,
    title: "Auto Loan",
    description: "Monthly payment, affordability, lease vs buy total cost comparison.",
    color: "from-slate-500 to-slate-700",
    glow: "hover:shadow-slate-900/40",
  },
  {
    href: "/credit-card",
    icon: CreditCard,
    title: "Credit Card Payoff",
    description: "Payoff timeline, minimum payment trap, balance transfer break-even.",
    color: "from-red-500 to-red-700",
    glow: "hover:shadow-red-900/40",
  },
  {
    href: "/probability",
    icon: Dice5,
    title: "Probability",
    description: "Basic probability, dice & coin simulations, binomial distribution chart.",
    color: "from-amber-500 to-amber-700",
    glow: "hover:shadow-amber-900/40",
  },
  {
    href: "/password",
    icon: Shield,
    title: "Password Generator",
    description: "Cryptographically secure passwords. Length slider, character toggles, strength meter.",
    color: "from-green-600 to-green-800",
    glow: "hover:shadow-green-900/40",
  },
  {
    href: "/rent-buy",
    icon: Building2,
    title: "Rent vs Buy",
    description: "Compare true cost of renting vs buying over time. Equity, opportunity cost, crossover analysis.",
    color: "from-stone-500 to-stone-700",
    glow: "hover:shadow-stone-900/40",
  },
  {
    href: "/electricity",
    icon: Lightbulb,
    title: "Electricity Cost",
    description: "Appliance cost calculator, solar savings payback, LED vs CFL vs incandescent comparison.",
    color: "from-yellow-500 to-yellow-700",
    glow: "hover:shadow-yellow-900/40",
  },
  {
    href: "/speed",
    icon: Timer,
    title: "Speed Calculator",
    description: "Speed / distance / time solver with unit conversion. Running pace and finish time predictor.",
    color: "from-blue-500 to-blue-700",
    glow: "hover:shadow-blue-900/40",
  },
  {
    href: "/random",
    icon: Shuffle,
    title: "Random Generator",
    description: "Secure random numbers, list shuffler, coin flip, and dice roller using crypto.getRandomValues.",
    color: "from-purple-500 to-purple-700",
    glow: "hover:shadow-purple-900/40",
  },
  {
    href: "/text",
    icon: Type,
    title: "Text Counter",
    description: "Word, character, sentence counter. Reading time, keyword density, and case converter.",
    color: "from-gray-500 to-gray-700",
    glow: "hover:shadow-gray-900/40",
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
          Thirty-eight powerful calculator modules in one place. Free, open-source, no ads.
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
