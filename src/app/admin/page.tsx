import Link from "next/link";
import { auth } from "@/auth";
import { ArticleTable, type ArticleRow } from "@/components/admin/ArticleTable";
import { AdminSearch, StatusFilters } from "@/components/admin/AdminSearch";
import { prisma } from "@/lib/db";
import { articleStatuses, type ArticleStatusValue } from "@/lib/editorial";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

function asStatus(value: string | undefined): ArticleStatusValue | undefined {
  if (!value) return undefined;
  return articleStatuses.includes(value as ArticleStatusValue)
    ? (value as ArticleStatusValue)
    : undefined;
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) return null;

  const query = await searchParams;
  const q = (query.q || "").trim().slice(0, 80);
  const status = asStatus(query.status);
  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    const articles = await prisma.article.findMany({
      where: {
        authorId: session.user.id,
        ...(status ? { status } : {}),
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });
    const rows: ArticleRow[] = articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      section: article.section,
      status: article.status,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
    }));

    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
              Painel
            </p>
            <h1 className="mt-2 font-display text-4xl text-white">
              Minhas matérias
            </h1>
            <p className="mt-2 text-sm text-mist-muted">
              Olá, {session.user.name}. A publicação fica com a administração.
            </p>
          </div>
          <Link
            href="/admin/artigos/novo"
            className="btn-primary text-xs uppercase tracking-[0.14em]"
          >
            Nova matéria
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          <AdminSearch
            action="/admin"
            defaultValue={q}
            placeholder="Buscar nas suas matérias"
          />
          <StatusFilters base="/admin" current={status || ""} q={q} />
        </div>
        <div className="mt-6">
          <ArticleTable rows={rows} empty="Nenhuma matéria ainda." />
        </div>
      </div>
    );
  }

  const [columnists, grouped, pendingCount, pending, matches] = await Promise.all([
    prisma.user.findMany({
      where: { role: "COLUMNIST" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        roleLabel: true,
        approved: true,
      },
    }),
    prisma.article.groupBy({
      by: ["authorId", "status"],
      _count: { _all: true },
    }),
    prisma.article.count({ where: { status: "PENDING" } }),
    prisma.article.findMany({
      where: { status: "PENDING" },
      include: { author: { select: { name: true, slug: true } } },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    q
      ? prisma.article.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { author: { name: { contains: q, mode: "insensitive" } } },
            ],
          },
          include: { author: { select: { name: true, slug: true } } },
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
          take: 40,
        })
      : Promise.resolve([]),
  ]);

  const counts = new Map<string, { total: number; pending: number }>();
  for (const row of grouped) {
    const current = counts.get(row.authorId) || { total: 0, pending: 0 };
    current.total += row._count._all;
    if (row.status === "PENDING") current.pending += row._count._all;
    counts.set(row.authorId, current);
  }

  const needle = q.toLocaleLowerCase("pt-BR");
  const visibleColumnists = columnists.filter((user) => {
    if (!needle) return true;
    return (
      user.name.toLocaleLowerCase("pt-BR").includes(needle) ||
      user.roleLabel.toLocaleLowerCase("pt-BR").includes(needle)
    );
  });

  const pendingRows: ArticleRow[] = pending.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    section: article.section,
    status: article.status,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name,
    authorSlug: article.author.slug,
  }));

  const matchRows: ArticleRow[] = matches.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    section: article.section,
    status: article.status,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name,
    authorSlug: article.author.slug,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Painel
          </p>
          <h1 className="mt-2 font-display text-4xl text-white">Colunistas</h1>
          <p className="mt-2 max-w-xl text-sm text-mist-muted">
            Escolha uma pessoa para ver as matérias dela. A fila de avaliação
            fica separada, no topo.
          </p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="btn-primary text-xs uppercase tracking-[0.14em]"
        >
          Nova matéria
        </Link>
      </div>

      <div className="mt-8">
        <AdminSearch
          action="/admin"
          defaultValue={q}
          placeholder="Buscar colunista ou matéria"
        />
      </div>

      {pendingRows.length > 0 && !q && (
        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-amber-200">
            {pendingCount} para avaliar
          </h2>
          <div className="mt-3">
            <ArticleTable
              rows={pendingRows}
              showAuthor
              empty="Nada na fila."
            />
            {pendingCount > pendingRows.length && (
              <p className="mt-2 text-xs text-mist-dim">
                Mostrando as {pendingRows.length} mais recentes.
              </p>
            )}
          </div>
        </section>
      )}

      {q && (
        <section className="mt-8">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
            Matérias
          </h2>
          <div className="mt-3">
            <ArticleTable
              rows={matchRows}
              showAuthor
              empty="Nenhuma matéria com esse termo."
            />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
          {q ? "Pessoas" : `${columnists.length} colunistas`}
        </h2>
        {visibleColumnists.length === 0 ? (
          <p className="mt-4 text-sm text-mist-muted">
            Nenhum colunista com esse nome.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleColumnists.map((user) => {
              const count = counts.get(user.id) || { total: 0, pending: 0 };
              const initials = user.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();
              return (
                <li key={user.id}>
                  <Link
                    href={`/admin/colunistas/${user.slug}`}
                    className="flex h-full gap-3 border border-white/10 px-4 py-4 hover:border-gold/50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-xs font-semibold text-gold">
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-xl text-white">
                        {user.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-mist-dim">
                        {user.roleLabel}
                        {user.approved ? "" : " · conta não liberada"}
                      </span>
                      <span className="mt-2 block text-sm text-mist-muted">
                        {count.total}{" "}
                        {count.total === 1 ? "matéria" : "matérias"}
                        {count.pending > 0 && (
                          <span className="text-amber-200">
                            {" "}
                            · {count.pending} na fila
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
