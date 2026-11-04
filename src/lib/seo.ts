import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import type { PublicArticle } from "@/lib/articles";
import { sectionMeta, type SectionSlug } from "@/lib/sections";
import { absoluteUrl, organizationSameAs, siteUrl } from "@/lib/site-url";

export function organizationNode() {
  const url = siteUrl();
  const sameAs = organizationSameAs();
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${url}/#organization`,
    name: siteConfig.name,
    url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/logo-ajoia.png"),
    },
    email: siteConfig.email,
    foundingDate: siteConfig.founded,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressCountry: "BR",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteNode() {
  const url = siteUrl();
  return {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "pt-BR",
    publisher: { "@id": `${url}/#organization` },
  };
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode()],
  };
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path,
      locale: "pt_BR",
      type: "website",
      siteName: siteConfig.name,
    },
  };
}

function searchHeadline(article: PublicArticle) {
  return article.seoTitle.trim() || article.title;
}

function searchDescription(article: PublicArticle) {
  return article.seoDescription.trim() || article.dek;
}

export function articleMetadata(article: PublicArticle): Metadata {
  const path = `/artigo/${article.slug}`;
  const title = searchHeadline(article);
  const description = searchDescription(article);
  const section = sectionMeta[article.section];
  const image = article.image
    ? [{ url: article.image, alt: article.imageAlt || article.title }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": [
          { url: "/feed.xml", title: siteConfig.name },
          {
            url: `/secao/${article.section}/feed.xml`,
            title: section.label,
          },
        ],
      },
    },
    robots: article.noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      siteName: siteConfig.name,
      locale: "pt_BR",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.authorName],
      section: section.label,
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export function articleJsonLd(article: PublicArticle) {
  const url = siteUrl();
  const pageUrl = absoluteUrl(`/artigo/${article.slug}`);
  const section = sectionMeta[article.section];

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: url },
          {
            "@type": "ListItem",
            position: 2,
            name: section.label,
            item: absoluteUrl(`/secao/${article.section}`),
          },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
        ],
      },
      {
        "@type": "NewsArticle",
        headline: article.title,
        description: article.dek,
        ...(article.image ? { image: [absoluteUrl(article.image)] } : {}),
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        articleSection: section.label,
        ...(article.isOpinion ? { genre: "Opinião" } : {}),
        mainEntityOfPage: pageUrl,
        author: {
          "@type": "Person",
          name: article.authorName,
          url: absoluteUrl(`/colunistas/${article.authorSlug}`),
        },
        publisher: { "@id": `${url}/#organization` },
      },
    ],
  };
}

export function sectionJsonLd(section: SectionSlug) {
  const meta = sectionMeta[section];
  const url = siteUrl();
  const pageUrl = absoluteUrl(`/secao/${section}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      websiteNode(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: url },
          { "@type": "ListItem", position: 2, name: meta.label, item: pageUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        name: meta.label,
        description: meta.description,
        url: pageUrl,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${url}/#website` },
      },
    ],
  };
}

export function columnistJsonLd(columnist: {
  slug: string;
  name: string;
  role: string;
  bio: string;
}) {
  const url = siteUrl();
  const pageUrl = absoluteUrl(`/colunistas/${columnist.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Colunistas",
            item: absoluteUrl("/colunistas"),
          },
          { "@type": "ListItem", position: 3, name: columnist.name, item: pageUrl },
        ],
      },
      {
        "@type": "ProfilePage",
        url: pageUrl,
        inLanguage: "pt-BR",
        mainEntity: {
          "@type": "Person",
          name: columnist.name,
          description: columnist.bio,
          jobTitle: columnist.role,
          url: pageUrl,
          worksFor: { "@id": `${url}/#organization` },
        },
      },
    ],
  };
}
