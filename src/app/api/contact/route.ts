import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendPortalMail } from "@/lib/mail";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().min(2).max(180),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  if (isRateLimited(`contact:${clientIp(req)}`)) {
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

  const { name, subject, message } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  await sendPortalMail({
    replyTo: email,
    subject: `[Contato] ${subject}`,
    text: [`Nome: ${name}`, `E-mail: ${email}`, "", message].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
