import Link from "next/link";
import { articleStatusLabel, type ArticleStatusValue } from "@/lib/editorial";
import { saoPauloDay, formatDate } from "@/lib/format";
import { isSectionSlug, sectionMeta } from "@/lib/sections";

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  section: string;
  status: ArticleStatusValue;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName?: string;
  authorSlug?: string;
};

function sectionLabel(section: string) {
  return isSectionSlug(section) ? sectionMeta[section].label : section;
}

function when(article: ArticleRow) {
  const iso = (article.publishedAt ?? article.updatedAt).toISOString();
  return formatDate(saoPauloDay(iso));
}

export function ArticleTable({
  rows,
  showAuthor = false,
  empty,
}: {
  rows: ArticleRow[];
  showAuthor?: boolean;
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="border border-white/10 px-4 py-8 text-center text-sm text-mist-muted">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-mist-dim">
          <tr>
            <th className="px-4 py-3 font-medium">Matéria</th>
            <th className="px-4 py-3 font-medium">Seção</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {showAuthor && <th className="px-4 py-3 font-medium">Colunista</th>}
            <th className="px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((article) => (
            <tr
              key={article.id}
              className="border-b border-white/5 hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/artigos/${article.id}`}
                  className="font-medium text-white hover:text-gold"
                >
                  {article.title}
                </Link>
                {article.status === "PUBLISHED" && (
                  <a
                    href={`/artigo/${article.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-3 text-[11px] uppercase tracking-[0.12em] text-mist-dim hover:text-white"
                  >
                    ver
                  </a>
                )}
              </td>
              <td className="px-4 py-3 text-mist-muted">
                {sectionLabel(article.section)}
              </td>
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
              {showAuthor && (
                <td className="px-4 py-3">
                  {article.authorSlug ? (
                    <Link
                      href={`/admin/colunistas/${article.authorSlug}`}
                      className="text-white hover:text-gold"
                    >
                      {article.authorName}
                    </Link>
                  ) : (
                    <span className="text-mist-muted">{article.authorName}</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-mist-dim">{when(article)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
