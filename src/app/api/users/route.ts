import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { passwordError } from "@/lib/password";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { slugify, uniqueSlug } from "@/lib/slug";

const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(10).max(200),
  bio: z.string().max(2000).default(""),
  roleLabel: z.string().max(80).default("Colunista"),
  featured: z.boolean().optional(),
  slug: z.string().max(80).optional(),
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
      approved: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json();
  const parsed = userSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const policy = passwordError(parsed.data.password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const data = parsed.data;
  const email = data.email.toLowerCase();
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
      approved: true,
      mustChangePassword: true,
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

  await recordAudit({
    action: "user.create",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "user",
    targetId: user.id,
    detail: user.email,
    ip: clientIp(req),
  });

  return NextResponse.json({ user }, { status: 201 });
}
