"use client";

import Link from "next/link";
import { useState } from "react";
import { ALL, NONE, setConsent, useConsent } from "@/lib/consent";

type Props = {
  cookiesHref: string;
  labels: {
    text: string;
    accept: string;
    reject: string;
    customize: string;
    save: string;
    more: string;
    necessary: string;
    necessaryText: string;
    analytics: string;
    analyticsText: string;
    maps: string;
    mapsText: string;
    alwaysOn: string;
  };
};

/**
 * Баннер cookie: три равнозначных варианта — принять все, отклонить необязательные или настроить.
 * Счётчики и карты не загружаются, пока посетитель не сделал выбор.
 */
export function CookieBanner({ cookiesHref, labels }: Props) {
  const consent = useConsent();
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [maps, setMaps] = useState(false);
  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-h-[85dvh] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-bg p-5 shadow-card sm:bottom-5"
    >
      <p className="text-sm text-fg">
        {labels.text}{" "}
        <Link href={cookiesHref} className="font-semibold text-brand-strong underline underline-offset-2">
          {labels.more}
        </Link>
      </p>

      {custom && (
        <fieldset className="mt-4 grid gap-3 text-sm">
          <legend className="sr-only">{labels.customize}</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-0.5 size-5 shrink-0" />
            <span>
              <span className="font-semibold">{labels.necessary}</span> <span className="text-muted">({labels.alwaysOn})</span>
              <span className="block text-muted">{labels.necessaryText}</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--brand-strong)]" />
            <span>
              <span className="font-semibold">{labels.analytics}</span>
              <span className="block text-muted">{labels.analyticsText}</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={maps} onChange={(e) => setMaps(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--brand-strong)]" />
            <span>
              <span className="font-semibold">{labels.maps}</span>
              <span className="block text-muted">{labels.mapsText}</span>
            </span>
          </label>
        </fieldset>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {/* Все кнопки одинаково заметны: отказаться так же просто, как согласиться */}
        <button type="button" onClick={() => setConsent(NONE)} className="btn-ghost min-h-11 text-sm">
          {labels.reject}
        </button>
        {custom ? (
          <button type="button" onClick={() => setConsent({ analytics, maps })} className="btn-ghost min-h-11 text-sm">
            {labels.save}
          </button>
        ) : (
          <button type="button" onClick={() => setCustom(true)} className="btn-ghost min-h-11 text-sm">
            {labels.customize}
          </button>
        )}
        <button type="button" onClick={() => setConsent(ALL)} className="btn-dark min-h-11 text-sm">
          {labels.accept}
        </button>
      </div>
    </div>
  );
}
