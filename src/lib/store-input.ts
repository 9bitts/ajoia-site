import { imageUrlError } from "@/lib/image-url";

export const storeKinds = ["LIVRO", "OUTRO"] as const;
export const storeStatuses = ["DRAFT", "PUBLISHED"] as const;
export const bookBindings = ["BROCHURA", "DURA", "POCKET"] as const;

export type StoreKind = (typeof storeKinds)[number];
export type StoreStatus = (typeof storeStatuses)[number];
export type BookBindingValue = (typeof bookBindings)[number];

export type StoreItemInput = {
  kind: StoreKind;
  name: string;
  slug: string;
  synopsis: string;
  description: string;
  priceCents: number;
  stock: number | null;
  coverUrl: string | null;
  coverAlt: string;
  status: StoreStatus;
  featured: boolean;
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  isbn13: string | null;
  authors: string;
  publisher: string;
  edition: string;
  year: number | null;
  pages: number | null;
  language: string;
  binding: BookBindingValue | null;
  categoryId: string | null;
};

function text(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function isOneOf<T extends string>(value: string, options: readonly T[]): value is T {
  return (options as readonly string[]).includes(value);
}

function whole(value: unknown, min: number, max: number) {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < min || n > max) return undefined;
  return n;
}

export function isbnDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isbn13Error(value: string) {
  const digits = isbnDigits(value);
  if (digits.length !== 13) return "O ISBN precisa ter 13 dígitos.";
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  if (check !== Number(digits[12])) return "ISBN-13 inválido.";
  return null;
}

export function parsePriceCents(value: unknown) {
  const raw = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$/i, "");
  if (!raw) return undefined;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) return undefined;
  return Math.round(amount * 100);
}

export function parseStoreItem(
  input: unknown,
  mode: "create" | "update",
): { data: StoreItemInput } | { error: string } {
  if (!input || typeof input !== "object") return { error: "Dados inválidos." };
  const body = input as Record<string, unknown>;

  const kind = text(body.kind, 20);
  if (!isOneOf(kind, storeKinds)) return { error: "Escolha livro ou outro item." };

  const name = text(body.name, 180);
  if (name.length < 2) return { error: "O nome precisa ter pelo menos 2 caracteres." };

  const status = text(body.status, 20) || "DRAFT";
  if (!isOneOf(status, storeStatuses)) return { error: "Situação inválida." };

  const priceCents = parsePriceCents(body.price);
  if (priceCents === undefined) return { error: "Informe um preço válido." };

  let stock: number | null = null;
  if (mode === "create" || body.stock !== undefined) {
    const parsed = whole(body.stock, 0, 100_000);
    if (parsed === undefined || parsed === null) return { error: "Estoque inválido." };
    stock = parsed;
  }

  const coverUrl = text(body.coverUrl, 300) || null;
  const coverProblem = imageUrlError(coverUrl);
  if (coverProblem) return { error: coverProblem };

  const weight = whole(body.weightGrams, 0, 100_000);
  const width = whole(body.widthCm, 0, 500);
  const height = whole(body.heightCm, 0, 500);
  const depth = whole(body.depthCm, 0, 500);
  if (weight === undefined) return { error: "Peso inválido." };
  if (width === undefined) return { error: "Largura inválida." };
  if (height === undefined) return { error: "Altura inválida." };
  if (depth === undefined) return { error: "Profundidade inválida." };

  const year = whole(body.year, 1000, 2100);
  if (year === undefined) return { error: "Ano inválido." };
  const pages = whole(body.pages, 1, 20_000);
  if (pages === undefined) return { error: "Número de páginas inválido." };

  const bindingRaw = text(body.binding, 20);
  if (bindingRaw && !isOneOf(bindingRaw, bookBindings)) return { error: "Tipo de capa inválido." };

  const categoryId = text(body.categoryId, 40) || null;

  const data: StoreItemInput = {
    kind,
    name,
    slug: text(body.slug, 80),
    synopsis: text(body.synopsis, 300),
    description: text(body.description, 8000),
    priceCents,
    stock,
    coverUrl,
    coverAlt: text(body.coverAlt, 180),
    status,
    featured: Boolean(body.featured),
    weightGrams: weight ?? 0,
    widthCm: width ?? 0,
    heightCm: height ?? 0,
    depthCm: depth ?? 0,
    isbn13: null,
    authors: "",
    publisher: "",
    edition: "",
    year: null,
    pages: null,
    language: "",
    binding: null,
    categoryId,
  };

  if (kind === "LIVRO") {
    const isbn = text(body.isbn13, 20);
    const isbnProblem = isbn13Error(isbn);
    if (isbnProblem) return { error: isbnProblem };
    data.isbn13 = isbnDigits(isbn);
    data.authors = text(body.authors, 240);
    data.publisher = text(body.publisher, 160);
    data.edition = text(body.edition, 40);
    data.year = year;
    data.pages = pages;
    data.language = text(body.language, 40) || "Português";
    data.binding = bindingRaw ? (bindingRaw as BookBindingValue) : null;
    if (!data.authors) return { error: "Informe o autor do livro." };
  }

  return { data };
}

export function parseCategory(input: unknown): { name: string; description: string } | { error: string } {
  if (!input || typeof input !== "object") return { error: "Dados inválidos." };
  const body = input as Record<string, unknown>;
  const name = text(body.name, 80);
  if (name.length < 2) return { error: "A categoria precisa ter pelo menos 2 caracteres." };
  return { name, description: text(body.description, 300) };
}

export function parseStock(input: unknown): { stock: number; note: string } | { error: string } {
  if (!input || typeof input !== "object") return { error: "Dados inválidos." };
  const body = input as Record<string, unknown>;
  const stock = whole(body.stock, 0, 100_000);
  if (stock === undefined || stock === null) return { error: "Estoque inválido." };
  return { stock, note: text(body.note, 120) };
}
