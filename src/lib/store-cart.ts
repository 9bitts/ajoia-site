export type CartLine = {
  slug: string;
  quantity: number;
};

const KEY = "ajoia-livraria-sacola";

function clean(lines: unknown): CartLine[] {
  if (!Array.isArray(lines)) return [];
  const out: CartLine[] = [];
  for (const line of lines) {
    if (!line || typeof line !== "object") continue;
    const slug = String((line as { slug?: unknown }).slug || "").trim();
    const quantity = Math.min(
      99,
      Math.max(1, Math.floor(Number((line as { quantity?: unknown }).quantity) || 1)),
    );
    if (!slug) continue;
    const existing = out.find((item) => item.slug === slug);
    if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
    else out.push({ slug, quantity });
  }
  return out.slice(0, 30);
}

export function readCart() {
  if (typeof window === "undefined") return [];
  try {
    return clean(JSON.parse(window.localStorage.getItem(KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(clean(lines)));
  window.dispatchEvent(new Event("ajoia-sacola"));
}

export function addToCart(slug: string) {
  const lines = readCart();
  const found = lines.find((line) => line.slug === slug);
  if (found) found.quantity = Math.min(99, found.quantity + 1);
  else lines.push({ slug, quantity: 1 });
  writeCart(lines);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
