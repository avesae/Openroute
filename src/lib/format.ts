import type { Locale } from "@/i18n/config";

type PluralForms = { one: string; few: string; many: string; other: string };

export function plural(locale: Locale, n: number, forms: PluralForms) {
  const rule = new Intl.PluralRules(locale).select(n) as keyof PluralForms;
  return `${n} ${forms[rule] ?? forms.other}`;
}

/** Подставляет значения в строку: fill("Осталось {n}", { n: 3 }) */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export function price(locale: Locale, amount: number, currency = "EUR") {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function date(locale: Locale, iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(new Date(iso));
}

export function localePath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}
