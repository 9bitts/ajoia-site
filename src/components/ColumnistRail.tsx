import Link from "next/link";
import { getColumnists } from "@/lib/articles";

export async function ColumnistRail() {
  const all = await getColumnists();
  const featured = all.filter((c) => c.featured).slice(0, 4);
  const list = featured.length > 0 ? featured : all.slice(0, 4);
  if (list.length === 0) return null;

  return (
    <section className="border-y border-[var(--line)] bg-[var(--bg-soft)] py-12">
      <div className="mx-auto max-w-content px-4 sm:px-5">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="border-b-2 border-gold pb-1 font-display text-3xl text-[var(--text)] md:text-4xl">
            Colunistas
          </h2>
          <Link
            href="/colunistas"
            className="text-xs font-bold uppercase tracking-[0.14em] text-gold"
          >
            Todos →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((columnist) => (
            <Link
              key={columnist.slug}
              href={`/colunistas/${columnist.slug}`}
              className="group rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 transition-colors hover:border-gold/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold font-display text-sm text-[var(--text)]">
                {columnist.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="font-sans text-lg font-bold tracking-tight text-[var(--text)] group-hover:text-gold">
                {columnist.name}
              </h3>
              <p className="kicker mt-1">{columnist.role}</p>
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
