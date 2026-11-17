export function graphVersion() {
  const value = process.env.META_GRAPH_VERSION || "v25.0";
  return /^v\d+\.\d+$/.test(value) ? value : "v25.0";
}

export function metaConfig() {
  const appId = process.env.META_APP_ID?.trim() || "";
  const appSecret = process.env.META_APP_SECRET?.trim() || "";
  if (!appId || !appSecret) return null;
  return {
    appId,
    appSecret,
    configId: process.env.META_CONFIG_ID?.trim() || "",
  };
}

export function xConfig() {
  const clientId = process.env.X_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.X_CLIENT_SECRET?.trim() || "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function aiConfig() {
  const apiKey = process.env.SOCIAL_AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.SOCIAL_AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.SOCIAL_AI_MODEL?.trim() || "gpt-4o-mini",
  };
}

export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
].join(",");
