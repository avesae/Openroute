"use client";

import { useSyncExternalStore } from "react";

/** Согласие на cookie (GDPR). "all" — аналитика и карты, "necessary" — только необходимые. */
export type Consent = "all" | "necessary" | null;

const KEY = "openroute-consent";
const EVENT = "openroute-consent-change";

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "necessary" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null> | null) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** На сервере возвращает "pending", чтобы баннер не мигал до загрузки. */
export function useConsent(): Consent | "pending" {
  return useSyncExternalStore(subscribe, read, () => "pending" as const);
}
