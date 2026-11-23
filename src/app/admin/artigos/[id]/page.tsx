import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { accountId } from "@/lib/account-id";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { SocialPublish } from "@/components/admin/SocialPublish";
import { prisma } from "@/lib/db";
import { sectionDefaultsToOpinion } from "@/lib/sections";
import { parseGalleryJson } from "@/lib/gallery";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  const userId = accountId(session);
  if (!session?.user || !userId) redirect("/admin/login");

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true, approved: true } },
      gallery: { orderBy: { position: "asc" } },
    },
  });
  if (!article) notFound();

  if (
    session.user.role !== "ADMIN" &&
    article.authorId !== userId
  ) {
    redirect("/admin");
  }

  const [me, revision] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { approved: true },
    }),
    prisma.articleRevision.findUnique({ where: { articleId: article.id } }),
  ]);
  const source = revision ?? article;

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
          hasProposal={Boolean(revision)}
          author={article.author}
          initial={{
            title: source.title,
            dek: source.dek,
            body: source.body,
            section: source.section,
            status: article.status,
            featured: article.featured,
            principal: article.principal,
            breaking: article.breaking,
            imageUrl: source.imageUrl,
            imageAlt: source.imageAlt,
            seoTitle: source.seoTitle,
            seoDescription: source.seoDescription,
            noindex: article.noindex,
            isOpinion:
              source.isOpinion ?? sectionDefaultsToOpinion(source.section),
            slug: source.slug,
            secondarySections: source.secondarySections,
            gallery: revision
              ? parseGalleryJson(revision.galleryJson)
              : article.gallery.map((item) => ({
                  url: item.url,
                  caption: item.caption,
                })),
          }}
        />
      </div>
      {session.user.role === "ADMIN" && (
        <div className="mt-12">
          <SocialPublish
            articleId={article.id}
            published={article.status === "PUBLISHED"}
          />
        </div>
      )}
    </div>
  );
}
