import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { Plane } from "@/components/icons";

export default async function NotFound() {
  const { locale, t } = await getDictionary();
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <Plane className="mx-auto size-14 text-brand-strong" />
        <p className="mt-4 font-display text-6xl font-bold">404</p>
        <h1 className="mt-2 text-2xl font-bold">{t.notFound.title}</h1>
        <p className="mt-3 text-muted">{t.notFound.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}`} className="btn-primary">
            {t.notFound.home}
          </Link>
          <Link href={`/${locale}/tours`} className="btn-ghost">
            {t.common.allTours}
          </Link>
        </div>
      </div>
    </section>
  );
}
