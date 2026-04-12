"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { clsx } from "clsx";

interface ResultDisplayProps {
  label: string;
  value: string;
  large?: boolean;
  className?: string;
}

export function ResultDisplay({ label, value, large, className }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={clsx(
        "rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 flex items-center justify-between gap-3",
        className
      )}
    >
      <div>
        <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
        <p className={clsx("font-mono font-semibold text-zinc-50", large ? "text-3xl" : "text-xl")}>
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all duration-150 shrink-0"
        title="Copy"
      >
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
    </div>
  );
}
