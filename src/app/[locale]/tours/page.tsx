import { Suspense } from "react";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestinations, getTours } from "@/lib/content";
import { breadcrumbs } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { CatalogClient } from "@/components/tours/CatalogClient";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/tours", title: t.catalog.title, description: t.catalog.description });
}

export default async function ToursPage() {
  const { locale, t } = await getDictionary();
  const [tours, destinations, url] = await Promise.all([getTours(), getDestinations(), siteUrl()]);
  const countries = destinations
    .filter((d) => tours.some((x) => x.destination === d.slug))
    .map((d) => ({ slug: d.slug, name: pick(d.name, locale) }));

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: t.nav.home, url: `${url}/${locale}` },
          { name: t.catalog.title, url: `${url}/${locale}/tours` },
        ])}
      />
      <PageHero title={t.catalog.title} text={t.catalog.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.tours }]} />
      </PageHero>
      <div className="container-x mt-10">
        {/* Фильтры читают параметры адреса, поэтому рендерятся на клиенте */}
        <Suspense fallback={<div className="min-h-96" />}>
          <CatalogClient tours={tours} countries={countries} locale={locale} t={t} />
        </Suspense>
      </div>
      <CtaBand />
    </>
  );
}
