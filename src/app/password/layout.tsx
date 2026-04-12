import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Password Generator — Secure Random Passwords",
  description: "Generate strong, secure random passwords. Customize length, characters, and complexity. Free online password generator.",
  keywords: ["password generator", "random password", "secure password", "strong password generator"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
