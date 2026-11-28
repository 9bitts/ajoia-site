export const siteConfig = {
  name: "Ajoia Brasil",
  shortName: "AJOIA",
  tagline: "Associação Brasileira de Jornalistas Independentes e Afiliados",
  description:
    "Portal de jornalismo independente com compromisso com os fatos, ética profissional e liberdade de expressão.",
  url: "https://ajoiabrasil.com.br",
  city: "Belo Horizonte",
  founded: "2025",
  president: "José Aparecido Ribeiro",
  email: "portal.ajoiabrasil@gmail.com",
  social: {
    facebook: "https://www.facebook.com/ajoiabrasil",
    twitter: "https://x.com/AjoiaBrasil",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
    instagram: "https://www.instagram.com/ajoiabr/",
  },
};

export const followLinks = [
  { id: "x", label: "X", href: "https://x.com/AjoiaBrasil" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/ajoiabr/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/ajoiabrasil" },
] as const;

export function sectionHref(slug: string) {
  if (slug === "colunistas") return "/colunistas";
  if (slug === "ultimas") return "/ultimas";
  return `/secao/${slug}`;
}

export const navSections = [
  { slug: "politica", label: "Política" },
  { slug: "editorial", label: "Editorial" },
  { slug: "nacional", label: "Nacional" },
  { slug: "internacional", label: "Internacional" },
  { slug: "cultura", label: "Cultura" },
  { slug: "saude", label: "Saúde" },
  { slug: "colunistas", label: "Colunistas" },
  { slug: "tema-livre", label: "Tema Livre" },
  { slug: "ultimas", label: "Últimas" },
  { slug: "opiniao", label: "Opinião" },
  { slug: "economia", label: "Economia" },
] as const;

export const institutionalLinks = [
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/responsabilidade-social", label: "Responsabilidade Social" },
  { href: "/diretrizes", label: "Diretrizes" },
  { href: "/expediente", label: "Expediente" },
  { href: "/midia-kit", label: "Mídia Kit" },
  { href: "/contato", label: "Contato" },
  { href: "/correcoes", label: "Correções" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/artigo/termos-de-uso", label: "Termos de uso" },
] as const;

export const missao =
  "Defender o livre exercício do jornalismo, resgatando suas origens profissionais, a ética e a moralidade do jornalismo brasileiro e valorizar o profissional jornalista. Repudiar restrições, condicionamentos ou controle sobre o exercício da profissão jornalística. Atuar como observatório da liberdade de imprensa e da liberdade de expressão.";

export const valores =
  "Ética, moralidade, disciplina e responsabilidade, respeitando a deontologia da profissão. Compromisso com os fatos e fiel aos acontecimentos ao reportá-los, honrando a confiança tácita entre o público e o jornalista.";

export const visao =
  "Respeitar, e fazer respeitar, o direito do livre pensamento e da liberdade de expressão, dar voz ao contraditório e assegurar espaço a todo e qualquer tema. Praticar o bom jornalismo é oxigenar a credibilidade da informação.";
