"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

type Props = {
  images: { src: string; alt: string }[];
  labels: { gallery: string; next: string; prev: string; photo: string };
};

/** Галерея на scroll-snap: на телефоне листается свайпом, на компьютере — стрелками, миниатюрами и клавишами ← →. */
export function Gallery({ images, labels }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + images.length) % images.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  // Текущий слайд определяем по прокрутке — работает и для свайпа, и для кнопок
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  // Активная миниатюра всегда видна в ленте
  useEffect(() => {
    const thumb = thumbs.current?.children[index] as HTMLElement | undefined;
    const list = thumbs.current;
    if (!thumb || !list) return;
    list.scrollTo({ left: thumb.offsetLeft - list.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  const many = images.length > 1;

  return (
    <section
      aria-label={labels.gallery}
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(index + 1);
        if (e.key === "ArrowLeft") goTo(index - 1);
      }}
    >
      <div className="group relative overflow-hidden rounded-3xl bg-surface-2">
        <div
          ref={track}
          onScroll={onScroll}
          tabIndex={0}
          aria-label={labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(images.length))}
          className="flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:aspect-[16/9] [&::-webkit-scrollbar]:hidden"
        >
          {/* ЗАМЕНИТЕ ФОТО: массив images в content/tours/<тур>.json */}
          {images.map((img, i) => (
            <div key={img.src} className="relative h-full w-full shrink-0 snap-center" aria-roledescription="slide" aria-hidden={i !== index}>
              <Image src={img.src} alt={img.alt} fill priority={i === 0} sizes="(min-width: 1280px) 800px, 100vw" quality={75} className="object-cover" />
            </div>
          ))}
        </div>
        {many && (
          <>
            <button type="button" onClick={() => goTo(index - 1)} aria-label={labels.prev} className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#142012] shadow transition hover:scale-105 hover:bg-white sm:grid pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => goTo(index + 1)} aria-label={labels.next} className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#142012] shadow transition hover:scale-105 hover:bg-white sm:grid pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100">
              <ChevronRight className="size-5" />
            </button>
            {/* Точки-индикатор для свайпа на телефоне */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((img, i) => (
                <span key={img.src} className={`h-1.5 rounded-full bg-white shadow transition-all duration-300 ${i === index ? "w-5" : "w-1.5 opacity-60"}`} />
              ))}
            </div>
            <p className="absolute right-3 bottom-3 hidden rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white sm:block" aria-live="polite">
              {labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(images.length))}
            </p>
          </>
        )}
      </div>
      {many && (
        <ul ref={thumbs} className="relative mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0 p-1">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={img.alt}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl ring-offset-2 ring-offset-bg transition duration-300 sm:h-20 sm:w-28 ${i === index ? "ring-3 ring-brand-strong" : "opacity-60 hover:opacity-100"}`}
              >
                <Image src={img.src} alt="" fill sizes="112px" quality={60} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
