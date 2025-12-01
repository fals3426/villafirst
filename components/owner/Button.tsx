"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  loading?: boolean;
};

export function OwnerButton({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-white text-black hover:bg-zinc-200 disabled:bg-white/30 disabled:text-zinc-500"
          : "border border-white/20 text-white hover:bg-white/10 disabled:text-zinc-500",
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Patiente..." : children}
    </button>
  );
}
