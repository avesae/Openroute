import { getDictionary } from "@/i18n/dictionaries";
import { getSite } from "@/lib/content";
import { contactLinks } from "@/lib/contact";
import { LeadForm } from "@/components/forms/LeadForm";
import { Telegram, WhatsApp } from "@/components/icons";

/** Финальный призыв к действию — есть на каждой странице. */
export async function CtaBand({ title, text }: { title?: string; text?: string }) {
  const { locale, t } = await getDictionary();
  const links = contactLinks(await getSite());

  return (
    <section className="container-x mt-20 sm:mt-28" aria-labelledby="cta-title">
      <div className="reveal grid gap-8 overflow-hidden rounded-[2rem] bg-[#142012] p-6 text-white sm:p-10 lg:grid-cols-2 lg:p-14 dark:bg-surface-2">
        <div>
          <h2 id="cta-title" className="text-3xl font-bold sm:text-4xl">
            {title ?? t.cta.title}
          </h2>
          <p className="mt-4 text-lg text-white/80">{text ?? t.cta.text}</p>
          <p className="mt-8 text-sm font-semibold text-white/70">{t.cta.orWrite}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn border border-white/25 text-white hover:bg-white/10">
              <WhatsApp className="size-5" /> WhatsApp
            </a>
            <a href={links.telegram} target="_blank" rel="noopener noreferrer" className="btn border border-white/25 text-white hover:bg-white/10">
              <Telegram className="size-5" /> Telegram
            </a>
          </div>
        </div>
        <div className="rounded-2xl bg-bg p-5 text-fg sm:p-7">
          <LeadForm locale={locale} source="cta" labels={t.form} withMessage />
        </div>
      </div>
    </section>
  );
}
