import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function rememberSlug(
  tx: Prisma.TransactionClient,
  oldSlug: string,
  newSlug: string
) {
  if (!oldSlug || oldSlug === newSlug) return;
  const fromPath = `/artigo/${oldSlug}`;
  const toPath = `/artigo/${newSlug}`;
  await tx.redirect.deleteMany({
    where: { OR: [{ fromPath }, { fromPath: toPath }] },
  });
  await tx.redirect.updateMany({
    where: { toPath: fromPath },
    data: { toPath },
  });
  await tx.redirect.create({ data: { fromPath, toPath } });
}

export async function findRedirectTarget(fromPath: string) {
  let current = fromPath;
  const seen = new Set<string>();
  let target: string | null = null;

  for (let hop = 0; hop < 5; hop += 1) {
    if (seen.has(current)) break;
    seen.add(current);
    const row = await prisma.redirect.findUnique({ where: { fromPath: current } });
    if (!row) break;
    target = row.toPath;
    current = row.toPath;
  }

  return target;
}
