"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;

    if (!res.ok) {
      setStatus("error");
      setError(json?.error || "Não foi possível enviar agora.");
      return;
    }

    form.reset();
    setStatus("sent");
  }

  return (
    <form
      className="border border-white/10 bg-ink-elevated/40 p-6 md:p-8"
      onSubmit={onSubmit}
    >
      <div className="grid gap-5">
        <div>
          <label
            htmlFor="name"
            className="text-[11px] uppercase tracking-[0.16em] text-mist-dim"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none focus:border-mist/50 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="text-[11px] uppercase tracking-[0.16em] text-mist-dim"
          >
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none focus:border-mist/50 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="text-[11px] uppercase tracking-[0.16em] text-mist-dim"
          >
            Assunto
          </label>
          <input
            id="subject"
            name="subject"
            required
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none focus:border-mist/50 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="text-[11px] uppercase tracking-[0.16em] text-mist-dim"
          >
            Mensagem
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="mt-2 w-full resize-y border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none focus:border-mist/50 sm:text-sm"
          />
        </div>
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-primary w-full text-xs uppercase tracking-[0.14em] disabled:opacity-60 sm:w-fit"
        >
          {status === "sending" ? "Enviando…" : "Enviar mensagem"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-mist">Mensagem recebida. A redação responde por e-mail.</p>
        )}
        {status === "error" && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </form>
  );
}
