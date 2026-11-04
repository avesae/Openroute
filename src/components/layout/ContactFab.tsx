import { getDictionary } from "@/i18n/dictionaries";
import { getSite } from "@/lib/content";
import { contactLinks } from "@/lib/contact";
import { Phone, Telegram, MaxMessenger } from "@/components/icons";

/** Нижняя панель быстрой связи — только на мобильных. */
export async function ContactFab() {
  const { t } = await getDictionary();
  const links = contactLinks(await getSite());
  const chatEnabled = Boolean(process.env.AI_API_KEY);

  const item = "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold";
  return (
    <nav
      aria-label={t.fab.label}
      className={`fixed inset-x-3 bottom-3 z-30 flex rounded-2xl border border-border bg-bg/95 shadow-card backdrop-blur-md lg:hidden ${chatEnabled ? "pr-16" : ""}`}
    >
      <a href={links.max} target="_blank" rel="noopener noreferrer" aria-label={t.fab.max} className={`${item} text-[#5b4bdb] dark:text-[#a5a0ff]`}>
        <MaxMessenger className="size-6" /> MAX
      </a>
      <a href={links.telegram} target="_blank" rel="noopener noreferrer" aria-label={t.fab.telegram} className={`${item} text-[#1c7fbf] dark:text-[#60a5fa]`}>
        <Telegram className="size-6" /> Telegram
      </a>
      <a href={links.tel} aria-label={t.fab.call} className={`${item} text-fg`}>
        <Phone className="size-6" /> {t.fab.call}
      </a>
    </nav>
  );
}
