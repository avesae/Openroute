import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSite } from "@/lib/content";
import { contactLinks } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { LeadForm } from "@/components/forms/LeadForm";
import { MapEmbed } from "@/components/MapEmbed";
import { Clock, Mail, Phone, Pin, Telegram, WhatsApp } from "@/components/icons";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/contacts", title: t.contacts.title, description: t.contacts.description });
}

export default async function ContactsPage() {
  const { locale, t } = await getDictionary();
  const site = await getSite();
  const links = contactLinks(site);
  const c = t.contacts;
  const address = `${site.address.street}, ${site.address.postalCode} ${pick(site.address.city, locale)}, ${pick(site.address.country, locale)}`;

  const rows = [
    { icon: Phone, label: c.phone, value: site.phone, href: links.tel },
    { icon: Mail, label: c.email, value: site.email, href: links.mail },
    { icon: Pin, label: c.address, value: address },
  ];

  return (
    <>
      <PageHero title={c.title} text={c.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.contacts }]} />
      </PageHero>

      <div className="container-x mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          {/* ЗАПОЛНИТЕ КОНТАКТЫ: content/site.json */}
          <address className="grid gap-3 not-italic">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-4 rounded-2xl bg-surface p-5">
                <r.icon className="size-6 shrink-0 text-brand-strong" />
                <div>
                  <p className="text-sm text-muted">{r.label}</p>
                  {r.href ? (
                    <a href={r.href} className="text-lg font-semibold hover:underline">
                      {r.value}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold">{r.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-4 rounded-2xl bg-surface p-5">
              <Clock className="size-6 shrink-0 text-brand-strong" />
              <div>
                <p className="text-sm text-muted">{c.hours}</p>
                {pick(site.hours, locale).map((h) => (
                  <p key={h} className="font-semibold">
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </address>

          <h2 className="mt-8 font-sans text-lg font-bold">{c.messengers}</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-[#128c4a] text-white hover:opacity-90">
              <WhatsApp className="size-5" /> WhatsApp
            </a>
            <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="btn bg-[#1c7fbf] text-white hover:opacity-90">
              <Telegram className="size-5" /> Telegram
            </a>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-2xl font-bold">{c.formTitle}</h2>
          <LeadForm locale={locale} source="contact" labels={t.form} withMessage />
        </div>
      </div>

      <section className="container-x mt-16" aria-labelledby="map-title">
        <h2 id="map-title" className="mb-5 text-2xl font-bold">{c.mapTitle}</h2>
        <MapEmbed query={site.mapQuery} zoom={15} title={c.mapTitle} locale={locale} labels={t.map} />
      </section>
    </>
  );
}
