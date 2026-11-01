"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { Close, Menu } from "@/components/icons";
import { NavLinks } from "./NavLinks";

type Props = {
  locale: Locale;
  items: { href: string; label: string }[];
  labels: { menu: string; close: string; cta: string };
};

export function MobileMenu({ locale, items, labels }: Props) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full text-fg hover:bg-surface xl:hidden"
      >
        <Menu className="size-6" />
      </button>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-label={labels.menu}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,100vw)] max-w-none bg-bg p-0 text-fg backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.close}
              className="grid size-10 place-items-center rounded-full hover:bg-surface"
            >
              <Close className="size-6" />
            </button>
          </div>
          <nav aria-label={labels.menu}>
            <NavLinks locale={locale} items={items} vertical onNavigate={() => setOpen(false)} />
          </nav>
          <Link href={`/${locale}#pick`} onClick={() => setOpen(false)} className="btn-primary mt-auto w-full">
            {labels.cta}
          </Link>
        </div>
      </dialog>
    </>
  );
}
