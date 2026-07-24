import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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
    include: { author: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

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
              ? "Você vê todos os textos."
              : "Você gerencia os seus textos."}
          </p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="btn-primary text-xs uppercase tracking-[0.14em]"
        >
          Novo artigo
        </Link>
      </div>

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
                  colSpan={5}
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
                          : "text-amber-200/80"
                      }
                    >
                      {article.status === "PUBLISHED"
                        ? "Publicado"
                        : "Rascunho"}
                    </span>
                  </td>
                  {session.user.role === "ADMIN" && (
                    <td className="px-4 py-3 text-mist-muted">
                      {article.author.name}
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
