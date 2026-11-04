import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getDestinations, getPosts, getTours } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [url, tours, destinations, posts] = await Promise.all([siteUrl(), getTours(), getDestinations(), getPosts("ru")]);

  const paths: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/tours", priority: 0.9, freq: "daily" },
    { path: "/hot-deals", priority: 0.9, freq: "daily" },
    { path: "/destinations", priority: 0.8, freq: "weekly" },
    { path: "/about", priority: 0.5, freq: "monthly" },
    { path: "/reviews", priority: 0.6, freq: "weekly" },
    { path: "/blog", priority: 0.6, freq: "weekly" },
    { path: "/contacts", priority: 0.6, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/consent", priority: 0.1, freq: "yearly" },
    { path: "/cookies", priority: 0.1, freq: "yearly" },
    ...tours.map((t) => ({ path: `/tours/${t.slug}`, priority: 0.8, freq: "weekly" as const })),
    ...destinations.map((d) => ({ path: `/destinations/${d.slug}`, priority: 0.7, freq: "weekly" as const })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.5, freq: "monthly" as const })),
  ];

  return paths.flatMap(({ path, priority, freq }) =>
    locales.map((locale) => ({
      url: `${url}/${locale}${path}`,
      changeFrequency: freq,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${url}/${l}${path}`])) },
    })),
  );
}
