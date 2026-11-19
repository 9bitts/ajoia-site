import type { SectionSlug } from "@/lib/sections";

export const sectionImages: Record<SectionSlug, string> = {
  politica: "/images/sections/politica.jpg",
  editorial: "/images/sections/editorial.jpg",
  nacional: "/images/sections/estado.jpg",
  internacional: "/images/sections/mundo.jpg",
  cultura: "/images/sections/cultura.jpg",
  saude: "/images/sections/cultura.jpg",
  colunistas: "/images/sections/opiniao.jpg",
  "tema-livre": "/images/sections/tema-livre.jpg",
  ultimas: "/images/sections/tema-livre.jpg",
  opiniao: "/images/sections/opiniao.jpg",
  economia: "/images/sections/cidade.jpg",
  estado: "/images/sections/estado.jpg",
  cidade: "/images/sections/cidade.jpg",
  mundo: "/images/sections/mundo.jpg",
};

export function getSectionImage(section: SectionSlug) {
  return sectionImages[section];
}
