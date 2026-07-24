export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
) {
  let slug = slugify(base) || "artigo";
  let n = 1;
  while (await exists(slug)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}
