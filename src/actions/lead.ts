"use server";

import { Resend } from "resend";
import { z } from "zod";

/**
 * Заявка с сайта. Если заданы RESEND_API_KEY и LEAD_EMAIL_TO — уходит письмом через Resend,
 * иначе печатается в лог сервера (удобно, пока сайт — шаблон).
 */
const leadSchema = z.object({
  source: z.enum(["quick", "quiz", "tour", "contact", "cta"]),
  locale: z.enum(["ru", "en"]),
  name: z.string().trim().min(2, "name").max(80),
  contact: z.string().trim().min(5, "contact").max(120),
  message: z.string().trim().max(2000).optional(),
  destination: z.string().trim().max(80).optional(),
  date: z.string().trim().max(40).optional(),
  people: z.string().trim().max(10).optional(),
  budget: z.string().trim().max(40).optional(),
  tour: z.string().trim().max(120).optional(),
  consent: z.literal("on", { message: "consent" }),
});

export type LeadState = {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "contact" | "consent", string>>;
  /** Введённые значения — React очищает форму после отправки, возвращаем их при ошибке */
  values?: Record<string, string>;
};

const labels: Record<string, string> = {
  source: "Форма",
  name: "Имя",
  contact: "Контакт",
  message: "Сообщение",
  destination: "Направление",
  date: "Дата",
  people: "Человек",
  budget: "Бюджет",
  tour: "Тур",
  locale: "Язык сайта",
};

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Ловушка для ботов: скрытое поле, которое человек не заполнит.
  if (formData.get("website")) return { status: "success" };

  const raw = Object.fromEntries(
    [...formData.entries()].filter(([k, v]) => !k.startsWith("$") && typeof v === "string" && v !== ""),
  );
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: LeadState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "contact" || field === "consent") errors[field] = field;
    }
    return { status: "error", errors, values: raw as Record<string, string> };
  }

  const lead = parsed.data;
  const lines = Object.entries(lead)
    .filter(([k]) => k !== "consent")
    .map(([k, v]) => `${labels[k] ?? k}: ${v}`);

  try {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.LEAD_EMAIL_TO;
    if (key && to) {
      const resend = new Resend(key);
      const { error } = await resend.emails.send({
        from: process.env.LEAD_EMAIL_FROM || "Openroute <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        subject: `Новая заявка: ${lead.name}${lead.tour ? ` — ${lead.tour}` : ""}`,
        text: lines.join("\n"),
      });
      if (error) throw new Error(error.message);
    } else {
      console.info(`[lead] Новая заявка (email не настроен):\n${lines.join("\n")}`);
    }
    return { status: "success" };
  } catch (error) {
    console.error("[lead] Не удалось отправить заявку", error);
    return { status: "error", values: raw as Record<string, string> };
  }
}
