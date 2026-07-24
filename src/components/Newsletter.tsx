"use client";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-content px-5 py-16">
      <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-ink-soft via-ink-elevated to-black px-6 py-12 md:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-mist/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist-soft">
              Newsletter
            </p>
            <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">
              Comece o dia bem informado
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist-muted md:text-base">
              Receba o essencial da Ajoia: política, cidade, opinião e o painel
              Notícias do Dia — sem ruído, com rigor.
            </p>
          </div>
          <form
            className="md:col-span-5"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <label htmlFor="email" className="sr-only">
              E-mail
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-mist-dim focus:border-mist/50"
              />
              <button
                type="submit"
                className="btn-primary shrink-0 text-xs uppercase tracking-[0.14em]"
              >
                Assinar
              </button>
            </div>
            <p className="mt-3 text-[11px] text-mist-dim">
              Ao assinar, você concorda em receber comunicações da Ajoia Brasil.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
