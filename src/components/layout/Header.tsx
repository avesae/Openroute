import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { mainNav } from "@/lib/nav";
import { Logo } from "@/components/icons";
import { NavLinks } from "./NavLinks";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

export async function Header() {
  const { locale, t } = await getDictionary();
  const items = mainNav(t);

  return (
    <header className="header-shadow sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center gap-4 lg:h-18">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-fg" aria-label={`${t.meta.siteName} — ${t.nav.home}`}>
          <span className="grid size-9 place-items-center rounded-full bg-brand text-brand-ink">
            <Logo className="size-6" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Openroute</span>
        </Link>

        <nav aria-label={t.nav.menu} className="ml-4 hidden flex-1 xl:block">
          <NavLinks locale={locale} items={items} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <LangSwitcher locale={locale} label={t.nav.language} />
          <ThemeToggle label={t.nav.theme} />
          <Link href={`/${locale}#pick`} className="btn-primary ml-2 hidden min-h-10 px-5 text-sm whitespace-nowrap sm:inline-flex">
            {t.common.pickTour}
          </Link>
          <MobileMenu
            locale={locale}
            items={items}
            labels={{ menu: t.nav.menu, close: t.nav.close, cta: t.common.pickTour }}
          />
        </div>
      </div>
    </header>
  );
}
