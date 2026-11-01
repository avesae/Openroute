import { Suspense } from "react";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestination, getDestinations, getTours } from "@/lib/content";
import { breadcrumbs } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { fill } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, DetailSkeleton, PageHero, SectionHeader } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { TourCard } from "@/components/tours/TourCard";
import { Calendar, Globe, Plane, Wallet } from "@/components/icons";

export async function generateStaticParams() {
  return (await getDestinations()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/destinations/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const d = await getDestination(slug);
  if (!d) return {};
  return pageMetadata({
    locale,
    path: `/destinations/${slug}`,
    title: fill(t.destinations.tours, { country: pick(d.nameIn, locale) }),
    description: `${pick(d.summary, locale)} ${t.destinations.bestSeason}: ${pick(d.bestSeason, locale)}.`,
    image: d.image.src,
  });
}

/** Содержимое зависит от адреса, поэтому оборачиваем в Suspense — переходы между страницами мгновенные. */
export default function DestinationPage(props: PageProps<"/[locale]/destinations/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/[locale]/destinations/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const d = await getDestination(slug);
  if (!d) notFound();
  const [tours, url] = await Promise.all([getTours(), siteUrl()]);
  const list = tours.filter((x) => x.destination === d.slug);
  const name = pick(d.name, locale);

  const facts = [
    { icon: Calendar, label: t.destinations.bestSeason, value: pick(d.bestSeason, locale) },
    { icon: Globe, label: t.destinations.visa, value: pick(d.visa, locale) },
    { icon: Plane, label: t.destinations.flight, value: pick(d.flight, locale) },
    { icon: Wallet, label: t.destinations.currency, value: d.currency },
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name,
            description: pick(d.summary, locale),
            image: d.image.src,
            url: `${url}/${locale}/destinations/${d.slug}`,
          },
          breadcrumbs([
            { name: t.nav.home, url: `${url}/${locale}` },
            { name: t.nav.destinations, url: `${url}/${locale}/destinations` },
            { name, url: `${url}/${locale}/destinations/${d.slug}` },
          ]),
        ]}
      />
      <PageHero title={name} text={pick(d.summary, locale)} image={d.image.src} imageAlt={pick(d.image.alt, locale)}>
        <Breadcrumbs
          light
          label={t.common.breadcrumbs}
          items={[{ href: `/${locale}`, name: t.nav.home }, { href: `/${locale}/destinations`, name: t.nav.destinations }, { name }]}
        />
      </PageHero>

      <div className="container-x mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4 text-lg leading-relaxed text-muted">
          {pick(d.description, locale).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="grid gap-3 self-start">
          {facts.map((f) => (
            <div key={f.label} className="flex gap-3 rounded-2xl bg-surface p-4">
              <f.icon className="size-6 shrink-0 text-brand-strong" />
              <div>
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="font-semibold">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <section className="container-x mt-16">
        <SectionHeader title={fill(t.destinations.tours, { country: pick(d.nameIn, locale) })} />
        {list.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((tour) => (
              <li key={tour.slug}>
                <TourCard tour={tour} locale={locale} t={t} countryName={name} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">{t.destinations.noTours}</p>
        )}
      </section>
      <CtaBand />
    </>
  );
}
