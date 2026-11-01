"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

type Props = {
  images: { src: string; alt: string }[];
  labels: { gallery: string; next: string; prev: string; photo: string };
};

export function Gallery({ images, labels }: Props) {
  const [index, setIndex] = useState(0);
  const go = (d: number) => setIndex((i) => (i + d + images.length) % images.length);
  const current = images[index];

  return (
    <section aria-label={labels.gallery} aria-roledescription="carousel">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-surface-2 sm:aspect-[16/9]">
        {/* ЗАМЕНИТЕ ФОТО: массив images в content/tours/<тур>.json */}
        <Image key={current.src} src={current.src} alt={current.alt} fill priority={index === 0} sizes="(min-width: 1280px) 800px, 100vw" quality={75} className="object-cover" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={labels.prev} className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#142012] shadow hover:bg-white">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={labels.next} className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#142012] shadow hover:bg-white">
              <ChevronRight className="size-5" />
            </button>
            <p className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white" aria-live="polite">
              {labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(images.length))}
            </p>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={img.alt}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden rounded-xl ring-offset-2 ring-offset-bg transition sm:h-20 sm:w-28 ${i === index ? "ring-3 ring-brand-strong" : "opacity-70 hover:opacity-100"}`}
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
