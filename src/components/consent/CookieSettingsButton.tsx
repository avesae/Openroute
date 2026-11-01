"use client";

import { setConsent } from "@/lib/consent";

/** Сбрасывает выбор — баннер покажется снова. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => setConsent(null)} className="text-left text-muted hover:text-fg">
      {label}
    </button>
  );
}
