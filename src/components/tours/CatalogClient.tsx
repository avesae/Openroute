"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { tourTypes, type Tour } from "@/lib/schema";
import { plural } from "@/lib/format";
import { Filter } from "@/components/icons";
import { TourCard } from "./TourCard";

type Props = {
  tours: Tour[];
  countries: { slug: string; name: string }[];
  locale: Locale;
  t: Dictionary;
};

const durations = {
  short: (n: number) => n <= 6,
  week: (n: number) => n >= 7 && n <= 9,
  long: (n: number) => n >= 10,
} as const;

/** Фильтры и сортировка каталога. Состояние хранится в адресе — ссылкой на подборку можно поделиться. */
export function CatalogClient({ tours, countries, locale, t }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);
  const c = t.catalog;

  const country = params.get("country") ?? "";
  const type = params.get("type") ?? "";
  const max = params.get("max") ?? "";
  const dur = params.get("duration") ?? "";
  const sort = params.get("sort") ?? "popular";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const list = useMemo(() => {
    const filtered = tours.filter(
      (tour) =>
        (!country || tour.destination === country) &&
        (!type || tour.types.includes(type as Tour["types"][number])) &&
        (!max || tour.priceFrom <= Number(max)) &&
        (!dur || durations[dur as keyof typeof durations]?.(tour.durationNights)),
    );
    const sorters: Record<string, (a: Tour, b: Tour) => number> = {
      popular: (a, b) => b.popularity - a.popularity,
      priceAsc: (a, b) => a.priceFrom - b.priceFrom,
      priceDesc: (a, b) => b.priceFrom - a.priceFrom,
      duration: (a, b) => a.durationNights - b.durationNights,
    };
    return [...filtered].sort(sorters[sort] ?? sorters.popular);
  }, [tours, country, type, max, dur, sort]);

  const nameOf = (slug: string) => countries.find((x) => x.slug === slug)?.name;
  const active = Boolean(country || type || max || dur);

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <div className="lg:hidden">
        <button type="button" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} aria-controls="filters" className="btn-ghost w-full">
          <Filter className="size-5" /> {c.showFilters}
        </button>
      </div>

      <aside id="filters" aria-label={c.filters} className={`${showFilters ? "block" : "hidden"} lg:block`}>
        <div className="card grid gap-5 p-5 lg:sticky lg:top-24">
          <Select id="f-country" label={c.country} value={country} onChange={(v) => update("country", v)}>
            <option value="">{c.allCountries}</option>
            {countries.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </Select>
          <Select id="f-type" label={c.type} value={type} onChange={(v) => update("type", v)}>
            <option value="">{c.allTypes}</option>
            {tourTypes.map((x) => (
              <option key={x} value={x}>
                {t.tourTypes[x]}
              </option>
            ))}
          </Select>
          <Select id="f-max" label={c.price} value={max} onChange={(v) => update("max", v)}>
            <option value="">{c.anyPrice}</option>
            {[800, 1000, 1500, 2000, 3000].map((p) => (
              <option key={p} value={p}>
                {p} €
              </option>
            ))}
          </Select>
          <Select id="f-dur" label={c.duration} value={dur} onChange={(v) => update("duration", v)}>
            <option value="">{c.anyDuration}</option>
            <option value="short">{c.short}</option>
            <option value="week">{c.week}</option>
            <option value="long">{c.long}</option>
          </Select>
          {active && (
            <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-left text-sm font-semibold text-brand-strong underline underline-offset-2">
              {c.reset}
            </button>
          )}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted" role="status" aria-live="polite">
            {c.found}: <strong className="text-fg">{plural(locale, list.length, t.common.tours)}</strong>
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{c.sort}</span>
            <select value={sort} onChange={(e) => update("sort", e.target.value === "popular" ? "" : e.target.value)} className="field min-h-10 w-auto py-1">
              <option value="popular">{c.sortPopular}</option>
              <option value="priceAsc">{c.sortPriceAsc}</option>
              <option value="priceDesc">{c.sortPriceDesc}</option>
              <option value="duration">{c.sortDuration}</option>
            </select>
          </label>
        </div>

        {list.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((tour, i) => (
              <li key={tour.slug}>
                <TourCard tour={tour} locale={locale} t={t} countryName={nameOf(tour.destination)} priority={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">{c.empty}</p>
        )}
      </div>
    </div>
  );
}

function Select({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {children}
      </select>
    </div>
  );
}
