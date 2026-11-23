import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArticleTable, type ArticleRow } from "@/components/admin/ArticleTable";
import { prisma } from "@/lib/db";
import type { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

function asQueue(value: string | undefined): "DRAFT" | "PENDING" | undefined {
  if (value === "DRAFT" || value === "PENDING") return value;
  return undefined;
}

export default async function PendingPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const status = asQueue((await searchParams).status);
  const whereStatus: ArticleStatus | { in: ArticleStatus[] } = status
    ? status
    : { in: ["DRAFT", "PENDING"] };

  const articles = await prisma.article.findMany({
    where: { status: whereStatus },
    include: { author: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rows: ArticleRow[] = articles.map((article) => ({
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

  const filters = [
    { id: "", label: "Não publicadas" },
    { id: "PENDING", label: "Na fila" },
    { id: "DRAFT", label: "Rascunhos" },
  ];

  return (
    <div>
      <Link
        href="/admin"
        className="text-[11px] uppercase tracking-[0.16em] text-mist-dim hover:text-white"
      >
        ← Painel
      </Link>
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Redação
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Pendências</h1>
      <p className="mt-2 max-w-xl text-sm text-mist-muted">
        Rascunhos e matérias que ainda não foram publicadas, de todos os
        colunistas.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const href = filter.id ? `/admin/pendencias?status=${filter.id}` : "/admin/pendencias";
          const active = (status || "") === filter.id;
          return (
            <a
              key={filter.id || "all"}
              href={href}
              className={
                active
                  ? "border border-gold/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-gold"
                  : "border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-mist-muted hover:text-white"
              }
            >
              {filter.label}
            </a>
          );
        })}
      </div>
      <div className="mt-6">
        <ArticleTable
          rows={rows}
          showAuthor
          empty="Nenhuma matéria fora do ar."
        />
      </div>
    </div>
  );
}
