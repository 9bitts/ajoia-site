export class SocialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocialError";
  }
}

export class TokenExpired extends SocialError {}

export function publicError(error: unknown, fallback: string) {
  if (error instanceof SocialError) return error.message.slice(0, 300);
  return fallback;
}

export function safeDetail(error: unknown) {
  const message = publicError(error, "")
    .replace(/access_token[=: ]\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!message || /secret|bearer|eyJ/i.test(message)) return "";
  return message.slice(0, 180);
}
