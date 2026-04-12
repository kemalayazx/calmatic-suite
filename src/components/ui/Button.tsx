"use client";
import { clsx } from "clsx";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30":
            variant === "primary",
          "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700":
            variant === "secondary",
          "bg-red-700 hover:bg-red-600 text-white": variant === "danger",
          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800": variant === "ghost",
        },
        {
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
