"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  items: { href: string; label: string }[];
  vertical?: boolean;
  onNavigate?: () => void;
};

export function NavLinks({ locale, items, vertical, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <ul className={vertical ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {items.map((item) => {
        const href = `/${locale}${item.href}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={item.href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                vertical
                  ? `block rounded-xl px-4 py-3 text-lg font-semibold ${active ? "bg-brand-soft text-brand-strong" : "text-fg hover:bg-surface"}`
                  : `rounded-full px-3 py-2 whitespace-nowrap text-[15px] font-medium transition ${active ? "bg-brand-soft text-brand-strong" : "text-muted hover:text-fg"}`
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
