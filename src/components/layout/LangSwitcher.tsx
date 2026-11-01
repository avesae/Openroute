"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function LangSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(ru|en)(?=\/|$)/, "");

  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-border p-0.5 text-sm font-semibold">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          hrefLang={l}
          lang={l}
          aria-label={localeNames[l]}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => {
            document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={`grid min-h-9 min-w-10 place-items-center rounded-full px-2 uppercase transition ${
            l === locale ? "bg-fg text-bg" : "text-muted hover:text-fg"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
