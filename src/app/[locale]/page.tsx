import Image from "next/image";
import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestinations, getFaq, getHotTours, getReviews, getSite, getTours } from "@/lib/content";
import { faqPage, travelAgency } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { fill, plural } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { CtaBand } from "@/components/CtaBand";
import { FaqList, ReviewCard, SectionHeader, Stars } from "@/components/ui";
import { TourCard } from "@/components/tours/TourCard";
import { QuickSearch } from "@/components/forms/QuickSearch";
import { Arrow, Check, Headset, Plane, Shield, Sparkle, Wallet } from "@/components/icons";

// ЗАМЕНИТЕ ФОТО: главное фото первого экрана
const HERO_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=70";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/", title: t.meta.homeTitle, description: t.meta.homeDescription, image: HERO_IMAGE });
}

const benefitIcons = [Sparkle, Headset, Plane, Wallet];

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const [site, destinations, hot, reviews, faq, tours, url] = await Promise.all([
    getSite(),
    getDestinations(),
    getHotTours(),
    getReviews(),
    getFaq(),
    getTours(),
    siteUrl(),
  ]);
  // Первая карточка крупная, поэтому берём 5 направлений — сетка заполняется ровно
  const popular = destinations.filter((d) => d.popular).slice(0, 5);
  const countryName = (slug: string) => {
    const d = destinations.find((x) => x.slug === slug);
    return d ? pick(d.name, locale) : undefined;
  };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <>
      <JsonLd
        data={[
          travelAgency(site, locale, url, { value: Number(avg.toFixed(1)), count: reviews.length }),
          faqPage(faq, locale),
        ]}
      />

      {/* ───── Первый экран ───── */}
      <section className="relative isolate overflow-hidden">
        <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" quality={60} className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/35 to-black/65 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/35 lg:to-black/10" />
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="text-white">
            <p className="rise inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              <span className="size-2 rounded-full bg-brand" /> {t.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-[3.5rem]">{t.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/90 sm:text-xl">{t.hero.subtitle}</p>
            <div className="rise mt-6 flex items-center gap-3 text-sm text-white/90">
              <Stars value={5} />
              {t.hero.rating}
            </div>
          </div>

          <div id="pick" className="scroll-mt-24 rounded-3xl bg-bg p-5 shadow-2xl sm:p-7">
            <h2 className="mb-5 font-sans text-xl font-bold">{t.quick.title}</h2>
            <QuickSearch
              locale={locale}
              labels={t.quick}
              form={t.form}
              countries={destinations.map((d) => ({ value: d.slug, label: pick(d.name, locale) }))}
            />
          </div>
        </div>
      </section>

      {/* ───── Нам доверяют ───── */}
      <section aria-label={t.home.trustTitle} className="border-b border-border bg-surface">
        <ul className="container-x grid grid-cols-2 gap-4 py-5 text-sm font-semibold sm:flex sm:justify-between">
          {t.trust.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Shield className="size-5 shrink-0 text-brand-strong" /> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ───── Популярные направления ───── */}
      <section className="container-x mt-20 sm:mt-28">
        <SectionHeader
          title={t.home.destinationsTitle}
          text={t.home.destinationsText}
          action={
            <Link href={`/${locale}/destinations`} className="btn-ghost shrink-0">
              {t.nav.destinations} <Arrow className="size-4" />
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {popular.map((d, i) => {
            const count = tours.filter((x) => x.destination === d.slug).length;
            return (
              <li key={d.slug} className={`reveal ${i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
                <Link href={`/${locale}/destinations/${d.slug}`} className="group relative block h-full min-h-44 overflow-hidden rounded-2xl sm:min-h-60">
                  <Image src={d.image.src} alt={pick(d.image.alt, locale)} fill sizes="(min-width: 1024px) 33vw, 50vw" quality={60} className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                    <span className="block font-display text-xl font-bold sm:text-2xl">{pick(d.name, locale)}</span>
                    <span className="mt-1 block text-sm text-white/85">
                      {count > 0 ? plural(locale, count, t.common.tours) : pick(d.region, locale)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───── Горящие туры ───── */}
      {hot.length > 0 && (
        <section className="container-x mt-20 sm:mt-28">
          <SectionHeader
            eyebrow={`🔥 ${t.common.hot}`}
            title={t.home.hotTitle}
            text={t.home.hotText}
            action={
              <Link href={`/${locale}/hot-deals`} className="btn-ghost shrink-0">
                {t.nav.hot} <Arrow className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hot.slice(0, 3).map((tour) => (
              <li key={tour.slug} className="reveal">
                <TourCard tour={tour} locale={locale} t={t} countryName={countryName(tour.destination)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───── Преимущества ───── */}
      <section className="mt-20 bg-surface py-16 sm:mt-28 sm:py-24">
        <div className="container-x">
          <SectionHeader title={t.home.benefitsTitle} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.benefits.map((b, i) => {
              const Icon = benefitIcons[i];
              return (
                <li key={b.title} className="reveal card p-6">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand text-brand-ink">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-sans text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-muted">{b.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ───── Как мы работаем ───── */}
      <section className="container-x mt-20 sm:mt-28">
        <SectionHeader title={t.home.stepsTitle} />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((s, i) => (
            <li key={s.title} className="reveal relative rounded-2xl border border-border p-6">
              <span className="font-display text-5xl font-bold text-brand-strong/30" aria-hidden>
                0{i + 1}
              </span>
              <h3 className="mt-3 font-sans text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───── Отзывы ───── */}
      <section className="container-x mt-20 sm:mt-28">
        <SectionHeader
          title={t.home.reviewsTitle}
          text={fill(t.reviews.average, { rating: avg.toFixed(1).replace(".", locale === "ru" ? "," : "."), count: reviews.length })}
          action={
            <Link href={`/${locale}/reviews`} className="btn-ghost shrink-0">
              {t.nav.reviews} <Arrow className="size-4" />
            </Link>
          }
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <li key={r.id} className="reveal">
              <ReviewCard review={r} locale={locale} t={t} />
            </li>
          ))}
        </ul>
      </section>

      {/* ───── FAQ ───── */}
      <section className="container-x mt-20 grid gap-8 sm:mt-28 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">{t.home.faqTitle}</h2>
          <ul className="mt-6 hidden gap-3 text-muted lg:grid">
            {t.benefits.map((b) => (
              <li key={b.title} className="flex items-center gap-2">
                <Check className="size-5 text-brand-strong" /> {b.title}
              </li>
            ))}
          </ul>
        </div>
        <FaqList items={faq} locale={locale} />
      </section>

      <CtaBand title={t.home.ctaTitle} text={t.home.ctaText} />
    </>
  );
}
