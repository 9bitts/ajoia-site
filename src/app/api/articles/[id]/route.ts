import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { articleInputSchema, articleSeoData } from "@/lib/article-input";
import { syncArticleSurfaces } from "@/lib/article-publish";
import { prisma } from "@/lib/db";
import { resolveArticleStatus } from "@/lib/editorial";
import { rememberSlug } from "@/lib/redirects";
import { publishSeoError } from "@/lib/seo-rules";
import { isSectionSlug } from "@/lib/sections";
import { slugify } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

async function canEdit(articleAuthorId: string, userId: string, role: string) {
  return role === "ADMIN" || articleAuthorId === userId;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true, slug: true } } },
  });

  if (!article) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (!(await canEdit(article.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json({ article });
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!(await canEdit(existing.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = articleInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  if (!isSectionSlug(data.section)) {
    return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
  }

  const resolved = await resolveArticleStatus({
    role: session.user.role,
    userId: session.user.id,
    requested: data.status,
  });
  if ("error" in resolved) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.statusCode }
    );
  }

  const seoError = publishSeoError({
    status: resolved.status,
    dek: data.dek,
    imageAlt: data.imageAlt,
  });
  if (seoError) {
    return NextResponse.json({ error: seoError }, { status: 400 });
  }

  let slug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    const candidate = slugify(data.slug);
    const taken = await prisma.article.findFirst({
      where: { slug: candidate, NOT: { id } },
    });
    if (taken) {
      return NextResponse.json({ error: "Slug já em uso" }, { status: 409 });
    }
    slug = candidate;
  }

  const becomingPublished =
    resolved.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  const article = await prisma.$transaction(async (tx) => {
    if (slug !== existing.slug && existing.status === "PUBLISHED") {
      await rememberSlug(tx, existing.slug, slug);
    }
    return tx.article.update({
      where: { id },
      data: {
        title: data.title,
        dek: data.dek,
        body: data.body,
        section: data.section,
        status: resolved.status,
        slug,
        imageUrl: data.imageUrl ?? null,
        featured:
          session.user.role === "ADMIN"
            ? Boolean(data.featured)
            : existing.featured,
        breaking:
          session.user.role === "ADMIN"
            ? Boolean(data.breaking)
            : existing.breaking,
        publishedAt: becomingPublished
          ? new Date()
          : resolved.status === "PUBLISHED"
            ? existing.publishedAt
            : null,
        ...articleSeoData(data, session.user.role, existing.noindex),
      },
    });
  });

  syncArticleSurfaces({
    slug: article.slug,
    previousSlug: existing.slug,
    section: article.section,
    previousSection: existing.section,
    authorSlug: existing.author.slug,
    status: article.status,
  });

  return NextResponse.json({ article });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!(await canEdit(existing.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  if (
    session.user.role !== "ADMIN" &&
    existing.status === "PUBLISHED"
  ) {
    return NextResponse.json(
      { error: "Matéria publicada só pode ser retirada pela administração." },
      { status: 403 }
    );
  }

  await prisma.article.delete({ where: { id } });
  syncArticleSurfaces({
    slug: existing.slug,
    section: existing.section,
    authorSlug: existing.author.slug,
    status: "DRAFT",
  });
  return NextResponse.json({ ok: true });
}
