import { randomBytes } from "crypto";
import type { SocialNetwork } from "@prisma/client";
import { prisma } from "@/lib/db";
import { openSeal, sealSecret } from "@/lib/social/crypto";
import type { MetaPage } from "@/lib/social/meta";

export async function publicConnections() {
  const rows = await prisma.socialConnection.findMany();
  const pick = (network: SocialNetwork) => {
    const row = rows.find((item) => item.network === network);
    if (!row) return null;
    return { name: row.accountName };
  };
  return {
    FACEBOOK: pick("FACEBOOK"),
    INSTAGRAM: pick("INSTAGRAM"),
    X: pick("X"),
  };
}

export async function connectionToken(network: SocialNetwork) {
  const row = await prisma.socialConnection.findUnique({ where: { network } });
  if (!row) return null;
  return {
    network: row.network,
    accountId: row.accountId,
    accountName: row.accountName,
    accessToken: openSeal(row.accessToken),
    refreshToken: row.refreshToken ? openSeal(row.refreshToken) : null,
    expiresAt: row.expiresAt,
  };
}

export async function saveMetaPage(page: MetaPage) {
  const token = sealSecret(page.accessToken);
  await prisma.socialConnection.upsert({
    where: { network: "FACEBOOK" },
    create: {
      network: "FACEBOOK",
      accountId: page.id,
      accountName: page.name,
      accessToken: token,
    },
    update: {
      accountId: page.id,
      accountName: page.name,
      accessToken: token,
      refreshToken: null,
      expiresAt: null,
    },
  });
  if (page.instagram) {
    await prisma.socialConnection.upsert({
      where: { network: "INSTAGRAM" },
      create: {
        network: "INSTAGRAM",
        accountId: page.instagram.id,
        accountName: page.instagram.username,
        accessToken: token,
      },
      update: {
        accountId: page.instagram.id,
        accountName: page.instagram.username,
        accessToken: token,
        refreshToken: null,
        expiresAt: null,
      },
    });
  } else {
    await prisma.socialConnection.deleteMany({ where: { network: "INSTAGRAM" } });
  }
}

export async function saveXAccount(input: {
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}) {
  const data = {
    accountId: input.accountId,
    accountName: input.accountName,
    accessToken: sealSecret(input.accessToken),
    refreshToken: input.refreshToken ? sealSecret(input.refreshToken) : null,
    expiresAt: input.expiresAt,
  };
  await prisma.socialConnection.upsert({
    where: { network: "X" },
    create: { network: "X", ...data },
    update: data,
  });
}

export async function updateXTokens(input: {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}) {
  await prisma.socialConnection.update({
    where: { network: "X" },
    data: {
      accessToken: sealSecret(input.accessToken),
      refreshToken: input.refreshToken ? sealSecret(input.refreshToken) : null,
      expiresAt: input.expiresAt,
    },
  });
}

export async function disconnectNetwork(target: "META" | "X") {
  if (target === "X") {
    await prisma.socialConnection.deleteMany({ where: { network: "X" } });
    return;
  }
  await prisma.socialConnection.deleteMany({
    where: { network: { in: ["FACEBOOK", "INSTAGRAM"] } },
  });
}

export async function putHandoff(pages: MetaPage[]) {
  const id = randomBytes(18).toString("base64url");
  await prisma.socialHandoff.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.socialHandoff.create({
    data: {
      id,
      payload: sealSecret(JSON.stringify(pages)),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return id;
}

export async function readHandoff(id: string) {
  if (!id || id.length > 80) return null;
  const row = await prisma.socialHandoff.findUnique({ where: { id } });
  if (!row || row.expiresAt < new Date()) return null;
  const pages = JSON.parse(openSeal(row.payload)) as MetaPage[];
  if (!Array.isArray(pages)) return null;
  return pages.filter(
    (page) => page && typeof page.id === "string" && typeof page.accessToken === "string"
  );
}

export async function publicHandoff(id: string) {
  const pages = await readHandoff(id);
  if (!pages) return null;
  return pages.map((page) => ({
    id: page.id,
    name: page.name,
    instagram: page.instagram?.username || null,
  }));
}

export async function dropHandoff(id: string) {
  if (!id) return;
  await prisma.socialHandoff.deleteMany({ where: { id } });
}
