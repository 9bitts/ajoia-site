import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { purgeExpiredPersonalData } from "@/lib/retention";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/same-origin";
import { readTurnstileToken, turnstileError } from "@/lib/turnstile";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().min(2).max(180),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
  "cf-turnstile-response": z.string().optional(),
});

export async function POST(req: Request) {
  const origin = rejectCrossOrigin(req);
  if (origin) return origin;

  const ip = clientIp(req);
  if (await isRateLimited(`contact:${ip}`)) {
    return NextResponse.json(
      { error: "Muitas mensagens em pouco tempo. Tente de novo em alguns minutos." },
      { status: 429 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revise os campos e tente de novo." }, { status: 400 });
  }

  if (parsed.data.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const captcha = await turnstileError(readTurnstileToken(parsed.data), ip);
  if (captcha) return NextResponse.json({ error: captcha }, { status: 400 });

  const { name, subject, message } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  await prisma.contactMessage.create({
    data: { name, email, subject: subject.replace(/[\r\n]+/g, " "), message },
  });

  void purgeExpiredPersonalData().catch(() => undefined);

  await sendPortalMail({
    replyTo: email,
    subject: `[Contato] ${subject}`,
    text: [`Nome: ${name}`, `E-mail: ${email}`, "", message].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
