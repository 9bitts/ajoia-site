import { ArticleClickRow } from "@/components/admin/ArticleClickRow";
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
  showSocial = false,
  empty,
}: {
  rows: ArticleRow[];
  showAuthor?: boolean;
  showSocial?: boolean;
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
            <ArticleClickRow
              key={article.id}
              href={`/admin/artigos/${article.id}`}
              title={article.title}
              publicHref={article.status === "PUBLISHED" ? `/artigo/${article.slug}` : null}
              socialHref={
                showSocial && article.status === "PUBLISHED"
                  ? `/admin/artigos/${article.id}#redes`
                  : null
              }
              section={sectionLabel(article.section)}
              statusClass={
                article.status === "PUBLISHED"
                  ? "text-emerald-300"
                  : article.status === "PENDING"
                    ? "text-amber-200"
                    : "text-mist-muted"
              }
              statusLabel={articleStatusLabel(article.status)}
              authorName={showAuthor ? article.authorName || "" : undefined}
              authorHref={
                showAuthor && article.authorSlug
                  ? `/admin/colunistas/${article.authorSlug}`
                  : null
              }
              whenLabel={when(article)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
