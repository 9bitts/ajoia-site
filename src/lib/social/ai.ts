import { aiConfig } from "@/lib/social/config";
import {
  composePost,
  finalizePost,
  hashtagsFor,
  plainText,
  type SocialNetwork,
} from "@/lib/social/copy";
import { SocialError } from "@/lib/social/errors";

const NOTES: Record<SocialNetwork, string> = {
  X: "Rede X. Até 240 caracteres. Uma ou duas frases com o fato central. Sem hashtag e sem link.",
  FACEBOOK:
    "Facebook. Até 900 caracteres. Título e dois parágrafos curtos, em tom de redação. Sem link.",
  INSTAGRAM:
    "Instagram. Até 1500 caracteres. Título, contexto e um fecho sóbrio. Sem hashtag e sem link.",
};

function cleanModelText(text: string) {
  return text
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/, "")
    .replace(/^(texto|post|legenda|tweet)\s*:\s*/i, "")
    .trim();
}

export async function remodelPost(
  network: SocialNetwork,
  article: {
    title: string;
    dek: string;
    body: string;
    sectionLabel: string;
    opinion: boolean;
    url: string;
  }
) {
  const cfg = aiConfig();
  if (!cfg) {
    throw new SocialError(
      "A IA ainda não está configurada. O texto desta caixa é o recorte da redação. Para reescrever, defina SOCIAL_AI_API_KEY no servidor."
    );
  }

  const source = plainText(article.body).slice(0, 6000);
  let response: Response;
  try {
    response = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: [
              "Você edita posts da Ajoia Brasil, um portal de jornalismo.",
              "Reescreva a matéria para a rede indicada.",
              "Português do Brasil.",
              "Não invente fato, número, citação ou contexto que não esteja no texto.",
              "Não sensacionalize e não use caixa alta para gritar.",
              "Se for opinião, a primeira linha deixa isso explícito.",
              "Não use markdown.",
              "Não inclua link nem hashtag.",
              "Devolva só o texto do post.",
            ].join(" "),
          },
          {
            role: "user",
            content: [
              NOTES[network],
              `Seção: ${article.sectionLabel}.`,
              article.opinion ? "Isto é opinião, não uma reportagem." : "Isto é uma reportagem.",
              `Título: ${article.title}`,
              article.dek ? `Linha-fina: ${article.dek}` : "",
              `Texto: ${source}`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch {
    throw new SocialError("A IA não respondeu. O texto da redação continua na caixa.");
  }

  const json = await response.json().catch(() => ({}));
  const raw = json.choices?.[0]?.message?.content;
  if (!response.ok || typeof raw !== "string" || !raw.trim()) {
    throw new SocialError("A IA não devolveu um texto. O recorte da redação continua na caixa.");
  }

  let text = cleanModelText(raw);
  if (article.opinion && !/opini[aã]o/i.test(text)) {
    text = `Opinião\n\n${text}`;
  }
  if (network === "INSTAGRAM" && !text.includes("#AjoiaBrasil")) {
    text = `${text}\n\n${hashtagsFor(article.sectionLabel)}`;
  }
  const finalText = finalizePost(network, text, article.url);
  if (!finalText) return composePost(network, article);
  return finalText;
}
