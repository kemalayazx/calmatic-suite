import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Password Generator — Secure Random Passwords | Calmatic Suite",
  description: "Generate strong, secure random passwords. Customize length, characters, and complexity. Free online password generator.",
  keywords: ["password generator", "random password", "secure password", "strong password generator"],
  openGraph: {
    title: "Password Generator — Secure Random Passwords | Calmatic Suite",
    description: "Generate strong, secure random passwords. Customize length, characters, and complexity. Free online password generator.",
    url: `${SITE_URL}/password`,
  },
  twitter: {
    title: "Password Generator — Secure Random Passwords | Calmatic Suite",
    description: "Generate strong, secure random passwords. Customize length, characters, and complexity. Free online password generator.",
  },
  alternates: {
    canonical: `${SITE_URL}/password`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
