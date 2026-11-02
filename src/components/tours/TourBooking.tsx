"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, price } from "@/lib/format";
import { LeadForm } from "@/components/forms/LeadForm";
import { Minus } from "@/components/icons";

/** Скидка для детей до 12 лет — поменяйте под свои условия */
const CHILD_DISCOUNT = 0.3;
const MAX_PEOPLE = 9;

type Departure = { date: string; label: string; price: number; seatsLeft?: number };

type Props = {
  locale: Locale;
  labels: Dictionary["calc"];
  form: Dictionary["form"];
  tour: string;
  currency: string;
  departures: Departure[];
  heading: { id: string; title: string; text: string };
};

/** Калькулятор стоимости + форма бронирования: выбранные дата и состав уходят вместе с заявкой. */
export function TourBooking({ locale, labels, form, tour, currency, departures, heading }: Props) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const dep = departures[index];
  const limit = Math.min(MAX_PEOPLE, dep.seatsLeft ?? MAX_PEOPLE);

  // При смене даты состав не может превышать оставшиеся места
  const pickDate = (i: number) => {
    setIndex(i);
    const max = Math.min(MAX_PEOPLE, departures[i].seatsLeft ?? MAX_PEOPLE);
    const a = Math.min(adults, max);
    setAdults(a);
    setChildren(Math.min(children, max - a));
  };

  const childPrice = Math.round(dep.price * (1 - CHILD_DISCOUNT));
  const total = dep.price * adults + childPrice * children;
  const shown = useAnimatedNumber(total);
  const fmt = (n: number) => price(locale, n, currency);
  const summary = fill(labels.summary, { adults, children });

  return (
    <div className="mt-6">
      <h3 className="font-sans text-base font-bold">{labels.title}</h3>

      <fieldset className="mt-3">
        <legend className="label">{labels.date}</legend>
        <div className="grid gap-2">
          {departures.map((d, i) => {
            const last = d.seatsLeft !== undefined && d.seatsLeft <= 3;
            return (
              <label
                key={d.date}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-sm transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand-strong ${i === index ? "border-brand-strong bg-brand-soft" : "border-border hover:border-brand-strong/50"}`}
              >
                <input type="radio" name={`${id}-departure`} checked={i === index} onChange={() => pickDate(i)} className="sr-only" />
                <span>
                  <span className="block font-semibold">{d.label}</span>
                  {last && <span className="text-xs font-semibold text-hot">🔥 {labels.lastSeats}</span>}
                </span>
                <span className="font-bold whitespace-nowrap">{fmt(d.price)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-3">
        <Stepper label={labels.adults} value={adults} min={1} max={limit - children} onChange={setAdults} labels={labels} />
        <Stepper label={labels.children} hint={labels.childNote} value={children} min={0} max={limit - adults} onChange={setChildren} labels={labels} />
      </div>

      <div className="mt-4 rounded-2xl bg-surface p-4">
        <dl className="grid gap-1 text-sm text-muted">
          <div className="flex justify-between gap-3">
            <dt>{fmt(dep.price)} × {adults}</dt>
            <dd>{fmt(dep.price * adults)}</dd>
          </div>
          {children > 0 && (
            <div className="flex justify-between gap-3">
              <dt>{fmt(childPrice)} × {children}</dt>
              <dd>{fmt(childPrice * children)}</dd>
            </div>
          )}
        </dl>
        <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
          <span className="font-semibold">{labels.total}</span>
          <span className="font-display text-3xl font-bold tabular-nums" aria-live="polite">
            {fmt(shown)}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted">{labels.note}</p>
      </div>

      <h2 id={heading.id} className="mt-6 font-sans text-lg font-bold">{heading.title}</h2>
      <p className="mb-5 text-sm text-muted">{heading.text}</p>
      <div>
        <LeadForm
          locale={locale}
          source="tour"
          labels={form}
          tour={tour}
          hidden={{ date: dep.date, people: summary, message: `${labels.total}: ${fmt(total)} (${summary})` }}
        />
      </div>
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange, labels }: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  labels: Dictionary["calc"];
}) {
  const btn = "grid size-10 place-items-center rounded-full border border-border bg-bg text-lg font-semibold transition hover:border-brand-strong active:scale-90 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm">
        <span className="block font-medium">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${labels.decrease}: ${label}`}>
          <Minus className="size-4" />
        </button>
        <output className="w-5 text-center font-display text-lg font-bold tabular-nums" aria-live="polite">
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${labels.increase}: ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

/** Плавно «прокручивает» число к новому значению. */
function useAnimatedNumber(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      from.current = v;
      setValue(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
