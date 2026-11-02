import { getDictionary } from "@/i18n/dictionaries";
import { Mail } from "@/components/icons";

/** Контакты разработчика сайта: полоска «Демо-проект» сверху и подпись в подвале. */
export const AUTHOR = {
  email: "sandigavanya@mail.ru",
  github: "https://github.com/avesae",
};

export function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

export async function DemoBar() {
  const { t } = await getDictionary();

  return (
    <div className="bg-fg text-bg">
      <div className="container-x flex min-h-9 items-center justify-between gap-3 py-1.5 text-xs sm:justify-between sm:text-[13px]">
        <p className="flex items-center gap-2">
          <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand-ink uppercase">{t.demo.label}</span>
          <span className="opacity-80">
            <span className="max-sm:hidden">{t.demo.text} </span>
            <strong className="font-semibold opacity-100">{t.demo.author}</strong>
          </span>
        </p>
        <p className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a href={`mailto:${AUTHOR.email}`} className="flex items-center gap-1.5 opacity-80 transition hover:opacity-100">
            <Mail className="size-4" /> <span className="max-md:sr-only">{AUTHOR.email}</span>
          </a>
          <a href={AUTHOR.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-80 transition hover:opacity-100">
            <GitHubIcon className="size-4" /> <span className="max-sm:sr-only">GitHub</span>
          </a>
        </p>
      </div>
    </div>
  );
}
