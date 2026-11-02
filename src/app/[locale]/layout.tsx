import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
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

const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body", display: "swap" });
const heading = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  weight: ["500", "700"],
  display: "swap",
});

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
          <CookieBanner
            privacyHref={`/${locale}/privacy`}
            labels={{ text: t.cookie.text, accept: t.cookie.accept, reject: t.cookie.reject, more: t.cookie.more }}
          />
          <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        </Providers>
      </body>
    </html>
  );
}
