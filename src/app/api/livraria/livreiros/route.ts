import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { passwordError } from "@/lib/password";
import { clientIp } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { uniqueSlug } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(10).max(200),
});

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const policy = passwordError(parsed.data.password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });

  const slug = await uniqueSlug(parsed.data.name, async (candidate) => {
    const found = await prisma.user.findUnique({ where: { slug: candidate }, select: { id: true } });
    return Boolean(found);
  });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      slug,
      role: "LIVREIRO",
      roleLabel: "Livreiro",
      active: true,
      approved: true,
      mustChangePassword: true,
    },
    select: { id: true, name: true, email: true },
  });

  await recordAudit({
    action: "user.create",
    actorId: session.user.id,
    actorEmail: session.user.email,
    targetType: "user",
    targetId: user.id,
    detail: `livreiro ${user.email}`,
    ip: clientIp(req),
  });

  return NextResponse.json({ user }, { status: 201 });
}
