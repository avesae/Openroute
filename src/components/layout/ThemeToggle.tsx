"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@/components/icons";

export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const apply = () => {
      // Класс ставим сразу, чтобы View Transition сняла «после» уже в новой теме
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      setTheme(next);
    };
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();

    // Круг раскрывается от центра кнопки до самого дальнего угла экрана
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${r}px`);
    document.startViewTransition(apply);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-fg active:scale-90"
    >
      {/* Иконка выбирается через CSS, чтобы не было мигания при загрузке */}
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}
