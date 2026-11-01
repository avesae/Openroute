import type { Dictionary } from "@/i18n/dictionaries";

export function mainNav(t: Dictionary) {
  return [
    { href: "/tours", label: t.nav.tours },
    { href: "/destinations", label: t.nav.destinations },
    { href: "/hot-deals", label: t.nav.hot },
    { href: "/about", label: t.nav.about },
    { href: "/reviews", label: t.nav.reviews },
    { href: "/blog", label: t.nav.blog },
    { href: "/contacts", label: t.nav.contacts },
  ];
}
