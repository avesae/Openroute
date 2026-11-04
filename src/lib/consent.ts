"use client";

import { useSyncExternalStore } from "react";

/**
 * Согласие на cookie (152-ФЗ). Необходимые cookie работают всегда,
 * остальные категории — только если посетитель их разрешил.
 *   analytics — Яндекс Метрика
 *   maps      — Яндекс Карты (виджет ставит свои cookie)
 */
export type ConsentPrefs = { analytics: boolean; maps: boolean };
export type Consent = ConsentPrefs | null;

const KEY = "openroute-consent-v2";
const EVENT = "openroute-consent-change";

export const ALL: ConsentPrefs = { analytics: true, maps: true };
export const NONE: ConsentPrefs = { analytics: false, maps: false };

// useSyncExternalStore требует стабильную ссылку: кэшируем разобранное значение по исходной строке.
let cachedRaw: string | null = null;
let cachedValue: Consent = null;

function read(): Consent {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const v = raw ? JSON.parse(raw) : null;
    cachedValue = v && typeof v.analytics === "boolean" && typeof v.maps === "boolean" ? { analytics: v.analytics, maps: v.maps } : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function setConsent(value: Consent) {
  const before = read();
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify({ ...value, at: new Date().toISOString() }));
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
  // Метрику, которая уже загрузилась, нельзя «выгрузить» — после отзыва согласия перезагружаем страницу.
  if (before?.analytics && value && !value.analytics) window.location.reload();
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
  return useSyncExternalStore<Consent | "pending">(subscribe, read, () => "pending");
}
