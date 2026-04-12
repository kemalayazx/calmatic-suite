"use client";
import { clsx } from "clsx";

interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function TabGroup({ tabs, active, onChange }: TabGroupProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-zinc-800/60 p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            active === tab.id
              ? "bg-violet-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
