import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato",
  description: `Fale com a ${siteConfig.name}.`,
  path: "/contato",
});

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-content px-5 py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-mist-dim">
            Institucional
          </p>
          <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
            Contato
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-muted">
            Fale com a redação, a diretoria ou a área comercial da{" "}
            {siteConfig.name}.
          </p>
          <div className="mt-8 space-y-4 text-sm text-mist-muted">
            <p>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-mist-dim">
                E-mail
              </span>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-1 inline-block text-mist transition-colors hover:text-white"
              >
                {siteConfig.email}
              </a>
            </p>
            <p>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-mist-dim">
                Sede
              </span>
              <span className="mt-1 inline-block">{siteConfig.city}, Brasil</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
