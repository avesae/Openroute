import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get("NEXT_LOCALE")?.value;
  if (saved && (locales as readonly string[]).includes(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const lang = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if ((locales as readonly string[]).includes(lang)) return lang;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Пропускаем служебные пути, API, картинку для соцсетей и файлы с расширением (sitemap.xml, robots.txt…)
  matcher: ["/((?!_next|api|opengraph-image|.*\\..*).*)"],
};
