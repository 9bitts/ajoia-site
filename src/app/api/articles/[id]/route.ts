import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isSectionSlug } from "@/lib/sections";
import { slugify } from "@/lib/slug";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const articleSchema = z.object({
  title: z.string().min(3),
  dek: z.string().default(""),
  body: z.string().min(10),
  section: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean().optional(),
  breaking: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  slug: z.string().optional(),
});

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
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!(await canEdit(existing.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = articleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  if (!isSectionSlug(data.section)) {
    return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
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
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      dek: data.dek,
      body: data.body,
      section: data.section,
      status: data.status,
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
        : data.status === "DRAFT"
          ? null
          : existing.publishedAt,
    },
  });

  return NextResponse.json({ article });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  if (!(await canEdit(existing.authorId, session.user.id, session.user.role))) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
