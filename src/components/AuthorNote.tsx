import Link from "next/link";
import { ColumnistAvatar } from "@/components/ColumnistAvatar";
import type { AuthorProfile } from "@/lib/articles";

export function AuthorNote({ author }: { author: AuthorProfile }) {
  return (
    <aside className="mt-10 flex gap-4 border-t border-[var(--line)] pt-6">
      <Link href={`/colunistas/${author.slug}`} className="shrink-0">
        <ColumnistAvatar name={author.name} avatarUrl={author.avatarUrl} />
      </Link>
      <div className="min-w-0">
        <p className="kicker">{author.role}</p>
        <Link
          href={`/colunistas/${author.slug}`}
          className="mt-1 block font-sans text-lg font-bold text-[var(--text)] hover:text-gold"
        >
          {author.name}
        </Link>
        {author.bio && (
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-mist-muted">{author.bio}</p>
        )}
      </div>
    </aside>
  );
}
