"use client";

import { setConsent, useConsent } from "@/lib/consent";
import { Pin } from "@/components/icons";

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  title: string;
  locale: string;
  labels: { consent: string; show: string };
};

/**
 * Яндекс Карты без API-ключа (виджет в iframe).
 * Загружается только после согласия на cookie карт: виджет ставит собственные cookie.
 */
export function MapEmbed({ lat, lng, zoom = 12, title, locale, labels }: Props) {
  const consent = useConsent();
  const lang = locale === "ru" ? "ru_RU" : "en_US";
  const src = `https://yandex.ru/map-widget/v1/?ll=${lng},${lat}&z=${zoom}&pt=${lng},${lat},pm2rdm&lang=${lang}`;

  if (consent !== "pending" && consent?.maps) {
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
        <button
          type="button"
          onClick={() => setConsent({ analytics: consent !== "pending" && consent ? consent.analytics : false, maps: true })}
          className="btn-ghost mt-4 min-h-11 text-sm"
        >
          {labels.show}
        </button>
      </div>
    </div>
  );
}
