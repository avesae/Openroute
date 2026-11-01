import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestinations, getPost, getPosts, getTours } from "@/lib/content";
import { breadcrumbs } from "@/lib/schema-org";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { date } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, DetailSkeleton, SectionHeader } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { TourCard } from "@/components/tours/TourCard";

export async function generateStaticParams() {
  // Статьи одинаково называются в обоих языках — берём список из русской папки
  return (await getPosts("ru")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await params;
  const { locale } = await getDictionary();
  const post = await getPost(locale, slug);
  if (!post) return {};
  return pageMetadata({ locale, path: `/blog/${slug}`, title: post.title, description: post.description, image: post.cover, type: "article" });
}

/** Содержимое зависит от адреса, поэтому оборачиваем в Suspense — переходы между страницами мгновенные. */
export default function PostPage(props: PageProps<"/[locale]/blog/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getDictionary();
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const [tours, destinations, url] = await Promise.all([getTours(), getDestinations(), siteUrl()]);
  const related = post.destination ? tours.filter((x) => x.destination === post.destination).slice(0, 3) : [];
  const dest = destinations.find((d) => d.slug === post.destination);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            image: post.cover,
            datePublished: post.date,
            inLanguage: locale,
            author: { "@type": "Organization", name: "Openroute" },
            publisher: { "@type": "Organization", name: "Openroute", logo: { "@type": "ImageObject", url: `${url}/icon.svg` } },
            mainEntityOfPage: `${url}/${locale}/blog/${post.slug}`,
          },
          breadcrumbs([
            { name: t.nav.home, url: `${url}/${locale}` },
            { name: t.nav.blog, url: `${url}/${locale}/blog` },
            { name: post.title, url: `${url}/${locale}/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="container-x max-w-3xl pt-8">
        <Breadcrumbs
          label={t.common.breadcrumbs}
          items={[{ href: `/${locale}`, name: t.nav.home }, { href: `/${locale}/blog`, name: t.nav.blog }, { name: post.title }]}
        />
        <h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-muted">
          <time dateTime={post.date}>{date(locale, post.date)}</time> · {post.readingMinutes} {t.common.minRead}
        </p>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={post.cover} alt={post.coverAlt} fill priority sizes="(min-width: 768px) 768px, 100vw" quality={70} className="object-cover" />
        </div>
        {/* Текст статьи из content/blog/<язык>/<статья>.md */}
        <div className="prose-article mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
        <Link href={`/${locale}/blog`} className="btn-ghost mt-6">
          ← {t.blog.back}
        </Link>
      </article>

      {related.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t.blog.related} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((tour) => (
              <li key={tour.slug}>
                <TourCard tour={tour} locale={locale} t={t} countryName={dest ? pick(dest.name, locale) : undefined} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaBand />
    </>
  );
}
