import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import ru from "../../messages/ru.json";
import en from "../../messages/en.json";
import { isLocale, type Locale } from "./config";

export type Dictionary = typeof ru;

const dictionaries: Record<Locale, Dictionary> = { ru, en };

/** Текущий язык из адреса (/ru/... или /en/...). Работает в серверных компонентах. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  if (!value || !isLocale(value)) notFound();
  return value;
}

export function getDictionarySync(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
