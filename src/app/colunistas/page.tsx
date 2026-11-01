import Link from "next/link";
import type { Metadata } from "next";
import { getColumnists } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Colunistas",
  description:
    "Conheça os jornalistas e colunistas da Ajoia Brasil — associação de jornalistas independentes e afiliados.",
};

export const dynamic = "force-dynamic";

export default async function ColumnistsPage() {
  const columnists = await getColumnists();

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="kicker">Redação</p>
        <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
          Colunistas
        </h1>
        <p className="mt-4 text-base leading-relaxed text-mist-muted">
          Profissionais de todo o País — e representações no exterior — unidos
          pelo compromisso com os fatos, a ética e a liberdade de expressão.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {columnists.map((columnist) => (
          <Link
            key={columnist.slug}
            href={`/colunistas/${columnist.slug}`}
            className="group rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-7 transition-colors hover:border-gold/50"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold font-display text-lg text-[var(--text)]">
              {columnist.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-[var(--text)] transition-colors group-hover:text-gold">
              {columnist.name}
            </h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-mist-dim">
              {columnist.role}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mist-muted">
              {columnist.bio}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
