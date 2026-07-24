import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().default(""),
  roleLabel: z.string().default("Colunista"),
  featured: z.boolean().optional(),
  slug: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "COLUMNIST" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      bio: true,
      roleLabel: true,
      featured: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = userSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const slug = await uniqueSlug(data.slug || data.name, async (s) => {
    const found = await prisma.user.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      slug: slugify(slug),
      bio: data.bio,
      roleLabel: data.roleLabel,
      featured: Boolean(data.featured),
      role: "COLUMNIST",
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      bio: true,
      roleLabel: true,
      featured: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
