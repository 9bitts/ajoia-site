"use client";

import { useState } from "react";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "already" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json().catch(() => null)) as { error?: string; already?: boolean } | null;

    if (!res.ok) {
      setStatus("error");
      setError(json?.error || "Não foi possível assinar agora.");
      return;
    }

    form.reset();
    setStatus(json?.already ? "already" : "sent");
  }

  return (
    <section className="on-dark bg-[#111113] text-white">
      <div className="mx-auto grid max-w-content items-center gap-8 px-5 py-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8c56b]">
            Newsletter
          </p>
          <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">
            Comece o dia bem informado
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            Receba o essencial da Ajoia: política, cidade, opinião e o painel
            Notícias do Dia — sem ruído, com rigor.
          </p>
        </div>
        <form className="md:col-span-5" onSubmit={onSubmit}>
          <label htmlFor="newsletter-email" className="sr-only">
            E-mail
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full min-w-0 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-[#e8c56b] sm:text-sm"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full shrink-0 rounded-md bg-[#e8c56b] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#111113] disabled:opacity-60 sm:w-auto"
            >
              {status === "sending" ? "Enviando…" : "Assinar"}
            </button>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <p className="mt-3 text-[11px] text-white/50">
            Ao assinar, você concorda em receber comunicações da Ajoia Brasil.
          </p>
          {status === "sent" && (
            <p className="mt-2 text-sm text-[#e8c56b]">Inscrição confirmada.</p>
          )}
          {status === "already" && (
            <p className="mt-2 text-sm text-white/80">Este e-mail já está na lista.</p>
          )}
          {status === "error" && <p className="mt-2 text-sm text-red-300">{error}</p>}
        </form>
      </div>
    </section>
  );
}
