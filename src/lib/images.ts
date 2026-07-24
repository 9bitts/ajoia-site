import type { SectionSlug } from "@/lib/sections";

export const sectionImages: Record<SectionSlug, string> = {
  politica: "/images/sections/politica.jpg",
  estado: "/images/sections/estado.jpg",
  cidade: "/images/sections/cidade.jpg",
  mundo: "/images/sections/mundo.jpg",
  cultura: "/images/sections/cultura.jpg",
  opiniao: "/images/sections/opiniao.jpg",
  editorial: "/images/sections/editorial.jpg",
  "tema-livre": "/images/sections/tema-livre.jpg",
};

export function getSectionImage(section: SectionSlug) {
  return sectionImages[section];
}
