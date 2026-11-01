"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { Chat, Close, Send } from "@/components/icons";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  locale: Locale;
  contactHref: string;
  labels: {
    open: string;
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    send: string;
    error: string;
    handoff: string;
    close: string;
  };
};

/** Делает ссылки в ответах ассистента кликабельными, без HTML-инъекций. */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} className="break-all font-semibold underline underline-offset-2" target={part.includes(location.host) ? undefined : "_blank"} rel="noopener noreferrer">
            {part.replace(/^https?:\/\/[^/]+/, "") || part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function ChatWidget({ locale, contactHref, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (open) field.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setFailed(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: history }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer) throw new Error("empty");
    } catch {
      setMessages(history);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.open}
        aria-expanded={open}
        aria-controls="ai-chat"
        className="fixed right-4 bottom-[18px] z-40 grid size-12 place-items-center rounded-full bg-brand text-brand-ink shadow-card transition hover:scale-105 lg:right-5 lg:bottom-5 lg:size-14"
      >
        {open ? <Close className="size-6" /> : <Chat className="size-6" />}
      </button>

      {open && (
        <section
          id="ai-chat"
          aria-label={labels.title}
          className="fixed inset-x-3 bottom-22 z-40 flex max-h-[min(70dvh,560px)] flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-card sm:left-auto sm:w-96 lg:right-5"
        >
          <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-brand text-brand-ink">
              <Chat className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-sm font-bold">{labels.title}</h2>
              <p className="text-xs text-muted">{labels.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="grid size-9 place-items-center rounded-full hover:bg-surface-2">
              <Close className="size-5" />
            </button>
          </header>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm" aria-live="polite">
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 px-3.5 py-2.5">{labels.greeting}</p>
            {messages.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap ${
                  m.role === "user" ? "ml-auto rounded-tr-sm bg-brand text-brand-ink" : "rounded-tl-sm bg-surface-2"
                }`}
              >
                {m.content ? <Linkify text={m.content} /> : <span className="inline-block animate-pulse">•••</span>}
              </p>
            ))}
            {failed && (
              <div className="rounded-xl border border-border p-3 text-muted">
                {labels.error}{" "}
                <a href={contactHref} className="font-semibold text-brand-strong underline">
                  {labels.handoff}
                </a>
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex items-end gap-2 border-t border-border p-3">
            <label htmlFor="chat-input" className="sr-only">
              {labels.placeholder}
            </label>
            <textarea
              id="chat-input"
              ref={field}
              rows={1}
              value={input}
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={labels.placeholder}
              className="field max-h-32 min-h-11 resize-none py-2.5"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={labels.send} className="btn-primary size-11 min-h-11 shrink-0 p-0">
              <Send className="size-5" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
