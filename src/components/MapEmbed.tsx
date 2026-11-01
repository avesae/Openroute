"use client";

import { setConsent, useConsent } from "@/lib/consent";
import { Pin } from "@/components/icons";

type Props = {
  query: string;
  zoom?: number;
  title: string;
  locale: string;
  labels: { consent: string; show: string };
};

/**
 * Google Maps без API-ключа (встраивание через iframe).
 * Загружается только после согласия на сторонние cookie — требование GDPR.
 */
export function MapEmbed({ query, zoom = 12, title, locale, labels }: Props) {
  const consent = useConsent();
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&hl=${locale}&output=embed`;

  if (consent === "all") {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/10] w-full rounded-2xl border border-border"
      />
    );
  }

  return (
    <div className="grid aspect-[16/10] w-full place-items-center rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
      <div className="max-w-xs">
        <Pin className="mx-auto size-8 text-brand-strong" />
        <p className="mt-3 text-sm text-muted">{labels.consent}</p>
        <button type="button" onClick={() => setConsent("all")} className="btn-ghost mt-4 min-h-11 text-sm">
          {labels.show}
        </button>
      </div>
    </div>
  );
}
