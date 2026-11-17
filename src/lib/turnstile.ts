export function readTurnstileToken(data: {
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
}) {
  return data.turnstileToken || data["cf-turnstile-response"];
}

export async function turnstileError(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return null;
  if (!token?.trim()) return "Confirme que você não é um robô.";

  try {
    const body = new URLSearchParams({
      secret,
      response: token.trim(),
      remoteip: ip,
    });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    if (!json.success) return "Não foi possível confirmar o envio. Tente de novo.";
    return null;
  } catch {
    return "Não foi possível confirmar o envio. Tente de novo.";
  }
}
