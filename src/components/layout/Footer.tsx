import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSite } from "@/lib/content";
import { contactLinks } from "@/lib/contact";
import { mainNav } from "@/lib/nav";
import { Logo, Mail, Phone, Pin, Telegram, WhatsApp } from "@/components/icons";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";

export async function Footer() {
  const { locale, t } = await getDictionary();
  const site = await getSite();
  const links = contactLinks(site);

  return (
    <footer className="mt-24 border-t border-border bg-surface pb-24 lg:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-brand text-brand-ink">
              <Logo className="size-6" />
            </span>
            <span className="font-display text-lg font-bold">Openroute</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted">{t.footer.about}</p>
          <div className="mt-5 flex gap-2">
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-full bg-bg text-fg hover:text-brand-strong">
              <WhatsApp className="size-5" />
            </a>
            <a href={links.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="grid size-11 place-items-center rounded-full bg-bg text-fg hover:text-brand-strong">
              <Telegram className="size-5" />
            </a>
          </div>
        </div>

        <nav aria-label={t.footer.sections}>
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide uppercase">{t.footer.sections}</h2>
          <ul className="grid gap-2 text-sm">
            {mainNav(t).map((item) => (
              <li key={item.href}>
                <Link href={`/${locale}${item.href}`} className="text-muted hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide uppercase">{t.nav.contacts}</h2>
          <ul className="grid gap-3 text-sm">
            <li>
              <a href={links.tel} className="flex items-center gap-2 text-muted hover:text-fg">
                <Phone className="size-4 shrink-0" /> {site.phone}
              </a>
            </li>
            <li>
              <a href={links.mail} className="flex items-center gap-2 text-muted hover:text-fg">
                <Mail className="size-4 shrink-0" /> {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-muted">
              <Pin className="mt-0.5 size-4 shrink-0" />
              <span>
                {site.address.street}, {site.address.postalCode} {pick(site.address.city, locale)}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-sans text-sm font-bold tracking-wide uppercase">{t.footer.info}</h2>
          <ul className="grid gap-2 text-sm">
            <li>
              <Link href={`/${locale}/privacy`} className="text-muted hover:text-fg">
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <CookieSettingsButton label={t.cookie.settings} />
            </li>
            {pick(site.hours, locale).map((h) => (
              <li key={h} className="text-muted">
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container-x py-6 text-xs text-muted">
          © 2026 {site.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
