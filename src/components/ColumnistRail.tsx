import Link from "next/link";
import { columnists } from "@/data/columnists";

export function ColumnistRail() {
  const featured = columnists.filter((c) => c.featured);

  return (
    <section className="border-y border-white/10 bg-gradient-to-b from-ink-elevated/60 to-transparent py-16">
      <div className="mx-auto max-w-content px-5">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
              Assinaturas
            </p>
            <h2 className="mt-1 font-display text-3xl text-white md:text-4xl">
              Nossos colunistas
            </h2>
          </div>
          <Link href="/colunistas" className="btn-ghost">
            Todos →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((columnist) => (
            <Link
              key={columnist.slug}
              href={`/colunistas/${columnist.slug}`}
              className="group animate-fade-up border border-white/10 bg-black/30 p-6 transition-all duration-300 hover:border-mist/40 hover:bg-white/[0.03]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mist/30 to-transparent text-lg font-display text-white">
                {columnist.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="font-display text-xl text-white transition-colors group-hover:text-mist">
                {columnist.name}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-mist-dim">
                {columnist.role}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mist-muted">
                {columnist.bio}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
