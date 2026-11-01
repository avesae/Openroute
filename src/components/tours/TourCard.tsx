import Image from "next/image";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Tour } from "@/lib/schema";
import { date, plural, price } from "@/lib/format";
import { Calendar, Flame, Moonlight, Pin } from "@/components/icons";

type Props = { tour: Tour; locale: Locale; t: Dictionary; countryName?: string; priority?: boolean };

export function TourCard({ tour, locale, t, countryName, priority }: Props) {
  const next = tour.departures[0];
  const href = `/${locale}/tours/${tour.slug}`;

  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* ЗАМЕНИТЕ ФОТО: images[0] в content/tours/<тур>.json */}
        <Image
          src={tour.images[0].src}
          alt={pick(tour.images[0].alt, locale)}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          quality={60}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {tour.hot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-hot px-2.5 py-1 text-xs font-bold text-white dark:text-black">
              <Flame className="size-3.5" /> {t.common.hot}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#142012]">
            {t.tourTypes[tour.types[0]]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1 text-sm text-muted">
          <Pin className="size-4 shrink-0" />
          <span>
            {countryName ? `${countryName}, ` : ""}
            {pick(tour.city, locale)}
          </span>
        </p>
        <h3 className="mt-1.5 font-sans text-lg leading-snug font-bold">
          {/* Растянутая ссылка: вся карточка кликабельна, но в доступности это одна ссылка */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:outline-3 focus-visible:after:outline-brand-strong">
            {pick(tour.title, locale)}
          </Link>
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <li className="flex items-center gap-1.5">
            <Moonlight className="size-4" /> {plural(locale, tour.durationNights, t.common.nights)}
          </li>
          <li className="flex items-center gap-1.5">
            <Calendar className="size-4" /> {date(locale, next.date, { year: undefined })}
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p>
            {tour.hot && (
              <span className="block text-sm text-muted line-through">{price(locale, tour.hot.oldPrice, tour.currency)}</span>
            )}
            <span className="text-sm text-muted">{t.common.from} </span>
            <span className="font-display text-2xl font-bold">{price(locale, tour.priceFrom, tour.currency)}</span>
            <span className="block text-xs text-muted">{t.common.perPerson}</span>
          </p>
          <span aria-hidden className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-ink transition group-hover:bg-brand-hover">
            {t.common.details}
          </span>
        </div>
      </div>
    </article>
  );
}
