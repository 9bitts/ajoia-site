import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true, approved: true } },
    },
  });
  if (!article) notFound();

  if (
    session.user.role !== "ADMIN" &&
    article.authorId !== session.user.id
  ) {
    redirect("/admin");
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { approved: true },
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
        Artigos
      </p>
      <h1 className="mt-2 font-display text-4xl text-white">Editar artigo</h1>
      <div className="mt-8">
        <ArticleForm
          mode="edit"
          articleId={article.id}
          isAdmin={session.user.role === "ADMIN"}
          accountApproved={session.user.role === "ADMIN" || Boolean(me?.approved)}
          author={article.author}
          initial={{
            title: article.title,
            dek: article.dek,
            body: article.body,
            section: article.section,
            status: article.status,
            featured: article.featured,
            breaking: article.breaking,
            imageUrl: article.imageUrl,
          }}
        />
      </div>
    </div>
  );
}
