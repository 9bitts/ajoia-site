import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArticleTable, type ArticleRow } from "@/components/admin/ArticleTable";
import { AdminSearch, StatusFilters } from "@/components/admin/AdminSearch";
import { UserAccessRow } from "@/components/admin/UserAccessRow";
import { prisma } from "@/lib/db";
import { articleStatuses, type ArticleStatusValue } from "@/lib/editorial";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

function asStatus(value: string | undefined): ArticleStatusValue | undefined {
  if (!value) return undefined;
  return articleStatuses.includes(value as ArticleStatusValue)
    ? (value as ArticleStatusValue)
    : undefined;
}

export default async function ColumnistDeskPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") redirect("/admin");

  const { slug } = await params;
  const query = await searchParams;
  const q = (query.q || "").trim().slice(0, 80);
  const status = asStatus(query.status);

  const user = await prisma.user.findUnique({ where: { slug } });
  if (!user || user.role !== "COLUMNIST") notFound();

  const articles = await prisma.article.findMany({
    where: {
      authorId: user.id,
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
      <Link
        href="/admin"
        className="text-[11px] uppercase tracking-[0.16em] text-mist-dim hover:text-white"
      >
        ← Colunistas
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Colunista
          </p>
          <h1 className="mt-2 font-display text-4xl text-white">{user.name}</h1>
          <p className="mt-2 text-sm text-mist-muted">
            {user.roleLabel}
            {" · "}
            <a
              href={`/colunistas/${user.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              página pública
            </a>
          </p>
        </div>
      </div>

      <ul className="mt-6">
        <UserAccessRow
          showArticles={false}
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            slug: user.slug,
            roleLabel: user.roleLabel,
            approved: user.approved,
            createdLabel: formatDate(user.createdAt.toISOString().slice(0, 10)),
          }}
        />
      </ul>

      <div className="mt-8 space-y-4">
        <AdminSearch
          action={`/admin/colunistas/${user.slug}`}
          defaultValue={q}
          placeholder={`Buscar nas matérias de ${user.name}`}
        />
        <StatusFilters
          base={`/admin/colunistas/${user.slug}`}
          current={status || ""}
          q={q}
        />
      </div>

      <div className="mt-6">
        <ArticleTable
          rows={rows}
          empty={
            q || status
              ? "Nenhuma matéria com esse filtro."
              : "Este colunista ainda não tem matérias."
          }
        />
      </div>
    </div>
  );
}
