import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard";
import {
  getArticlesByAuthor,
  getColumnistBySlug,
} from "@/lib/articles";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);
  if (!columnist) return { title: "Colunista" };
  return {
    title: columnist.name,
    description: columnist.bio,
  };
}

export default async function ColumnistPage({ params }: Props) {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);
  if (!columnist) notFound();

  const posts = await getArticlesByAuthor(columnist.slug);

  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <Link href="/colunistas" className="btn-ghost">
        ← Todos os colunistas
      </Link>

      <header className="mt-8 grid gap-8 border-b border-[var(--line)] pb-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold font-display text-3xl text-[var(--text)]">
            {columnist.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
        <div className="md:col-span-9">
          <p className="kicker">{columnist.role}</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--text)] md:text-5xl">
            {columnist.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist-muted">
            {columnist.bio}
          </p>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="border-b-2 border-gold pb-1 font-display text-2xl text-[var(--text)]">
          Publicações
        </h2>
        {posts.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((article) => (
              <StoryCard key={article.slug} article={article} showDek />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-mist-muted">
            Em breve, novos textos deste colunista.
          </p>
        )}
      </section>
    </div>
  );
}
