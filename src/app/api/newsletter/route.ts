import { NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/data/site";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { purgeExpiredPersonalData } from "@/lib/retention";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { absoluteUrl } from "@/lib/site-url";
import { randomToken } from "@/lib/tokens";
import { readTurnstileToken, turnstileError } from "@/lib/turnstile";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(180),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
  "cf-turnstile-response": z.string().optional(),
});

const PENDING =
  "Se o e-mail for válido e ainda não estiver na lista, enviamos um link de confirmação.";

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const ip = clientIp(req);
  if (await isRateLimited(`newsletter:${ip}`)) {
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
    return NextResponse.json({ ok: true, message: PENDING });
  }

  const captcha = await turnstileError(readTurnstileToken(parsed.data), ip);
  if (captcha) return NextResponse.json({ error: captcha }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing?.confirmed) {
    return NextResponse.json({ ok: true, message: PENDING });
  }

  const confirmToken = randomToken();
  const unsubToken = existing?.unsubToken || randomToken();
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      confirmed: false,
      confirmToken,
      unsubToken,
    },
    update: {
      confirmed: false,
      confirmToken,
      unsubToken,
    },
  });

  const confirmUrl = absoluteUrl(`/newsletter/confirmar?token=${confirmToken}`);
  const sent = await sendPortalMail({
    to: email,
    subject: `Confirme sua inscrição — ${siteConfig.name}`,
    text: [
      `Para entrar na newsletter da ${siteConfig.name}, abra este link:`,
      confirmUrl,
      "",
      "Se você não pediu esta inscrição, ignore o e-mail.",
    ].join("\n"),
  });

  if (!sent.sent) {
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail de confirmação agora." },
      { status: 503 }
    );
  }

  void purgeExpiredPersonalData().catch(() => undefined);
  return NextResponse.json({ ok: true, message: PENDING }, { status: 201 });
}
