import { pick, type Locale } from "@/i18n/config";
import type { Faq, Review, Site, Tour } from "./schema";

export function travelAgency(site: Site, locale: Locale, url: string, rating?: { value: number; count: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${url}/#agency`,
    name: site.name,
    url: `${url}/${locale}`,
    logo: `${url}/icon.svg`,
    image: `${url}/opengraph-image`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(site.address.street, locale),
      postalCode: site.address.postalCode,
      addressLocality: pick(site.address.city, "en"),
      addressCountry: "RU",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "16:00" },
    ],
    sameAs: [site.vk, `https://t.me/${site.telegram}`].filter(Boolean),
    availableLanguage: ["ru", "en"],
    ...(rating && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating.value, reviewCount: rating.count, bestRating: 5 },
    }),
  };
}

export function tourProduct(tour: Tour, locale: Locale, url: string, reviews: Review[]) {
  const page = `${url}/${locale}/tours/${tour.slug}`;
  const prices = tour.departures.map((d) => d.price);
  return {
    "@context": "https://schema.org",
    "@type": ["Product", "TouristTrip"],
    name: pick(tour.title, locale),
    description: pick(tour.summary, locale),
    image: tour.images.map((i) => i.src),
    url: page,
    brand: { "@type": "Brand", name: "Openroute" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: tour.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: tour.departures.length,
      availability: "https://schema.org/InStock",
      url: page,
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      },
      review: reviews.map((r) => reviewItem(r, locale)),
    }),
  };
}

export function reviewItem(r: Review, locale: Locale) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: r.date,
    reviewBody: pick(r.text, locale),
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
  };
}

export function faqPage(items: Faq[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: pick(f.q, locale),
      acceptedAnswer: { "@type": "Answer", text: pick(f.a, locale) },
    })),
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}
