import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().default(""),
  roleLabel: z.string().default("Jornalista"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const slug = await uniqueSlug(data.name, async (s) => {
    const found = await prisma.user.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      passwordHash,
      slug: slugify(slug),
      bio: data.bio,
      roleLabel: data.roleLabel.trim() || "Jornalista",
      role: "COLUMNIST",
      active: true,
      approved: false,
      featured: false,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      message:
        "Conta criada. Entre com seu e-mail para escrever. A administração precisa liberar sua conta e aprovar cada matéria antes da publicação.",
    },
    { status: 201 }
  );
}
