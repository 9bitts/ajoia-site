import { readFileSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Author = {
  slug: string;
  name: string;
  email: string;
  roleLabel: string;
};

type ArticleRow = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  section: string;
  authorSlug: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string | null;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  isOpinion: boolean;
};

async function main() {
  const file = path.join(process.cwd(), "scripts", "import-ready.json");
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    authors: Author[];
    articles: ArticleRow[];
  };

  const passwordHash = await bcrypt.hash(
    `import-${Date.now()}-nao-usar`,
    10
  );
  const authorIds = new Map<string, string>();

  for (const author of data.authors) {
    const existing = await prisma.user.findUnique({
      where: { slug: author.slug },
    });
    if (existing) {
      authorIds.set(author.slug, existing.id);
      continue;
    }
    const byEmail = await prisma.user.findUnique({
      where: { email: author.email },
    });
    if (byEmail) {
      authorIds.set(author.slug, byEmail.id);
      continue;
    }
    const created = await prisma.user.create({
      data: {
        email: author.email,
        passwordHash,
        name: author.name,
        slug: author.slug,
        role: "COLUMNIST",
        roleLabel: author.roleLabel,
        bio: "",
        featured: false,
        active: true,
        approved: true,
      },
    });
    authorIds.set(author.slug, created.id);
  }

  let written = 0;
  for (const article of data.articles) {
    const authorId = authorIds.get(article.authorSlug);
    if (!authorId) {
      console.warn("sem autor", article.slug);
      continue;
    }
    const publishedAt = new Date(article.publishedAt);
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        dek: article.dek,
        body: article.body,
        section: article.section,
        status: "PUBLISHED",
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        isOpinion: article.isOpinion,
        authorId,
        publishedAt,
        noindex: false,
      },
      create: {
        slug: article.slug,
        title: article.title,
        dek: article.dek,
        body: article.body,
        section: article.section,
        status: "PUBLISHED",
        featured: false,
        breaking: false,
        imageUrl: article.imageUrl,
        imageAlt: article.imageAlt,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        isOpinion: article.isOpinion,
        authorId,
        publishedAt,
        noindex: false,
      },
    });
    written += 1;
    if (written % 50 === 0) console.log("articles", written);
  }

  console.log("import ok", written, "authors", authorIds.size);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
