import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { articleInputSchema, articleSeoData } from "@/lib/article-input";
import { sanitizeStoredBody } from "@/lib/article-html";
import { syncArticleSurfaces } from "@/lib/article-publish";
import { recordAudit } from "@/lib/audit";
import { accountId } from "@/lib/account-id";
import { prisma } from "@/lib/db";
import { resolveArticleStatus } from "@/lib/editorial";
import { imageUrlError } from "@/lib/image-url";
import { sendPortalMail } from "@/lib/mail";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { publishSeoError } from "@/lib/seo-rules";
import { isSectionSlug } from "@/lib/sections";
import { uniqueSlug } from "@/lib/slug";

export async function GET() {
  const session = await auth();
  const id = accountId(session);
  if (!session?.user || !id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const where =
    session.user.role === "ADMIN"
      ? {}
      : { authorId: id };

  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { name: true, email: true, slug: true, approved: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  const id = accountId(session);
  if (!session?.user || !id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = articleInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const imageError = imageUrlError(data.imageUrl);
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });
  if (!isSectionSlug(data.section)) {
    return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
  }

  const resolved = await resolveArticleStatus({
    role: session.user.role,
    userId: id,
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

  const slug = await uniqueSlug(data.slug || data.title, async (s) => {
    const existing = await prisma.article.findUnique({ where: { slug: s } });
    return Boolean(existing);
  });

  const article = await prisma.article.create({
    data: {
      title: data.title,
      dek: data.dek,
      body: sanitizeStoredBody(data.body),
      section: data.section,
      status: resolved.status,
      featured: session.user.role === "ADMIN" ? Boolean(data.featured) : false,
      breaking: session.user.role === "ADMIN" ? Boolean(data.breaking) : false,
      imageUrl: data.imageUrl || null,
      slug,
      authorId: id,
      publishedAt: resolved.status === "PUBLISHED" ? new Date() : null,
      ...articleSeoData(data, session.user.role),
    },
    include: { author: { select: { slug: true } } },
  });

  syncArticleSurfaces({
    slug: article.slug,
    section: article.section,
    authorSlug: article.author.slug,
    status: article.status,
  });

  if (article.status === "PUBLISHED") {
    await recordAudit({
      action: "article.publish",
      actorId: id,
      actorEmail: session.user.email,
      targetType: "article",
      targetId: article.id,
      detail: article.slug,
      ip: clientIp(req),
    });
    void sendPortalMail({
      subject: `[Publicação] ${article.title}`,
      text: `${session.user.name} publicou ${article.slug}.`,
    });
  }

  return NextResponse.json({ article }, { status: 201 });
}
