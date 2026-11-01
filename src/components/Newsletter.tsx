"use client";

export function Newsletter() {
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
              className="w-full min-w-0 rounded-md border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-[#e8c56b] sm:text-sm"
            />
            <button
              type="submit"
              className="w-full shrink-0 rounded-md bg-[#e8c56b] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#111113] sm:w-auto"
            >
              Assinar
            </button>
          </div>
          <p className="mt-3 text-[11px] text-white/50">
            Ao assinar, você concorda em receber comunicações da Ajoia Brasil.
          </p>
        </form>
      </div>
    </section>
  );
}
