import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { dropHandoff, readHandoff, saveMetaPage } from "@/lib/social/accounts";
import { publicError } from "@/lib/social/errors";
import { requireAdmin } from "@/lib/social/guard";
import { PAGES_COOKIE, cookieBase } from "@/lib/social/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  pageId: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const jar = await cookies();
  const handoffId = jar.get(PAGES_COOKIE)?.value || "";
  const pages = await readHandoff(handoffId);
  const page = pages?.find((item) => item.id === parsed.data.pageId);
  if (!page) {
    return NextResponse.json(
      { error: "A escolha da Página expirou. Conecte de novo." },
      { status: 400 }
    );
  }

  try {
    await saveMetaPage(page);
    await dropHandoff(handoffId);
    await recordAudit({
      action: "social.connect",
      actorId: gate.session.user.id,
      actorEmail: gate.session.user.email,
      targetType: "social",
      targetId: "META",
      detail: page.name.slice(0, 200),
      ip: clientIp(req),
    });
    const res = NextResponse.json({ ok: true, instagram: Boolean(page.instagram) });
    res.cookies.set(PAGES_COOKIE, "", cookieBase(0));
    return res;
  } catch (error) {
    return NextResponse.json(
      { error: publicError(error, "Não foi possível guardar a Página.") },
      { status: 400 }
    );
  }
}
