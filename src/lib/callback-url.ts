export function safeCallbackUrl(value: string | null | undefined) {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/admin";
  }
  if (value.startsWith("/admin/login") || value.startsWith("/admin/cadastro")) {
    return "/admin";
  }
  return value;
}
