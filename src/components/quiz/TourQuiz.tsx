"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead, type LeadState } from "@/actions/lead";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, plural, price } from "@/lib/format";
import { Consent, Field, HoneyPot, Success } from "@/components/forms/LeadForm";
import { Arrow, ChevronLeft, Moonlight } from "@/components/icons";

export type QuizTour = {
  slug: string;
  title: string;
  place: string;
  image: { src: string; alt: string };
  price: number;
  currency: string;
  nights: number;
  types: string[];
  /** Месяцы вылетов (1–12) */
  months: number[];
  popularity: number;
};

type Labels = Dictionary["quiz"];
type Answers = { type?: string; season?: string; budget?: string; who?: string };
type Question = keyof Answers;

const QUESTIONS: { key: Question; icons: Record<string, string> }[] = [
  { key: "type", icons: { beach: "🏖️", excursion: "🏛️", ski: "🏔️", adventure: "🧭" } },
  { key: "season", icons: { winter: "❄️", spring: "🌸", summer: "☀️", autumn: "🍂", any: "🗓️" } },
  { key: "budget", icons: { low: "€", mid: "€€", high: "€€€", top: "€€€€" } },
  { key: "who", icons: { solo: "🎒", couple: "💑", family: "👨‍👩‍👧", friends: "🥂" } },
];

const SEASONS: Record<string, number[]> = { winter: [12, 1, 2], spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11] };
const BUDGETS: Record<string, [number, number]> = { low: [0, 1000], mid: [1000, 1500], high: [1500, 2500], top: [2500, Infinity] };
const BUDGET_ORDER = ["low", "mid", "high", "top"];
const COMPANY: Record<string, string[]> = { solo: ["adventure", "excursion"], couple: ["romantic"], family: ["family"], friends: ["adventure", "beach"] };

/** Процент совпадения тура с ответами: тип отдыха 45, сезон 25, бюджет 20, компания 10. */
function score(tour: QuizTour, a: Answers) {
  let s = 0;
  if (a.type && tour.types.includes(a.type)) s += 45;
  if (a.season === "any" || (a.season && tour.months.some((m) => SEASONS[a.season!].includes(m)))) s += 25;
  if (a.budget) {
    const [min, max] = BUDGETS[a.budget];
    if (tour.price >= min && tour.price < max) s += 20;
    else {
      const tourBracket = BUDGET_ORDER.findIndex((b) => tour.price >= BUDGETS[b][0] && tour.price < BUDGETS[b][1]);
      if (Math.abs(tourBracket - BUDGET_ORDER.indexOf(a.budget)) === 1) s += 8;
    }
  }
  if (a.who) s += COMPANY[a.who].some((ty) => tour.types.includes(ty)) ? 10 : 3;
  return s;
}

const initial: LeadState = { status: "idle" };

export function TourQuiz({ locale, labels, form, nightsLabel, tours }: {
  locale: Locale;
  labels: Labels;
  form: Dictionary["form"];
  nightsLabel: Dictionary["common"]["nights"];
  tours: QuizTour[];
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);
  const total = QUESTIONS.length;
  const done = step >= total;

  // Переводим фокус на новый вопрос — важно для экранных дикторов и клавиатуры
  useEffect(() => {
    if (touched.current) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const choose = (key: Question, value: string) => {
    touched.current = true;
    setAnswers((a) => ({ ...a, [key]: value }));
    setDir("fwd");
    // Небольшая пауза, чтобы было видно выбранный вариант
    window.setTimeout(() => setStep((s) => s + 1), 220);
  };
  const back = () => {
    touched.current = true;
    setDir("back");
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    touched.current = true;
    setDir("back");
    setAnswers({});
    setStep(0);
  };

  const results = done
    ? tours
        .map((tour) => ({ tour, match: score(tour, answers) }))
        .sort((x, y) => y.match - x.match || y.tour.popularity - x.tour.popularity)
        .slice(0, 3)
    : [];

  const progress = Math.round((Math.min(step, total) / total) * 100);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="h-1.5 bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={labels.eyebrow}>
        <div className="h-full rounded-r-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="p-5 sm:p-8 lg:p-10">
        <div key={step} className={`quiz-step quiz-${dir}`}>
          {!done ? (
            <QuestionStep
              q={QUESTIONS[step]}
              labels={labels}
              n={step + 1}
              total={total}
              selected={answers[QUESTIONS[step].key]}
              onChoose={choose}
              onBack={step > 0 ? back : undefined}
              headingRef={headingRef}
            />
          ) : (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none sm:text-3xl">
                    {labels.resultTitle}
                  </h3>
                  <p className="mt-2 text-muted">{labels.resultText}</p>
                </div>
                <button type="button" onClick={restart} className="btn-ghost min-h-10 px-4 text-sm">
                  ↺ {labels.restart}
                </button>
              </div>

              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {results.map(({ tour, match }, i) => (
                  <li key={tour.slug} className="quiz-card" style={{ animationDelay: `${i * 90}ms` }}>
                    <Link href={`/${locale}/tours/${tour.slug}`} className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                      <span className="relative block aspect-[16/10] overflow-hidden">
                        <Image src={tour.image.src} alt={tour.image.alt} fill sizes="(min-width: 768px) 30vw, 100vw" quality={60} className="object-cover transition duration-500 group-hover:scale-105" />
                        <span className="absolute top-3 left-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-ink shadow">
                          {fill(labels.match, { n: match })}
                        </span>
                      </span>
                      <span className="flex flex-1 flex-col p-4">
                        <span className="text-sm text-muted">{tour.place}</span>
                        <span className="mt-1 font-bold leading-snug">{tour.title}</span>
                        <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
                          <span className="flex items-center gap-1.5 text-muted">
                            <Moonlight className="size-4" /> {plural(locale, tour.nights, nightsLabel)}
                          </span>
                          <span className="font-display text-lg font-bold">{price(locale, tour.price, tour.currency)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <QuizLead locale={locale} labels={labels} form={form} answers={answers} picks={results.map((r) => r.tour.title)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionStep({ q, labels, n, total, selected, onChoose, onBack, headingRef }: {
  q: (typeof QUESTIONS)[number];
  labels: Labels;
  n: number;
  total: number;
  selected?: string;
  onChoose: (key: Question, value: string) => void;
  onBack?: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const text = labels[q.key];
  const options = Object.entries(text.options) as [string, string][];
  return (
    <fieldset>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-brand-strong">{fill(labels.step, { n, total })}</p>
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-muted hover:text-fg">
            <ChevronLeft className="size-4" /> {labels.back}
          </button>
        )}
      </div>
      <legend className="contents">
        <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold outline-none sm:text-3xl">
          {text.title}
        </h3>
      </legend>
      <div className={`mt-6 grid gap-3 ${options.length > 4 ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
        {options.map(([value, label]) => {
          const active = selected === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChoose(q.key, value)}
              className={`group flex min-h-28 flex-col items-start justify-between gap-3 rounded-2xl border-2 bg-bg p-4 text-left font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-brand-strong hover:shadow-card active:scale-[0.98] ${active ? "border-brand-strong bg-brand-soft" : "border-border"}`}
            >
              <span aria-hidden className={`text-2xl transition duration-300 group-hover:scale-110 ${q.key === "budget" ? "font-display text-lg font-bold text-brand-strong" : ""}`}>
                {q.icons[value]}
              </span>
              <span className="leading-snug">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function QuizLead({ locale, labels, form, answers, picks }: {
  locale: Locale;
  labels: Labels;
  form: Dictionary["form"];
  answers: Answers;
  picks: string[];
}) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const id = useId();
  if (state.status === "success") return <div className="mt-8"><Success labels={form} /></div>;

  const err = state.errors ?? {};
  const v = state.values ?? {};
  const summary = QUESTIONS.map(({ key }) => {
    const value = answers[key];
    const options = labels[key].options as Record<string, string>;
    return `${labels[key].title} ${value ? options[value] : "—"}`;
  });

  return (
    <form action={action} noValidate className="mt-8 grid gap-4 rounded-2xl bg-bg p-5 sm:p-6 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
      <div className="lg:col-span-3">
        <p className="font-display text-lg font-bold">{labels.leadTitle}</p>
        <p className="text-sm text-muted">{labels.leadText}</p>
      </div>
      <input type="hidden" name="source" value="quiz" />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="budget" value={answers.budget ? (labels.budget.options as Record<string, string>)[answers.budget] : ""} />
      <input type="hidden" name="message" value={[...summary, `→ ${picks.join("; ")}`].join("\n")} />
      <HoneyPot />
      <Field id={`${id}-name`} label={form.name} error={err.name && form.errors.name}>
        <input id={`${id}-name`} name="name" defaultValue={v.name} autoComplete="name" className="field" aria-invalid={!!err.name} />
      </Field>
      <Field id={`${id}-contact`} label={form.contact} error={err.contact && form.errors.contact}>
        <input id={`${id}-contact`} name="contact" defaultValue={v.contact} autoComplete="tel" className="field" aria-invalid={!!err.contact} />
      </Field>
      <button type="submit" disabled={pending} className="btn-primary w-full lg:mt-[1.625rem] lg:w-auto">
        {pending ? form.sending : labels.submit} <Arrow className="size-4" />
      </button>
      <div className="lg:col-span-3">
        <Consent id={id} locale={locale} labels={form} checked={v.consent === "on"} error={err.consent && form.errors.consent} />
      </div>
      {state.status === "error" && !state.errors && (
        <p role="alert" className="text-sm font-medium text-hot lg:col-span-3">
          {form.errorGeneric}
        </p>
      )}
    </form>
  );
}
