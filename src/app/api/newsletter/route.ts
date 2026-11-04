import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/data/site";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(180),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  if (isRateLimited(`newsletter:${clientIp(req)}`)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente de novo em alguns minutos." },
      { status: 429 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, already: true });
  }

  await prisma.newsletterSubscriber.create({ data: { email } });

  await sendPortalMail({
    subject: "[Newsletter] nova assinatura",
    text: `${email} entrou na newsletter da ${siteConfig.name}.`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
