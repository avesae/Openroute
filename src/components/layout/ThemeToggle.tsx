"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@/components/icons";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-fg"
    >
      {/* Иконка выбирается через CSS, чтобы не было мигания при загрузке */}
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}
