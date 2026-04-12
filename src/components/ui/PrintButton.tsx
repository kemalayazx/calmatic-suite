"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--border-color, #27272a)",
        background: "var(--bg-tertiary, #27272a)",
        color: "var(--text-secondary, #a1a1aa)",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <Printer size={14} />
      Print
    </button>
  );
}
