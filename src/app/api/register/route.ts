import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { passwordError } from "@/lib/password";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { slugify, uniqueSlug } from "@/lib/slug";
import { readTurnstileToken, turnstileError } from "@/lib/turnstile";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  password: z.string().min(10).max(200),
  bio: z.string().max(2000).default(""),
  roleLabel: z.string().max(80).default("Jornalista"),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
  "cf-turnstile-response": z.string().optional(),
});

const PENDING_MESSAGE =
  "Pedido recebido. A administração precisa liberar a conta antes do primeiro acesso.";

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const ip = clientIp(req);
  if (await isRateLimited(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente de novo mais tarde." },
      { status: 429 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true, message: PENDING_MESSAGE }, { status: 201 });
  }

  const captcha = await turnstileError(readTurnstileToken(parsed.data), ip);
  if (captcha) return NextResponse.json({ error: captcha }, { status: 400 });

  const policy = passwordError(parsed.data.password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, message: PENDING_MESSAGE }, { status: 201 });
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
      active: false,
      approved: false,
      featured: false,
      mustChangePassword: false,
    },
  });

  await sendPortalMail({
    replyTo: email,
    subject: "[Redação] novo cadastro de jornalista",
    text: [
      `Nome: ${data.name.trim()}`,
      `E-mail: ${email}`,
      `Função: ${data.roleLabel.trim() || "Jornalista"}`,
      "",
      "A conta nasce sem acesso. Libere em Contas para a pessoa poder entrar.",
    ].join("\n"),
  });

  await sendPortalMail({
    to: email,
    subject: "Cadastro recebido — Ajoia Brasil",
    text: [
      `Olá, ${data.name.trim()}.`,
      "",
      "Recebemos o pedido de acesso à redação. A conta só entra no ar depois que a administração liberar.",
      "Até lá, o login não abre.",
    ].join("\n"),
  });

  return NextResponse.json({ ok: true, message: PENDING_MESSAGE }, { status: 201 });
}
