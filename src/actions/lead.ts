"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { z } from "zod";
import { CONSENT_VERSION } from "@/lib/legal";

/**
 * Заявка с сайта. Если заданы SMTP_HOST, SMTP_USER, SMTP_PASS и LEAD_EMAIL_TO — уходит письмом
 * через SMTP российского почтового сервиса (например, Яндекс 360 или VK WorkSpace),
 * иначе печатается в лог сервера (удобно, пока сайт — демо).
 *
 * 152-ФЗ: данные граждан РФ должны первично записываться в базы на территории России,
 * поэтому зарубежные сервисы рассылки (Resend, SendGrid и т. п.) здесь не используются.
 * Вместе с заявкой фиксируется факт согласия: время, IP, браузер и версия текста согласия.
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
  const h = await headers();
  const consentRecord = {
    at: new Date().toISOString(),
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown",
    userAgent: (h.get("user-agent") || "unknown").slice(0, 300),
    version: CONSENT_VERSION,
    form: lead.source,
  };
  const lines = [
    ...Object.entries(lead)
      .filter(([k]) => k !== "consent")
      .map(([k, v]) => `${labels[k] ?? k}: ${v}`),
    "",
    "— Согласие на обработку ПДн —",
    `Дано: ${consentRecord.at}`,
    `IP: ${consentRecord.ip}`,
    `Браузер: ${consentRecord.userAgent}`,
    `Версия текста согласия: ${consentRecord.version}`,
  ];
  // Журнал согласий. На боевом сервере направьте его в файл или базу на сервере в РФ и храните не меньше срока обработки.
  console.info(`[consent] ${JSON.stringify(consentRecord)}`);

  try {
    const host = process.env.SMTP_HOST;
    const to = process.env.LEAD_EMAIL_TO;
    if (host && to) {
      const port = Number(process.env.SMTP_PORT || 465);
      const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.LEAD_EMAIL_FROM || process.env.SMTP_USER,
        to: to.split(",").map((s) => s.trim()),
        subject: `Новая заявка: ${lead.name}${lead.tour ? ` — ${lead.tour}` : ""}`,
        text: lines.join("\n"),
      });
    } else {
      console.info(`[lead] Новая заявка (email не настроен):\n${lines.join("\n")}`);
    }
    return { status: "success" };
  } catch (error) {
    console.error("[lead] Не удалось отправить заявку", error);
    return { status: "error", values: raw as Record<string, string> };
  }
}
