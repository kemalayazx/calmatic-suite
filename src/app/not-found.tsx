import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "6rem", fontWeight: 900, color: "#7c3aed", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.25rem", color: "#71717a", marginBottom: "2rem" }}>
        This calculator doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "0.75rem 2rem",
          borderRadius: "0.75rem",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to All Calculators
      </Link>
    </div>
  );
}
