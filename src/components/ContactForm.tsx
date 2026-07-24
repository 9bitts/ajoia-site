"use client";

export function ContactForm() {
  return (
    <form
      className="border border-white/10 bg-ink-elevated/40 p-6 md:p-8"
      onSubmit={(e) => e.preventDefault()}
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
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-mist/50"
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
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-mist/50"
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
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-mist/50"
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
            className="mt-2 w-full resize-y border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-mist/50"
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-fit text-xs uppercase tracking-[0.14em]"
        >
          Enviar mensagem
        </button>
      </div>
    </form>
  );
}
