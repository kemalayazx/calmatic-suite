import Link from "next/link";
import { ArrowLeft, AlertTriangle, Heart, Code } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <Link href="/" style={{ color: "#71717a", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#fafafa" }}>Disclaimer</h1>
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
            Informational Use Only
          </p>
          <p style={{ color: "#d97706", lineHeight: 1.7, fontSize: "0.9rem" }}>
            All calculations provided by Calmatic Suite are for <strong>informational and educational purposes only</strong>.
            They do not constitute financial, legal, accounting, tax, or professional advice of any kind.
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
        <Section title="No Liability">
          The creators, contributors, and maintainers of Calmatic Suite accept{" "}
          <strong style={{ color: "#fafafa" }}>no responsibility or liability</strong> for any errors,
          omissions, or inaccuracies in the calculations, or for any decisions made or actions taken in
          reliance on the results provided by this tool. Use of this site is entirely at your own risk.
        </Section>

        <Section title="No Warranty">
          This software is provided <strong style={{ color: "#fafafa" }}>"as is"</strong>, without warranty
          of any kind, express or implied — including but not limited to warranties of merchantability,
          fitness for a particular purpose, or non-infringement. We make no guarantees regarding the
          accuracy, completeness, or timeliness of any results.
        </Section>

        <Section title="Financial & Professional Decisions">
          For any real financial, tax, accounting, legal, or investment decisions, please consult a{" "}
          <strong style={{ color: "#fafafa" }}>qualified professional</strong>. Calculator results should
          be treated as estimates only and verified independently before being used in any official capacity.
        </Section>

        <Section title="Currency & Live Data">
          Exchange rates and other externally sourced data may be delayed, inaccurate, or unavailable.
          Calmatic Suite is not responsible for discrepancies between displayed rates and actual market rates.
        </Section>

        <Section title="Changes & Availability">
          We reserve the right to modify, suspend, or discontinue any part of this service at any time
          without notice. The tool may be updated or taken offline without prior announcement.
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
              Volunteer Project
            </p>
            <p style={{ color: "#71717a", lineHeight: 1.7, fontSize: "0.9rem" }}>
              Calmatic Suite is a <strong style={{ color: "#d4d4d8" }}>completely free, volunteer-driven,
              open-source project</strong>. It is built and maintained by contributors in their own time,
              with no commercial interest. There are no ads, no subscriptions, and no data collection.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <Code size={22} color="#a78bfa" style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ color: "#71717a", lineHeight: 1.7, fontSize: "0.9rem" }}>
            Contributions, bug reports, and suggestions are welcome.
            The project is open source and available on GitHub.
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#3f3f46", fontSize: "0.8rem" }}>
        Last updated: 2025 · Calmatic Suite
      </p>
    </div>
  );
}

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
