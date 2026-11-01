import type { Site } from "./schema";

export function contactLinks(site: Site) {
  return {
    tel: `tel:${site.phone.replace(/[^\d+]/g, "")}`,
    mail: `mailto:${site.email}`,
    whatsapp: `https://wa.me/${site.whatsapp}`,
    telegram: `https://t.me/${site.telegram}`,
  };
}
