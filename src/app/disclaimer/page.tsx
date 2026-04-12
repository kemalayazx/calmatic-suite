"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, Heart, Code } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontWeight: 700, color: "#fafafa", fontSize: "1rem", marginBottom: "0.5rem" }}>
        {title}
      </h2>
      <p>{children}</p>
    </div>
  );
}

export default function DisclaimerPage() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#fafafa" }}>{t("disclaimer.title")}</h1>
      </div>

      {/* Warning Card */}
      <div
        style={{
          borderRadius: "1rem",
          border: "1px solid #451a03",
          background: "rgba(120,53,15,0.15)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ fontWeight: 700, color: "#fbbf24", marginBottom: "0.5rem", fontSize: "1rem" }}>
            {t("disclaimer.warning.title")}
          </p>
          <p style={{ color: "#d97706", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {t("disclaimer.warning.body")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          borderRadius: "1rem",
          border: "1px solid #27272a",
          background: "rgba(24,24,27,0.6)",
          padding: "2rem",
          marginBottom: "1.5rem",
          lineHeight: 1.8,
          color: "#a1a1aa",
          fontSize: "0.9375rem",
        }}
      >
        <Section title={t("disclaimer.section.noLiability.title")}>
          {t("disclaimer.section.noLiability.body")}
        </Section>

        <Section title={t("disclaimer.section.noWarranty.title")}>
          {t("disclaimer.section.noWarranty.body")}
        </Section>

        <Section title={t("disclaimer.section.financial.title")}>
          {t("disclaimer.section.financial.body")}
        </Section>

        <Section title={t("disclaimer.section.currency.title")}>
          {t("disclaimer.section.currency.body")}
        </Section>

        <Section title={t("disclaimer.section.changes.title")}>
          {t("disclaimer.section.changes.body")}
        </Section>
      </div>

      {/* Volunteer Banner */}
      <div
        style={{
          borderRadius: "1rem",
          border: "1px solid #27272a",
          background: "rgba(124,58,237,0.08)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <Heart size={22} color="#a78bfa" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontWeight: 700, color: "#a78bfa", marginBottom: "0.4rem" }}>
              {t("disclaimer.volunteer.title")}
            </p>
            <p style={{ color: "#71717a", lineHeight: 1.7, fontSize: "0.9rem" }}>
              {t("disclaimer.volunteer.body")}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <Code size={22} color="#a78bfa" style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ color: "#71717a", lineHeight: 1.7, fontSize: "0.9rem" }}>
            {t("disclaimer.volunteer.openSource")}
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.8rem" }}>
        {t("disclaimer.footer")}
      </p>
    </div>
  );
}
