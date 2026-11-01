import { getDictionary } from "@/i18n/dictionaries";
import { getReviews, getSite } from "@/lib/content";
import { reviewItem, travelAgency } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { fill } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, PageHero, ReviewCard, Stars } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/reviews", title: t.reviews.title, description: t.reviews.description });
}

export default async function ReviewsPage() {
  const { locale, t } = await getDictionary();
  const [reviews, site, url] = await Promise.all([getReviews(), getSite(), siteUrl()]);
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const avgText = avg.toFixed(1).replace(".", locale === "ru" ? "," : ".");

  return (
    <>
      <JsonLd
        data={{
          ...travelAgency(site, locale, url, { value: Number(avg.toFixed(1)), count: reviews.length }),
          review: reviews.map((r) => reviewItem(r, locale)),
        }}
      />
      <PageHero title={t.reviews.title} text={t.reviews.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.reviews }]} />
      </PageHero>
      <div className="container-x mt-10">
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl bg-brand-soft p-5">
          <span className="font-display text-4xl font-bold">{avgText}</span>
          <div>
            <Stars value={avg} size="size-5" />
            <p className="mt-1 text-sm text-muted">{fill(t.reviews.average, { rating: avgText, count: reviews.length })}</p>
          </div>
        </div>
        <ul className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <li key={r.id} className="mb-5 break-inside-avoid">
              <ReviewCard review={r} locale={locale} t={t} />
            </li>
          ))}
        </ul>
      </div>
      <CtaBand />
    </>
  );
}
