import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { getSite } from "./content";

/** Адрес сайта: переменная NEXT_PUBLIC_SITE_URL или поле url в content/site.json */
export async function siteUrl() {
  const site = await getSite();
  return (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");
}

export function alternates(path: string) {
  const clean = path === "/" ? "" : path;
  return {
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${clean}`])),
      "x-default": `/ru${clean}`,
    },
  };
}

type Options = {
  locale: Locale;
  /** Путь без языка, например "/tours/maldives-honeymoon" */
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
};

export async function pageMetadata({ locale, path, title, description, image, type = "website" }: Options): Promise<Metadata> {
  const site = await getSite();
  const alt = alternates(path);
  const url = `/${locale}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alt.languages },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.name,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locales.filter((l) => l !== locale).map((l) => (l === "ru" ? "ru_RU" : "en_US")),
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}
