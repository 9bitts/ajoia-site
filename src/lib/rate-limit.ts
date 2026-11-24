import { prisma } from "@/lib/db";
import { reportError } from "@/lib/report-error";

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return "local";
}

export async function isRateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  try {
    if (Math.random() < 0.02) {
      void prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => undefined);
    }
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row || row.resetAt <= now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return false;
    }
    if (row.count >= limit) return true;
    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return false;
  } catch (error) {
    reportError(error, "rate-limit");
    return true;
  }
}

const UPLOAD_MAX_COUNT = 15;
const UPLOAD_MAX_BYTES = 160 * 1024 * 1024;

export async function uploadOverQuota(userId: string, bytes: number) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.uploadEvent.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { bytes: true },
  });
  const total = recent.reduce((sum, item) => sum + item.bytes, 0);
  return recent.length >= UPLOAD_MAX_COUNT || total + bytes > UPLOAD_MAX_BYTES;
}

export async function recordUpload(userId: string, bytes: number) {
  await prisma.uploadEvent.create({ data: { userId, bytes } });
}
