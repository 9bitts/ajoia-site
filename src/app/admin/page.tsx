import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { articleStatusLabel } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { sectionMeta, isSectionSlug } from "@/lib/sections";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const where =
    session.user.role === "ADMIN" ? {} : { authorId: session.user.id };

  const articles = await prisma.article.findMany({
    where,
    include: { author: { select: { name: true, email: true, approved: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const rank = { PENDING: 0, DRAFT: 1, PUBLISHED: 2 } as const;
  articles.sort((a, b) => {
    const byStatus = rank[a.status] - rank[b.status];
    if (byStatus !== 0) return byStatus;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const pendingArticles = articles.filter((article) => article.status === "PENDING");
  const pendingAccounts =
    session.user.role === "ADMIN"
      ? await prisma.user.count({
          where: { role: "COLUMNIST", approved: false },
        })
      : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Painel
          </p>
          <h1 className="mt-2 font-display text-4xl text-white">Artigos</h1>
          <p className="mt-2 text-sm text-mist-muted">
            Olá, {session.user.name}.{" "}
            {session.user.role === "ADMIN"
              ? "Avalie as matérias enviadas e publique quando estiverem prontas."
              : "Você escreve os seus textos. A publicação fica com a administração."}
          </p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="btn-primary text-xs uppercase tracking-[0.14em]"
        >
          Novo artigo
        </Link>
      </div>

      {session.user.role === "ADMIN" &&
        (pendingArticles.length > 0 || pendingAccounts > 0) && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="border border-amber-200/30 bg-amber-200/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100">
                Matérias para avaliar
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {pendingArticles.length}
              </p>
              <p className="mt-1 text-sm text-mist-muted">
                Aparecem no topo da lista. Abra, leia e clique em publicar.
              </p>
            </div>
            <Link
              href="/admin/usuarios"
              className="border border-white/10 px-4 py-4 hover:border-mist/40"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-mist-dim">
                Contas para liberar
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {pendingAccounts}
              </p>
              <p className="mt-1 text-sm text-mist-muted">
                Jornalistas que criaram conta e ainda não podem enviar.
              </p>
            </Link>
          </div>
        )}

      <div className="mt-10 overflow-x-auto border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-mist-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Seção</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {session.user.role === "ADMIN" && (
                <th className="px-4 py-3 font-medium">Autor</th>
              )}
              <th className="px-4 py-3 font-medium">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td
                  colSpan={session.user.role === "ADMIN" ? 5 : 4}
                  className="px-4 py-8 text-center text-mist-muted"
                >
                  Nenhum artigo ainda. Crie o primeiro.
                </td>
              </tr>
            )}
            {articles.map((article) => {
              const sectionLabel = isSectionSlug(article.section)
                ? sectionMeta[article.section].label
                : article.section;
              return (
                <tr
                  key={article.id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/artigos/${article.id}`}
                      className="text-white hover:text-mist"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-mist-muted">{sectionLabel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        article.status === "PUBLISHED"
                          ? "text-emerald-300"
                          : article.status === "PENDING"
                            ? "text-amber-200"
                            : "text-mist-muted"
                      }
                    >
                      {articleStatusLabel(article.status)}
                    </span>
                  </td>
                  {session.user.role === "ADMIN" && (
                    <td className="px-4 py-3 text-mist-muted">
                      <span className="block text-white">{article.author.name}</span>
                      <span className="block text-xs text-mist-dim">
                        {article.author.email}
                        {article.author.approved ? "" : " · conta não liberada"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-mist-dim">
                    {formatDate(article.updatedAt.toISOString().slice(0, 10))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
