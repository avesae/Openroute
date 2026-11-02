"use client";

import { useEffect, useState } from "react";

/**
 * Мобильная панель «цена + Забронировать» под шапкой. Появляется, когда блок с ценой
 * ушёл за экран, и прячется, когда на экране уже форма бронирования.
 */
export function StickyBookBar({ watch, target, title, price, cta }: { watch: string; target: string; title: string; price: string; cta: string }) {
  const [passed, setPassed] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(watch);
    const form = document.getElementById(target);
    if (!anchor || !form) return;
    const a = new IntersectionObserver(([e]) => setPassed(!e.isIntersecting && e.boundingClientRect.top < 0));
    const f = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { rootMargin: "0px 0px -30% 0px" });
    a.observe(anchor);
    f.observe(form);
    return () => {
      a.disconnect();
      f.disconnect();
    };
  }, [watch, target]);

  const show = passed && !formVisible;
  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`fixed inset-x-0 top-16 z-30 border-b border-border bg-bg/95 shadow-card backdrop-blur-md transition duration-300 lg:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`}
    >
      <div className="container-x flex items-center justify-between gap-3 py-2.5">
        <p className="min-w-0">
          <span className="block truncate text-xs text-muted">{title}</span>
          <span className="font-display text-lg font-bold">{price}</span>
        </p>
        <a href={`#${target}`} className="btn-primary min-h-10 shrink-0 px-5 text-sm">
          {cta}
        </a>
      </div>
    </div>
  );
}
