import Link from "next/link";
import type { Metadata } from "next";
import { columnists } from "@/data/columnists";

export const metadata: Metadata = {
  title: "Colunistas",
  description:
    "Conheça os jornalistas e colunistas da Ajoia Brasil — associação de jornalistas independentes e afiliados.",
};

export default function ColumnistsPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
          Redação
        </p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
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
            className="group border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-7 transition-all hover:border-mist/35"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mist/25 to-transparent font-display text-lg text-white">
              {columnist.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <h2 className="font-display text-2xl text-white transition-colors group-hover:text-mist">
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
