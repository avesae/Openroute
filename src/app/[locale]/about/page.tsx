import Image from "next/image";
import Link from "next/link";
import { pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero, SectionHeader } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { Arrow, Shield } from "@/components/icons";

// ЗАМЕНИТЕ ФОТО: фото команды и офиса
const HERO = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=70";
const OFFICE = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=70";

export async function generateMetadata() {
  const { locale, t } = await getDictionary();
  return pageMetadata({ locale, path: "/about", title: t.about.title, description: t.about.description, image: HERO });
}

export default async function AboutPage() {
  const { locale, t } = await getDictionary();
  const team = await getTeam();
  const a = t.about;

  return (
    <>
      <PageHero title={a.title} text={a.description} image={HERO} imageAlt={a.teamTitle}>
        <Breadcrumbs light label={t.common.breadcrumbs} items={[{ href: `/${locale}`, name: t.nav.home }, { name: t.nav.about }]} />
      </PageHero>

      <section className="container-x mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">{a.storyTitle}</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted">
            {a.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 self-start">
          {a.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-4xl font-bold text-brand-strong">{s.value}</span>
                <span className="mt-1 block text-muted">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-x mt-20">
        <SectionHeader title={a.teamTitle} />
        <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {team.map((m) => (
            <li key={m.name} className="reveal">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
                {/* ЗАМЕНИТЕ ФОТО: photo в content/team.json */}
                <Image src={m.photo} alt={m.name} fill sizes="(min-width: 1024px) 25vw, 50vw" quality={60} className="object-cover" />
              </div>
              <h3 className="mt-4 font-sans text-lg font-bold">{m.name}</h3>
              <p className="text-sm font-semibold text-brand-strong">{pick(m.role, locale)}</p>
              <p className="mt-1 text-sm text-muted">{pick(m.bio, locale)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 bg-surface py-16">
        <div className="container-x">
          <SectionHeader title={a.guaranteesTitle} />
          <ul className="grid gap-5 md:grid-cols-3">
            {a.guarantees.map((g) => (
              <li key={g.title} className="card p-6">
                <Shield className="size-8 text-brand-strong" />
                <h3 className="mt-4 font-sans text-lg font-bold">{g.title}</h3>
                <p className="mt-2 text-muted">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x mt-20 grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src={OFFICE} alt={a.officeTitle} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={60} className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">{a.officeTitle}</h2>
          <p className="mt-4 text-lg text-muted">{a.officeText}</p>
          <Link href={`/${locale}/contacts`} className="btn-primary mt-6">
            {t.nav.contacts} <Arrow className="size-4" />
          </Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
