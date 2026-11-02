"use client";

import { useEffect, useRef, useState } from "react";

/** Число «досчитывается» до значения, когда блок появляется на экране. */
export function CountUp({ value, decimals = 0, locale, duration = 1400 }: { value: number; decimals?: number; locale: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          setCurrent(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        setCurrent(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  const text = current.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className="tabular-nums">
      {/* Без JS и для поисковиков — сразу итоговое значение */}
      <span aria-hidden>{text}</span>
      <span className="sr-only">{value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
    </span>
  );
}
