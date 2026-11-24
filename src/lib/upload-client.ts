import { BODY_TOO_LARGE, fileTooLargeMessage } from "@/lib/upload-limits";

export async function uploadMedia(file: File) {
  const tooLarge = fileTooLargeMessage(file);
  if (tooLarge) throw new Error(tooLarge);

  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  let json: { error?: string; url?: string } = {};
  try {
    json = await res.json();
  } catch {
    throw new Error(BODY_TOO_LARGE);
  }
  if (!res.ok || !json.url) throw new Error(json.error || BODY_TOO_LARGE);
  return String(json.url);
}
