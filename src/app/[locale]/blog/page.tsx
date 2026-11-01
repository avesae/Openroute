import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { date } from "@/lib/format";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/blog", title: t.blog.title, description: t.blog.description });
}

export default async function BlogPage() {
  const { locale, t } = await getDictionary();
  const posts = await getPosts(locale);

  return (
    <>
      <PageHero title={t.blog.title} text={t.blog.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.blog }]} />
      </PageHero>
      <ul className="container-x mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <li key={p.slug} className="reveal">
            <article className="group card relative flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={p.cover} alt={p.coverAlt} fill priority={i === 0} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" quality={60} className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm text-muted">
                  <time dateTime={p.date}>{date(locale, p.date)}</time> · {p.readingMinutes} {t.common.minRead}
                </p>
                <h2 className="mt-2 font-sans text-xl leading-snug font-bold">
                  <Link href={`/${locale}/blog/${p.slug}`} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-muted">{p.description}</p>
                <span className="mt-4 text-sm font-semibold text-brand-strong">{t.common.readMore} →</span>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <CtaBand />
    </>
  );
}
