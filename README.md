# Calmatic Suite

**The all-in-one, free, open-source calculator toolkit for everyone.**

[Live Demo](https://calmatic.vercel.app) · [Report Bug](https://github.com/kemalayazx/calmatic-suite/issues) · [Request Feature](https://github.com/kemalayazx/calmatic-suite/issues)

---

## About

Calmatic Suite is a comprehensive web-based calculator platform featuring **39+ calculator modules** across finance, mathematics, science, health, and everyday life. Built with modern web technologies, it's designed to be fast, accessible, and completely free — no ads, no sign-ups, no data collection.

Whether you're a student solving equations, a professional calculating mortgage payments, or a developer converting color codes — Calmatic Suite has a tool for you.

### Key Features

- **39+ Calculator Modules** — From basic arithmetic to advanced matrix operations
- **Zero Cost** — Free forever, no ads, no subscriptions
- **No Data Collection** — Your calculations stay in your browser
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Keyboard Support** — Full keyboard shortcuts for calculators
- **Dark & Light Mode** — System-aware with manual toggle
- **PWA Ready** — Install as a native app on any device
- **SEO Optimized** — Individual meta tags for each calculator
- **Open Source** — MIT Licensed, contributions welcome

---

## Calculator Modules

### Basic & Everyday
| Module | Description |
|--------|-------------|
| **Basic Calculator** | Standard arithmetic with keyboard support |
| **Scientific Calculator** | Trigonometry, logarithms, constants, memory |
| **Percentage** | X% of Y, percent change, margin vs markup |
| **Tip Calculator** | Bill splitting with customizable tip rates |
| **Discount Calculator** | Price discounts, bulk savings |
| **Random Generator** | Cryptographic random numbers, dice, coins |
| **Text Counter** | Word count, reading time, keyword density |
| **Password Generator** | Secure passwords with strength meter |

### Finance
| Module | Description |
|--------|-------------|
| **Financial Calculator** | Simple/compound interest, loan payments |
| **Mortgage Calculator** | Monthly payment, amortization, affordability, refinance |
| **Investment Calculator** | Compound growth, ROI, FIRE retirement, DCA |
| **Loan Comparison** | Side-by-side loan comparison (up to 3) |
| **Auto Loan** | Payment, affordability, lease vs buy |
| **Credit Card Payoff** | Payoff timeline, minimum payment trap, balance transfer |
| **Savings Goal** | Savings planner, emergency fund, CD calculator |
| **Currency Converter** | Live rates for 12+ currencies |
| **Rent vs Buy** | True cost comparison with equity analysis |

### Tax & Payroll
| Module | Description |
|--------|-------------|
| **US Payroll** | 2025 federal brackets, FICA, 10 state taxes |
| **TR Payroll** | Turkish SGK, income tax, overtime (2025) |
| **Tax Calculator** | Invoice breakdown, income tax, withholding |
| **Accounting Tools** | VAT/KDV, depreciation, profit-loss |

### Science & Math
| Module | Description |
|--------|-------------|
| **Advanced Math** | Matrix ops, equation solver, derivatives, integrals |
| **Statistics** | Mean, median, mode, std dev, histogram |
| **Probability** | Basic probability, binomial distribution |
| **Geometry** | 2D & 3D shapes, Pythagorean theorem |
| **Electronics** | Ohm's law, resistor codes, LED, RC/RL, dB |

### Converters
| Module | Description |
|--------|-------------|
| **Number Base** | Decimal, binary, hex, octal, ASCII |
| **Unit Converter** | Length, weight, temperature, area, speed |
| **Color Converter** | HEX/RGB/HSL with palette suggestions |
| **Time Zone** | 30+ zones, live world clock |
| **Date Calculator** | Date difference, add/subtract, countdown |
| **Fuel Calculator** | Trip cost, splitter, MPG ↔ L/100km |
| **Speed Calculator** | Speed/distance/time, running pace |

### Lifestyle
| Module | Description |
|--------|-------------|
| **Health & BMI** | BMI gauge, BMR/TDEE, ideal weight |
| **Food Calories** | 80+ food database, meal planner, macros |
| **Cooking** | Recipe scaler, unit converter, baking ratios |
| **GPA Calculator** | US/UK/international scales, cumulative |
| **Age Calculator** | Exact age, zodiac, birthday countdown |
| **Electricity Cost** | Appliance cost, solar savings, bulb comparison |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://typescriptlang.org/) | Type-safe calculations |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [mathjs](https://mathjs.org/) | Advanced math operations |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Frankfurter API](https://frankfurter.app/) | Currency exchange rates |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kemalayazx/calmatic-suite.git

# Navigate to the project
cd calmatic-suite

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
calmatic-suite/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── basic/              # Basic Calculator
│   │   ├── mortgage/           # Mortgage Calculator
│   │   ├── us-payroll/         # US Payroll Calculator
│   │   ├── ... (39 modules)
│   │   ├── layout.tsx          # Root layout with navbar
│   │   ├── page.tsx            # Homepage with module grid
│   │   ├── sitemap.ts          # Auto-generated sitemap
│   │   └── robots.ts           # SEO robots config
│   ├── components/ui/          # Shared UI components
│   ├── context/                # Theme context (dark/light)
│   └── lib/calculations/       # Pure calculation functions
│       ├── basic.ts
│       ├── financial.ts
│       ├── mortgage.ts
│       ├── us-payroll.ts
│       └── ... (35 modules)
├── public/
│   └── manifest.json           # PWA manifest
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Architecture

### Separation of Concerns

All calculation logic is isolated in `src/lib/calculations/` as pure TypeScript functions. UI components in `src/app/` handle only rendering and user interaction. This makes calculations:

- **Testable** — Pure functions with typed inputs/outputs
- **Reusable** — Can be used in CLI tools, APIs, or other frontends
- **Auditable** — Easy to verify formulas independently

### No Backend Required

Calmatic Suite is a fully static site. All calculations run client-side in the browser. The only external API call is to [Frankfurter](https://frankfurter.app/) for live currency rates.

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-calculator`)
3. **Commit** your changes (`git commit -m 'Add: new calculator module'`)
4. **Push** to the branch (`git push origin feature/new-calculator`)
5. **Open** a Pull Request

### Adding a New Calculator

1. Create `src/app/[name]/page.tsx` ("use client")
2. Create `src/lib/calculations/[name].ts` (pure functions)
3. Create `src/app/[name]/layout.tsx` (SEO metadata)
4. Add to navbar categories in `layout.tsx`
5. Add card to homepage `page.tsx`
6. Add route to `sitemap.ts`
7. Run `npm run build` to verify

---

## Disclaimer

Calmatic Suite is a **volunteer-driven, open-source project** provided for **informational and educational purposes only**. The creators accept no responsibility or liability for any errors in calculations or decisions made based on results. Always consult a qualified professional for financial, legal, or medical decisions. See [Disclaimer](/disclaimer) for full details.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [mathjs](https://mathjs.org/) for advanced mathematical operations
- [Frankfurter API](https://frankfurter.app/) for free currency exchange rates
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vercel](https://vercel.com/) for hosting

---

Made with love by [kemalayazx](https://github.com/kemalayazx)
