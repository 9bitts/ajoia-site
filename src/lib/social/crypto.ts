import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { SocialError } from "@/lib/social/errors";

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new SocialError("AUTH_SECRET não está configurado.");
  return createHash("sha256").update(`ajoia-social-v1\0${secret}`).digest();
}

export function sealSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function openSeal(packed: string) {
  const buf = Buffer.from(packed, "base64url");
  if (buf.length < 29) {
    throw new SocialError("A conexão guardada não pôde ser lida. Conecte de novo em Redes.");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    throw new SocialError("A conexão guardada não pôde ser lida. Conecte de novo em Redes.");
  }
}
