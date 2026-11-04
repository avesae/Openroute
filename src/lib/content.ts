import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import {
  destinationSchema,
  faqSchema,
  postSchema,
  reviewSchema,
  siteSchema,
  teamSchema,
  tourSchema,
  type Post,
} from "./schema";

const root = path.join(process.cwd(), "content");

async function readJson<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await readFile(path.join(root, file), "utf8");
  const parsed = schema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Ошибка в файле content/${file}:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

async function readFolder<T>(folder: string, schema: z.ZodType<T>): Promise<T[]> {
  const files = (await readdir(path.join(root, folder))).filter((f) => f.endsWith(".json"));
  return Promise.all(files.map((f) => readJson(`${folder}/${f}`, schema)));
}

export async function getSite() {
  "use cache";
  return readJson("site.json", siteSchema);
}

export async function getTours() {
  "use cache";
  const tours = await readFolder("tours", tourSchema);
  return tours.sort((a, b) => b.popularity - a.popularity);
}

export async function getTour(slug: string) {
  "use cache";
  return (await getTours()).find((t) => t.slug === slug);
}

export async function getHotTours() {
  "use cache";
  return (await getTours()).filter((t) => t.hot);
}

export async function getDestinations() {
  "use cache";
  const list = await readFolder("destinations", destinationSchema);
  return list.sort((a, b) => a.order - b.order);
}

export async function getDestination(slug: string) {
  "use cache";
  return (await getDestinations()).find((d) => d.slug === slug);
}

export async function getReviews() {
  "use cache";
  return readJson("reviews.json", z.array(reviewSchema));
}

export async function getFaq() {
  "use cache";
  return readJson("faq.json", z.array(faqSchema));
}

export async function getTeam() {
  "use cache";
  return readJson("team.json", z.array(teamSchema));
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  "use cache";
  const dir = path.join(root, "blog", locale);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(await readFile(path.join(dir, file), "utf8"));
      const meta = postSchema.safeParse(data);
      if (!meta.success) {
        throw new Error(`Ошибка в content/blog/${locale}/${file}:\n${z.prettifyError(meta.error)}`);
      }
      return {
        ...meta.data,
        slug: file.replace(/\.md$/, ""),
        html: await marked.parse(content),
      };
    }),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(locale: Locale, slug: string) {
  "use cache";
  return (await getPosts(locale)).find((p) => p.slug === slug);
}

export async function getLegal(locale: Locale, name: "privacy" | "consent" | "cookies") {
  "use cache";
  const raw = await readFile(path.join(root, "legal", `${name}.${locale}.md`), "utf8");
  return marked.parse(raw);
}
