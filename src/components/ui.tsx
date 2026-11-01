import Image from "next/image";
import Link from "next/link";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Faq, Review } from "@/lib/schema";
import { date } from "@/lib/format";
import { ChevronRight, Star } from "@/components/icons";

export function SectionHeader({ title, text, eyebrow, action }: { title: string; text?: string; eyebrow?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {text && <p className="mt-3 text-lg text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ title, text, image, imageAlt, children }: { title: string; text?: string; image?: string; imageAlt?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-surface">
      {image && (
        <>
          {/* ЗАМЕНИТЕ ФОТО: укажите своё изображение в контенте страницы */}
          <Image src={image} alt={imageAlt ?? ""} fill priority sizes="100vw" quality={60} className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
        </>
      )}
      <div className={`container-x py-14 sm:py-20 ${image ? "text-white" : ""}`}>
        {children}
        <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {text && <p className={`mt-4 max-w-2xl text-lg ${image ? "text-white/90" : "text-muted"}`}>{text}</p>}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items, label, light }: { items: { href?: string; name: string }[]; label: string; light?: boolean }) {
  return (
    <nav aria-label={label} className="mb-4 text-sm">
      <ol className={`flex flex-wrap items-center gap-1 ${light ? "text-white/80" : "text-muted"}`}>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" />}
            {item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={light ? "text-white" : "text-fg"}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="flex text-amber-500" role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "" : "opacity-25"}`} />
      ))}
    </span>
  );
}

export function ReviewCard({ review, locale, t }: { review: Review; locale: Locale; t: Dictionary }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Stars value={review.rating} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">“{pick(review.text, locale)}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {review.avatar ? (
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
            <Image src={review.avatar} alt="" fill sizes="44px" quality={60} className="object-cover" />
          </span>
        ) : (
          <span className="grid size-11 place-items-center rounded-full bg-brand-soft font-bold text-brand-strong" aria-hidden>
            {review.name[0]}
          </span>
        )}
        <span className="text-sm">
          <span className="block font-semibold">{review.name}</span>
          <span className="text-muted">
            {t.reviews.trip}: {pick(review.trip, locale)} · {date(locale, review.date, { day: undefined, month: "short" })}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** FAQ на нативных <details>: работает без JavaScript и доступно с клавиатуры. */
export function FaqList({ items, locale }: { items: Faq[]; locale: Locale }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-bg">
      {items.map((f, i) => (
        <details key={i} className="group px-5 sm:px-6" name="faq">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
            {pick(f.q, locale)}
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xl leading-none transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="pb-5 text-muted">{pick(f.a, locale)}</p>
        </details>
      ))}
    </div>
  );
}

/** Заглушка на долю секунды, пока загружается страница тура, направления или статьи. */
export function DetailSkeleton() {
  return (
    <div className="container-x animate-pulse pt-8" aria-hidden>
      <div className="h-4 w-48 rounded bg-surface-2" />
      <div className="mt-6 h-10 w-3/4 max-w-2xl rounded-lg bg-surface-2" />
      <div className="mt-4 h-5 w-1/2 max-w-md rounded bg-surface-2" />
      <div className="mt-8 aspect-[16/9] max-w-4xl rounded-3xl bg-surface-2" />
    </div>
  );
}
