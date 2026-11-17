import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacidade",
  description:
    "O que a Ajoia Brasil coleta, por quanto tempo guarda e como pedir acesso ou exclusão.",
  path: "/privacidade",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">Institucional</p>
      <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">Privacidade</h1>
      <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed text-zinc-300">
        <p>
          A {siteConfig.name}, em {siteConfig.city}, é a responsável pelos dados deste portal.
          O contato é {siteConfig.email}.
        </p>
        <p>
          Conta da redação: nome, e-mail, senha (só o hash) e o texto das matérias. O acesso
          existe para publicar. A senha não é guardada em claro.
        </p>
        <p>
          Contato: nome, e-mail, assunto e mensagem, para responder o leitor. Essas mensagens
          ficam até 12 meses e depois são apagadas.
        </p>
        <p>
          Newsletter: o e-mail só entra na lista depois da confirmação. O link de saída vai na
          mensagem de confirmação e vale a qualquer momento. Pedidos não confirmados saem em 14 dias.
        </p>
        <p>
          Medição: o Analytics só carrega se você aceitar o aviso. A recusa é o padrão. Não vendemos
          lista nem dados de leitores.
        </p>
        <p>
          Para pedir acesso, correção ou exclusão dos seus dados, escreva para {siteConfig.email}
          com o assunto “Dados pessoais”. A redação responde pelo mesmo e-mail.
        </p>
      </div>
    </div>
  );
}
