"use client";
import { clsx } from "clsx";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
