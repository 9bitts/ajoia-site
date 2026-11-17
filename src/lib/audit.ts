import { prisma } from "@/lib/db";
import { reportError } from "@/lib/report-error";

export async function recordAudit(entry: {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  detail?: string | null;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action.slice(0, 80),
        actorId: entry.actorId || null,
        actorEmail: entry.actorEmail || null,
        targetType: entry.targetType || null,
        targetId: entry.targetId || null,
        detail: entry.detail?.slice(0, 200) || null,
        ip: entry.ip || null,
      },
    });
  } catch (error) {
    reportError(error, "audit");
  }
}
