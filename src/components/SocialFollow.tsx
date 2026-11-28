import { followLinks } from "@/data/site";

function Icon({ id }: { id: (typeof followLinks)[number]["id"] }) {
  if (id === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
      <path d="M14.5 8.5V6.8c0-.9.7-1.3 1.7-1.3H18V3h-2.2C13.2 3 12 4.4 12 6.6V8.5H9.5V11H12v10h2.5V11h2.3l.4-2.5H14.5z" />
    </svg>
  );
}

export function SocialFollow({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Redes da Ajoia Brasil" className={className}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {followLinks.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 text-[12px] font-semibold tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
            >
              <Icon id={item.id} />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
