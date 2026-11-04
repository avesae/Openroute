import { z } from "zod";

/**
 * Модель данных контента. Каждый JSON-файл в /content проверяется этими схемами при сборке:
 * если в туре опечатка или пропущено поле, `npm run build` покажет файл и поле с ошибкой.
 */

const text = z.string().min(1);
export const localized = z.object({ ru: text, en: text });
const localizedList = z.object({ ru: z.array(text), en: z.array(text) });

export const image = z.object({
  src: text,
  alt: localized,
});

export const tourTypes = [
  "beach",
  "excursion",
  "ski",
  "individual",
  "family",
  "romantic",
  "adventure",
] as const;

export const mealPlans = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

export const tourSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "только латиница, цифры и дефис"),
  title: localized,
  summary: localized,
  description: localized,
  destination: text,
  city: localized,
  types: z.array(z.enum(tourTypes)).min(1),
  durationNights: z.number().int().positive(),
  priceFrom: z.number().positive(),
  currency: z.string().length(3).default("RUB"),
  popularity: z.number().min(0).max(100).default(50),
  rating: z.number().min(0).max(5).optional(),
  departures: z
    .array(
      z.object({
        date: z.iso.date(),
        price: z.number().positive(),
        seatsLeft: z.number().int().min(0).optional(),
      }),
    )
    .min(1),
  hot: z
    .object({
      oldPrice: z.number().positive(),
      until: z.iso.date(),
    })
    .optional(),
  images: z.array(image).min(1),
  itinerary: z.array(z.object({ day: z.string(), title: localized, text: localized })),
  included: localizedList,
  notIncluded: localizedList,
  hotel: z.object({
    name: text,
    stars: z.number().int().min(1).max(5),
    meal: z.enum(mealPlans),
    description: localized,
  }),
  location: z.object({ lat: z.number(), lng: z.number(), zoom: z.number().default(11) }),
});

export const destinationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localized,
  /** Название в предложном/родительном контексте: «Туры в Турцию» */
  nameIn: localized,
  region: localized,
  summary: localized,
  description: localizedList,
  bestSeason: localized,
  visa: localized,
  flight: localized,
  currency: text,
  image: image,
  popular: z.boolean().default(false),
  order: z.number().default(100),
});

export const reviewSchema = z.object({
  id: text,
  name: text,
  city: localized,
  rating: z.number().int().min(1).max(5),
  date: z.iso.date(),
  tour: z.string().optional(),
  trip: localized,
  text: localized,
  avatar: z.string().optional(),
});

export const faqSchema = z.object({ q: localized, a: localized });

export const teamSchema = z.object({
  name: text,
  role: localized,
  bio: localized,
  photo: text,
});

export const siteSchema = z.object({
  name: text,
  url: z.url(),
  phone: text,
  email: text,
  /** Ссылка на чат или канал в мессенджере MAX */
  max: text,
  telegram: text,
  vk: z.string().optional(),
  address: z.object({
    street: localized,
    postalCode: text,
    city: localized,
    country: localized,
  }),
  hours: localizedList,
  geo: z.object({ lat: z.number(), lng: z.number() }),
  /** Реквизиты оператора персональных данных — выводятся в подвале и в политике (152-ФЗ) */
  legal: z.object({
    operator: localized,
    inn: text,
    ogrn: text,
    privacyEmail: text,
  }),
});

export const postSchema = z.object({
  title: text,
  description: text,
  date: z.iso.date(),
  cover: text,
  coverAlt: text,
  readingMinutes: z.number().int().positive(),
  destination: z.string().optional(),
});

export type Tour = z.infer<typeof tourSchema>;
export type TourType = (typeof tourTypes)[number];
export type Destination = z.infer<typeof destinationSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type TeamMember = z.infer<typeof teamSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Post = z.infer<typeof postSchema> & { slug: string; html: string };
