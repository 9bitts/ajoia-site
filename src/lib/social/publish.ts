import { absoluteUrl } from "@/lib/site-url";
import {
  connectionToken,
  updateXTokens,
} from "@/lib/social/accounts";
import { finalizePost, type SocialNetwork } from "@/lib/social/copy";
import { SocialError, TokenExpired } from "@/lib/social/errors";
import { postToFacebook, postToInstagram } from "@/lib/social/meta";
import { createXPost, refreshX } from "@/lib/social/x";

async function readyX() {
  const conn = await connectionToken("X");
  if (!conn) throw new SocialError("O X ainda não está conectado. Abra Redes e conecte.");
  if (!conn.expiresAt || conn.expiresAt.getTime() > Date.now() + 60_000) return conn;
  return renewX(conn);
}

async function renewX(conn: {
  accountName: string;
  refreshToken: string | null;
}) {
  if (!conn.refreshToken) {
    throw new SocialError("A sessão do X expirou. Conecte de novo em Redes.");
  }
  const next = await refreshX(conn.refreshToken);
  const expiresAt = next.expires_in ? new Date(Date.now() + next.expires_in * 1000) : null;
  const refreshToken = next.refresh_token || conn.refreshToken;
  await updateXTokens({
    accessToken: next.access_token,
    refreshToken,
    expiresAt,
  });
  return {
    accountName: conn.accountName,
    accessToken: next.access_token,
    refreshToken,
    expiresAt,
  };
}

export async function publishToNetwork(input: {
  network: SocialNetwork;
  text: string;
  url: string;
  imageUrl: string | null;
}) {
  const text = finalizePost(input.network, input.text, input.url);
  if (!text) throw new SocialError("Escreva o texto antes de publicar.");

  if (input.network === "FACEBOOK") {
    const conn = await connectionToken("FACEBOOK");
    if (!conn) throw new SocialError("O Facebook ainda não está conectado. Abra Redes e conecte.");
    const posted = await postToFacebook(conn.accountId, conn.accessToken, text, input.url);
    return { ...posted, text };
  }

  if (input.network === "INSTAGRAM") {
    const conn = await connectionToken("INSTAGRAM");
    if (!conn) {
      throw new SocialError(
        "O Instagram ainda não está conectado. A conta precisa ser profissional e estar vinculada à Página."
      );
    }
    if (!input.imageUrl) {
      throw new SocialError("O Instagram exige a foto de capa da matéria.");
    }
    const image = absoluteUrl(input.imageUrl);
    if (!image.startsWith("https://")) {
      throw new SocialError(
        "O Instagram só baixa a foto com o site em https. Publique a partir do portal no ar."
      );
    }
    const posted = await postToInstagram(conn.accountId, conn.accessToken, image, text);
    return { ...posted, text };
  }

  let conn = await readyX();
  try {
    const posted = await createXPost(conn.accessToken, text, conn.accountName);
    return { ...posted, text };
  } catch (error) {
    if (!(error instanceof TokenExpired) || !conn.refreshToken) throw error;
    conn = await renewX(conn);
    const posted = await createXPost(conn.accessToken, text, conn.accountName);
    return { ...posted, text };
  }
}
