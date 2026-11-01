import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestination, getReviews, getTour, getTours } from "@/lib/content";
import { breadcrumbs, tourProduct } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { date, fill, plural, price } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, DetailSkeleton, ReviewCard, SectionHeader, Stars } from "@/components/ui";
import { Gallery } from "@/components/tours/Gallery";
import { TourCard } from "@/components/tours/TourCard";
import { LeadForm } from "@/components/forms/LeadForm";
import { MapEmbed } from "@/components/MapEmbed";
import { Calendar, Check, Flame, Minus, Moonlight, Pin, Plane, Star } from "@/components/icons";

export async function generateStaticParams() {
  return (await getTours()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const { slug } = await params;
  const { locale } = await getDictionary();
  const tour = await getTour(slug);
  if (!tour) return {};
  return pageMetadata({
    locale,
    path: `/tours/${slug}`,
    title: pick(tour.title, locale),
    description: `${pick(tour.summary, locale)} ${tour.durationNights}N · ${price(locale, tour.priceFrom, tour.currency)}`,
    image: tour.images[0].src,
  });
}

/** Содержимое зависит от адреса, поэтому оборачиваем в Suspense — переходы между страницами мгновенные. */
export default function TourPage(props: PageProps<"/[locale]/tours/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const tour = await getTour(slug);
  if (!tour) notFound();

  const [destination, allTours, allReviews, url] = await Promise.all([
    getDestination(tour.destination),
    getTours(),
    getReviews(),
    siteUrl(),
  ]);
  const reviews = allReviews.filter((r) => r.tour === tour.slug);
  const similar = allTours
    .filter((x) => x.slug !== tour.slug && (x.destination === tour.destination || x.types.some((ty) => tour.types.includes(ty))))
    .slice(0, 3);
  const country = destination ? pick(destination.name, locale) : "";
  const title = pick(tour.title, locale);

  return (
    <>
      <JsonLd
        data={[
          tourProduct(tour, locale, url, reviews),
          breadcrumbs([
            { name: t.nav.home, url: `${url}/${locale}` },
            { name: t.nav.tours, url: `${url}/${locale}/tours` },
            { name: title, url: `${url}/${locale}/tours/${tour.slug}` },
          ]),
        ]}
      />

      <div className="container-x pt-8">
        <Breadcrumbs
          label={t.common.breadcrumbs}
          items={[
            { href: `/${locale}`, name: t.nav.home },
            { href: `/${locale}/tours`, name: t.nav.tours },
            { name: title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          {tour.hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-hot px-3 py-1 text-xs font-bold text-white dark:text-black">
              <Flame className="size-3.5" /> {t.common.hot}
            </span>
          )}
          {tour.types.map((ty) => (
            <span key={ty} className="chip">
              {t.tourTypes[ty]}
            </span>
          ))}
        </div>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted">
          <span className="flex items-center gap-1.5">
            <Pin className="size-4" />
            <span>
              {destination && (
                <>
                  <Link href={`/${locale}/destinations/${destination.slug}`} className="hover:text-fg hover:underline">
                    {country}
                  </Link>
                  {", "}
                </>
              )}
              {pick(tour.city, locale)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Moonlight className="size-4" /> {plural(locale, tour.durationNights, t.common.nights)}
          </span>
          <span className="flex items-center gap-1.5">
            <Plane className="size-4" /> {t.tour.fromHelsinki}
          </span>
          {tour.rating && (
            <span className="flex items-center gap-1.5">
              <Star className="size-4 text-amber-500" /> {tour.rating.toFixed(1)}
            </span>
          )}
        </p>
        {/* На мобильных форма бронирования внизу страницы — даём быстрый переход к ней */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-surface p-4 lg:hidden">
          <p>
            <span className="text-sm text-muted">{t.common.from} </span>
            <span className="font-display text-2xl font-bold">{price(locale, tour.priceFrom, tour.currency)}</span>
          </p>
          <a href="#book-form" className="btn-primary">
            {t.common.bookTour}
          </a>
        </div>
      </div>

      <div className="container-x mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0">
          <Gallery
            images={tour.images.map((i) => ({ src: i.src, alt: pick(i.alt, locale) }))}
            labels={{ gallery: t.tour.gallery, next: t.tour.next, prev: t.tour.prev, photo: t.tour.photo }}
          />

          <section className="mt-12" aria-labelledby="overview">
            <h2 id="overview" className="text-2xl font-bold">{t.tour.overview}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{pick(tour.description, locale)}</p>
          </section>

          <section className="mt-12" aria-labelledby="program">
            <h2 id="program" className="text-2xl font-bold">{t.tour.program}</h2>
            <ol className="mt-6 border-l-2 border-brand pl-6">
              {tour.itinerary.map((d) => (
                <li key={d.day} className="relative pb-7 last:pb-0">
                  <span className="absolute top-1 -left-[33px] size-4 rounded-full border-4 border-bg bg-brand-strong" aria-hidden />
                  <p className="text-sm font-semibold text-brand-strong">{fill(t.tour.day, { n: d.day })}</p>
                  <h3 className="mt-1 font-sans text-lg font-bold">{pick(d.title, locale)}</h3>
                  <p className="mt-1 text-muted">{pick(d.text, locale)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-soft p-6">
              <h2 className="font-sans text-lg font-bold">{t.tour.included}</h2>
              <ul className="mt-4 grid gap-2.5">
                {pick(tour.included, locale).map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand-strong" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border p-6">
              <h2 className="font-sans text-lg font-bold">{t.tour.notIncluded}</h2>
              <ul className="mt-4 grid gap-2.5 text-muted">
                {pick(tour.notIncluded, locale).map((item) => (
                  <li key={item} className="flex gap-2">
                    <Minus className="mt-0.5 size-5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="dates">
            <h2 id="dates" className="text-2xl font-bold">{t.tour.datesPrices}</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-sm sm:text-base">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.tour.date}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.tour.priceCol}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.tour.seats}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tour.departures.map((d) => (
                    <tr key={d.date}>
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted" /> {date(locale, d.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">{price(locale, d.price, tour.currency)}</td>
                      <td className="px-4 py-3 text-muted">
                        {d.seatsLeft !== undefined ? fill(t.common.seatsLeft, { n: d.seatsLeft }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="hotel">
            <h2 id="hotel" className="text-2xl font-bold">{t.tour.hotel}</h2>
            <div className="card mt-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-sans text-xl font-bold">{tour.hotel.name}</h3>
                <Stars value={tour.hotel.stars} />
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                {t.tour.meal}: {t.meals[tour.hotel.meal]}
              </p>
              <p className="mt-3 text-muted">{pick(tour.hotel.description, locale)}</p>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="map">
            <h2 id="map" className="mb-5 text-2xl font-bold">{t.tour.map}</h2>
            <MapEmbed
              query={`${tour.location.lat},${tour.location.lng}`}
              zoom={tour.location.zoom}
              title={`${t.tour.map}: ${pick(tour.city, locale)}`}
              locale={locale}
              labels={t.map}
            />
          </section>

          {reviews.length > 0 && (
            <section className="mt-12" aria-labelledby="tour-reviews">
              <h2 id="tour-reviews" className="mb-5 text-2xl font-bold">{t.nav.reviews}</h2>
              <ul className="grid gap-5 sm:grid-cols-2">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <ReviewCard review={r} locale={locale} t={t} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside aria-labelledby="book" className="lg:row-span-1">
          <div id="book-form" className="card scroll-mt-24 p-6 lg:sticky lg:top-24">
            <p className="text-sm text-muted">
              {t.common.from}{" "}
              {tour.hot && <span className="line-through">{price(locale, tour.hot.oldPrice, tour.currency)}</span>}
            </p>
            <p className="font-display text-4xl font-bold">{price(locale, tour.priceFrom, tour.currency)}</p>
            <p className="text-sm text-muted">{t.common.perPerson}</p>
            {tour.hot && (
              <p className="mt-3 rounded-xl bg-hot/10 px-3 py-2 text-sm font-semibold text-hot">
                🔥 {fill(t.hot.save, { amount: price(locale, tour.hot.oldPrice - tour.priceFrom, tour.currency) })} ·{" "}
                {fill(t.common.until, { date: date(locale, tour.hot.until, { year: undefined }) })}
              </p>
            )}
            <h2 id="book" className="mt-6 font-sans text-lg font-bold">{t.tour.bookTitle}</h2>
            <p className="mb-5 text-sm text-muted">{t.tour.bookText}</p>
            <LeadForm
              locale={locale}
              source="tour"
              labels={t.form}
              tour={title}
              withTrip
              dates={tour.departures.map((d) => ({
                value: d.date,
                label: `${date(locale, d.date)} — ${price(locale, d.price, tour.currency)}`,
              }))}
            />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t.tour.similar} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <li key={s.slug}>
                <TourCard tour={s} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
