"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  className?: string;
  /** Compact label for tight header rows */
  compact?: boolean;
};

export function ThemeToggle({ className = "", compact = false }: Props) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";
  const label = isDark ? "Tema claro" : "Tema escuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`font-bold uppercase tracking-[0.18em] transition-colors hover:text-[var(--text)] ${className}`}
    >
      {compact ? (isDark ? "Claro" : "Escuro") : label}
    </button>
  );
}
