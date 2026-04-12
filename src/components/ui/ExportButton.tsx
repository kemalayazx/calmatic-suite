"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportToExcel, exportToCSV, ExportRow } from "@/lib/export";

interface ExportButtonProps {
  getData: () => ExportRow[];
  filename: string;
  sheetName?: string;
}

export default function ExportButton({ getData, filename, sheetName }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleExport = (format: "xlsx" | "csv") => {
    const data = getData();
    if (data.length === 0) return;
    if (format === "xlsx") {
      exportToExcel(data, filename, sheetName);
    } else {
      exportToCSV(data, filename);
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
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
        <Download size={14} />
        Export
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              zIndex: 50,
              background: "var(--bg-secondary, #18181b)",
              border: "1px solid var(--border-color, #27272a)",
              borderRadius: "0.5rem",
              overflow: "hidden",
              minWidth: "160px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => handleExport("xlsx")}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: "var(--text-primary, #fafafa)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-tertiary, #27272a)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport("csv")}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: "var(--text-primary, #fafafa)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg-tertiary, #27272a)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
