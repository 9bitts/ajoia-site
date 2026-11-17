import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAudit } from "@/lib/audit";
import { clientIp } from "@/lib/rate-limit";
import { disconnectNetwork } from "@/lib/social/accounts";
import { requireAdmin } from "@/lib/social/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  target: z.enum(["META", "X"]),
});

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  await disconnectNetwork(parsed.data.target);
  await recordAudit({
    action: "social.disconnect",
    actorId: gate.session.user.id,
    actorEmail: gate.session.user.email,
    targetType: "social",
    targetId: parsed.data.target,
    ip: clientIp(req),
  });
  return NextResponse.json({ ok: true });
}
