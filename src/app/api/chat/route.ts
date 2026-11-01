import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isLocale, pick, type Locale } from "@/i18n/config";
import { getDestinations, getFaq, getSite, getTours } from "@/lib/content";

/**
 * AI-ассистент поддержки. Ключ берётся из ANTHROPIC_API_KEY (.env.local).
 * Модель можно поменять через ANTHROPIC_MODEL, по умолчанию — Claude Opus 5.5.
 */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const bodySchema = z.object({
  locale: z.string(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(30),
});

// Простое ограничение частоты запросов (на один сервер): 20 сообщений в 10 минут с одного IP.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

async function systemPrompt(locale: Locale) {
  const [site, tours, destinations, faq] = await Promise.all([getSite(), getTours(), getDestinations(), getFaq()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL || site.url;

  const catalog = tours
    .map((t) => {
      const dates = t.departures.map((d) => `${d.date} — ${d.price} ${t.currency}`).join("; ");
      return `- ${pick(t.title, locale)} (${pick(t.city, locale)}): ${t.durationNights} nights, from ${t.priceFrom} ${t.currency}/person, meals ${t.hotel.meal}. Departures: ${dates}. ${t.hot ? `HOT DEAL until ${t.hot.until}. ` : ""}Link: ${base}/${locale}/tours/${t.slug}`;
    })
    .join("\n");

  const countries = destinations
    .map((d) => `- ${pick(d.name, locale)}: season ${pick(d.bestSeason, locale)}; visa: ${pick(d.visa, locale)}; flight: ${pick(d.flight, locale)}`)
    .join("\n");

  const faqText = faq.map((f) => `Q: ${pick(f.q, locale)}\nA: ${pick(f.a, locale)}`).join("\n\n");

  return `You are the online assistant of ${site.name}, a travel agency in Helsinki, Finland, that sells tours worldwide with departures from Helsinki.

Your job: help visitors pick a suitable tour, answer questions about destinations, seasons, visas and booking, and support travellers during their trip. Be warm, concise and practical — 2–5 short sentences or a short list. Reply in the visitor's language (the site language is ${locale === "ru" ? "Russian" : "English"}).

When a tour from the catalogue fits, recommend 1–3 of them with price and link. If nothing fits, say we can build a tailor-made trip. Prices and availability change: say that a manager will confirm the final price. Never invent tours, prices, hotels or policies that are not listed below. For visa rules, give the general info below and advise checking with the manager for the visitor's specific passport. For emergencies during a trip (medical, police), tell the person to call 112 or local emergency services first, then contact us.

When the visitor is ready to book or wants a human, ask them to leave their phone/Telegram in the form on the site, or contact the team directly: phone ${site.phone}, WhatsApp https://wa.me/${site.whatsapp}, Telegram https://t.me/${site.telegram}, email ${site.email}.

Tour catalogue:
${catalog}

Destinations:
${countries}

FAQ:
${faqText}`;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "chat_disabled" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isLocale(parsed.data.locale)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { locale, messages } = parsed.data as { locale: Locale; messages: Anthropic.MessageParam[] };

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low" },
    // Если основная модель откажет по соображениям безопасности, запрос автоматически перейдёт на резервную.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: await systemPrompt(locale), cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(locale === "ru" ? "Не могу помочь с этим вопросом. Свяжитесь с менеджером." : "I can't help with that. Please contact a manager."));
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) console.error("[chat] rate limited by API");
        else if (error instanceof Anthropic.AuthenticationError) console.error("[chat] invalid ANTHROPIC_API_KEY");
        else if (error instanceof Anthropic.APIError) console.error(`[chat] API error ${error.status}:`, error.message);
        else console.error("[chat]", error);
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
