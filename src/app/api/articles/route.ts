import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isSectionSlug } from "@/lib/sections";
import { uniqueSlug } from "@/lib/slug";
import { z } from "zod";

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

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN"
      ? {}
      : { authorId: session.user.id };

  const articles = await prisma.article.findMany({
    where,
    include: { author: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = articleSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (!isSectionSlug(data.section)) {
    return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
  }

  const slug = await uniqueSlug(data.slug || data.title, async (s) => {
    const existing = await prisma.article.findUnique({ where: { slug: s } });
    return Boolean(existing);
  });

  const article = await prisma.article.create({
    data: {
      title: data.title,
      dek: data.dek,
      body: data.body,
      section: data.section,
      status: data.status,
      featured: session.user.role === "ADMIN" ? Boolean(data.featured) : false,
      breaking: session.user.role === "ADMIN" ? Boolean(data.breaking) : false,
      imageUrl: data.imageUrl || null,
      slug,
      authorId: session.user.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
