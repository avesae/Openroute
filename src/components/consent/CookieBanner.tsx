"use client";

import Link from "next/link";
import { setConsent, useConsent } from "@/lib/consent";

type Props = {
  privacyHref: string;
  labels: { text: string; accept: string; reject: string; more: string };
};

export function CookieBanner({ privacyHref, labels }: Props) {
  const consent = useConsent();
  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-bg p-5 shadow-card sm:bottom-5"
    >
      <p className="text-sm text-fg">
        {labels.text}{" "}
        <Link href={privacyHref} className="font-semibold text-brand-strong underline underline-offset-2">
          {labels.more}
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {/* Обе кнопки одинаково заметны — требование GDPR */}
        <button type="button" onClick={() => setConsent("necessary")} className="btn-ghost min-h-11 text-sm">
          {labels.reject}
        </button>
        <button type="button" onClick={() => setConsent("all")} className="btn-dark min-h-11 text-sm">
          {labels.accept}
        </button>
      </div>
    </div>
  );
}
