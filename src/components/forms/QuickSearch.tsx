"use client";

import { useActionState, useId } from "react";
import { submitLead, type LeadState } from "@/actions/lead";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Consent, Field, HoneyPot, Success } from "./LeadForm";

type Props = {
  locale: Locale;
  labels: Dictionary["quick"];
  form: Dictionary["form"];
  countries: { value: string; label: string }[];
};

const initial: LeadState = { status: "idle" };

/** Форма быстрого подбора тура на главной: куда, когда, сколько, бюджет + контакт. */
export function QuickSearch({ locale, labels, form, countries }: Props) {
  const [state, action, pending] = useActionState(submitLead, initial);
  const id = useId();

  if (state.status === "success") return <Success labels={form} />;
  const err = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} noValidate className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="source" value="quick" />
      <input type="hidden" name="locale" value={locale} />
      <HoneyPot />

      <Field id={`${id}-where`} label={labels.where}>
        <select id={`${id}-where`} name="destination" defaultValue={v.destination} className="field">
          <option value="">{labels.anywhere}</option>
          {countries.map((c) => (
            <option key={c.value} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${id}-when`} label={labels.when}>
        <input id={`${id}-when`} name="date" type="month" defaultValue={v.date} min="2026-11" className="field" />
      </Field>
      <Field id={`${id}-people`} label={labels.people}>
        <select id={`${id}-people`} name="people" defaultValue={v.people ?? "2"} className="field">
          {["1", "2", "3", "4", "5", "6+"].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </Field>
      <Field id={`${id}-budget`} label={labels.budget}>
        <select id={`${id}-budget`} name="budget" defaultValue={v.budget} className="field">
          <option value="">{labels.budgetAny}</option>
          <option>&lt; 800 €</option>
          <option>800–1500 €</option>
          <option>1500–2500 €</option>
          <option>2500+ €</option>
        </select>
      </Field>
      <Field id={`${id}-name`} label={form.name} error={err.name && form.errors.name}>
        <input id={`${id}-name`} name="name" defaultValue={v.name} autoComplete="name" className="field" aria-invalid={!!err.name} />
      </Field>
      <Field id={`${id}-contact`} label={labels.contact} error={err.contact && form.errors.contact}>
        <input id={`${id}-contact`} name="contact" defaultValue={v.contact} autoComplete="tel" className="field" aria-invalid={!!err.contact} />
      </Field>
      <div className="sm:col-span-2">
        <Consent id={id} locale={locale} labels={form} checked={v.consent === "on"} error={err.consent && form.errors.consent} />
      </div>
      {state.status === "error" && !state.errors && (
        <p role="alert" className="text-sm font-medium text-hot sm:col-span-2">
          {form.errorGeneric}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:col-span-2">
        {pending ? form.sending : labels.submit}
      </button>
      <p className="text-center text-xs text-muted sm:col-span-2">{labels.note}</p>
    </form>
  );
}
