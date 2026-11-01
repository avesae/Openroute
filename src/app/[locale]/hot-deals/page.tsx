import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestinations, getHotTours } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { TourCard } from "@/components/tours/TourCard";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/hot-deals", title: t.hot.title, description: t.hot.description });
}

export default async function HotDealsPage() {
  const { locale, t } = await getDictionary();
  const [tours, destinations] = await Promise.all([getHotTours(), getDestinations()]);
  const countryName = (slug: string) => {
    const d = destinations.find((x) => x.slug === slug);
    return d ? pick(d.name, locale) : undefined;
  };

  return (
    <>
      <PageHero title={t.hot.title} text={t.hot.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.hot }]} />
      </PageHero>
      <div className="container-x mt-10">
        {tours.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, i) => (
              <li key={tour.slug} className="reveal">
                <TourCard tour={tour} locale={locale} t={t} countryName={countryName(tour.destination)} priority={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">{t.hot.empty}</p>
        )}
      </div>
      <CtaBand />
    </>
  );
}
