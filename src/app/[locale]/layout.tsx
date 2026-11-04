import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { siteUrl } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { DemoBar } from "@/components/layout/DemoBar";
import { Footer } from "@/components/layout/Footer";
import { ContactFab } from "@/components/layout/ContactFab";
import { Providers } from "@/components/layout/Providers";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { Analytics } from "@/components/consent/Analytics";
import { ChatWidget } from "@/components/chat/ChatWidget";
import "../globals.css";

// Шрифты лежат в проекте (OFL), а не грузятся с Google Fonts: сборка не зависит от зарубежных сервисов.
const body = localFont({ src: "../fonts/Manrope-Variable.woff2", variable: "--font-body", weight: "200 800", display: "swap" });
const heading = localFont({ src: "../fonts/Unbounded-Variable.woff2", variable: "--font-heading", weight: "200 900", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    metadataBase: new URL(await siteUrl()),
    title: { default: t.meta.homeTitle, template: `%s | ${t.meta.siteName}` },
    description: t.meta.homeDescription,
    applicationName: t.meta.siteName,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c120b" },
  ],
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const { locale, t } = await getDictionary();
  const chatEnabled = Boolean(process.env.AI_API_KEY);

  return (
    <html lang={locale} className={`${body.variable} ${heading.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a href="#main" className="sr-only z-50 rounded-full bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
            {t.nav.skip}
          </a>
          <DemoBar />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <ContactFab />
          {chatEnabled && (
            <ChatWidget
              locale={locale}
              contactHref={`/${locale}/contacts`}
              labels={{ ...t.chat, close: t.nav.close }}
            />
          )}
          <CookieBanner cookiesHref={`/${locale}/cookies`} labels={t.cookie} />
          <Analytics ymId={process.env.NEXT_PUBLIC_YM_ID} />
        </Providers>
      </body>
    </html>
  );
}
