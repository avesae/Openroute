import Image from "next/image";
import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDestinations, getTours } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { plural } from "@/lib/format";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/destinations", title: t.destinations.title, description: t.destinations.description });
}

export default async function DestinationsPage() {
  const { locale, t } = await getDictionary();
  const [destinations, tours] = await Promise.all([getDestinations(), getTours()]);

  return (
    <>
      <PageHero title={t.destinations.title} text={t.destinations.description}>
        <Breadcrumbs label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.destinations }]} />
      </PageHero>
      <ul className="container-x mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => {
          const count = tours.filter((x) => x.destination === d.slug).length;
          return (
            <li key={d.slug} className="reveal">
              <Link href={`/${locale}/destinations/${d.slug}`} className="group card block h-full overflow-hidden">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image src={d.image.src} alt={pick(d.image.alt, locale)} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" quality={60} className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted">{pick(d.region, locale)}</p>
                  <h2 className="mt-1 text-xl font-bold">{pick(d.name, locale)}</h2>
                  <p className="mt-2 text-muted">{pick(d.summary, locale)}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-strong">
                    {count > 0 ? plural(locale, count, t.common.tours) : t.tourTypes.individual}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <CtaBand />
    </>
  );
}
