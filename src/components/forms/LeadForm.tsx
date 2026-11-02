"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { submitLead, type LeadState } from "@/actions/lead";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Check } from "@/components/icons";

type FormLabels = Dictionary["form"];

type Props = {
  locale: Locale;
  source: "tour" | "contact" | "cta";
  labels: FormLabels;
  tour?: string;
  /** Показать поля даты и количества человек (для бронирования тура) */
  withTrip?: boolean;
  withMessage?: boolean;
  dates?: { value: string; label: string }[];
  /** Дополнительные скрытые поля (например, расчёт из калькулятора) */
  hidden?: Record<string, string>;
};

const initial: LeadState = { status: "idle" };

export function LeadForm({ locale, source, labels, tour, withTrip, withMessage, dates, hidden }: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const id = useId();

  if (state.status === "success") return <Success labels={labels} />;

  const err = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} noValidate className="grid gap-4">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="locale" value={locale} />
      {tour && <input type="hidden" name="tour" value={tour} />}
      {hidden && Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      <HoneyPot />

      <Field id={`${id}-name`} label={labels.name} error={err.name && labels.errors.name}>
        <input id={`${id}-name`} name="name" defaultValue={v.name} autoComplete="name" required minLength={2} className="field" aria-invalid={!!err.name} aria-describedby={err.name ? `${id}-name-err` : undefined} />
      </Field>
      <Field id={`${id}-contact`} label={labels.contact} error={err.contact && labels.errors.contact}>
        <input id={`${id}-contact`} name="contact" defaultValue={v.contact} autoComplete="tel" inputMode="text" required className="field" aria-invalid={!!err.contact} aria-describedby={err.contact ? `${id}-contact-err` : undefined} />
      </Field>

      {withTrip && (
        <div className="grid grid-cols-2 gap-3">
          <Field id={`${id}-date`} label={labels.date}>
            {dates?.length ? (
              <select id={`${id}-date`} name="date" defaultValue={v.date} className="field">
                {dates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <input id={`${id}-date`} name="date" type="date" defaultValue={v.date} className="field" />
            )}
          </Field>
          <Field id={`${id}-people`} label={labels.people}>
            <select id={`${id}-people`} name="people" defaultValue={v.people ?? "2"} className="field">
              {["1", "2", "3", "4", "5", "6+"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {withMessage && (
        <Field id={`${id}-message`} label={labels.message}>
          <textarea id={`${id}-message`} name="message" defaultValue={v.message} rows={4} placeholder={labels.messagePlaceholder} className="field py-3" />
        </Field>
      )}

      <Consent id={id} locale={locale} labels={labels} checked={v.consent === "on"} error={err.consent && labels.errors.consent} />

      {state.status === "error" && !state.errors && (
        <p role="alert" className="text-sm font-medium text-hot">
          {labels.errorGeneric}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}

export function Field({ id, label, error, children }: { id: string; label: string; error?: string | false; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-hot">
          {error}
        </p>
      )}
    </div>
  );
}

export function Consent({ id, locale, labels, checked, error }: { id: string; locale: Locale; labels: FormLabels; checked?: boolean; error?: string | false }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="consent" defaultChecked={checked} required className="mt-0.5 size-5 shrink-0 accent-[var(--brand-strong)]" aria-invalid={!!error} aria-describedby={error ? `${id}-consent-err` : undefined} />
        <span>
          {labels.consent}{" "}
          <Link href={`/${locale}/privacy`} className="font-medium text-brand-strong underline underline-offset-2">
            {labels.privacy}
          </Link>
        </span>
      </label>
      {error && (
        <p id={`${id}-consent-err`} role="alert" className="mt-1 text-sm font-medium text-hot">
          {error}
        </p>
      )}
    </div>
  );
}

export function HoneyPot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Success({ labels }: { labels: FormLabels }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-brand-soft p-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-brand text-brand-ink">
        <Check className="size-7" />
      </span>
      <p className="font-display text-xl font-bold">{labels.successTitle}</p>
      <p className="text-muted">{labels.successText}</p>
    </div>
  );
}
