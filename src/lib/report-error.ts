export function reportError(error: unknown, context: string) {
  const raw = error instanceof Error ? error.message : "erro";
  const message = raw.replace(/[\w.+-]+@[\w.-]+/g, "[email]").slice(0, 500);
  console.error(context, message);

  const url = process.env.ERROR_WEBHOOK_URL?.trim();
  if (!url) return;

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context,
      message,
      at: new Date().toISOString(),
    }),
  }).catch(() => undefined);
}
