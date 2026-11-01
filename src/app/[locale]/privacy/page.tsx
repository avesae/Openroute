import { getDictionary } from "@/i18n/dictionaries";
import { getLegal } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/privacy", title: t.privacy.title, description: t.privacy.description });
}

export default async function PrivacyPage() {
  const { locale, t } = await getDictionary();
  const html = await getLegal(locale, "privacy");

  return (
    <article className="container-x max-w-3xl pt-8">
      <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.privacy.title }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{t.privacy.title}</h1>
      {/* Текст политики: content/legal/privacy.<язык>.md — согласуйте с юристом */}
      <div className="prose-article mt-8 text-base" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-6 rounded-2xl bg-surface p-5">
        <CookieSettingsButton label={`⚙️ ${t.cookie.settings}`} />
      </div>
    </article>
  );
}
