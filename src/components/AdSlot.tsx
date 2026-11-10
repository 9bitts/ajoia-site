import Link from "next/link";
import type { AdCreative } from "@/data/ads";

type Variant = "leaderboard" | "rectangle";

function AdLink({
  ad,
  className,
  children,
}: {
  ad: AdCreative;
  className: string;
  children: React.ReactNode;
}) {
  if (ad.external) {
    return (
      <a
        href={ad.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={ad.href} className={className}>
      {children}
    </Link>
  );
}

function HouseLeaderboard({ ad }: { ad: AdCreative }) {
  return (
    <div className="flex h-[68px] items-center gap-3 px-3.5 sm:h-[76px] sm:gap-4 sm:px-5">
      <div className="hidden h-9 w-px shrink-0 bg-[#c6a35a] sm:block" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8c56b]">
          {ad.eyebrow}
        </p>
        <p className="truncate text-sm font-semibold leading-tight text-white sm:text-[15px]">
          {ad.title}
        </p>
      </div>
      <span className="shrink-0 border border-[#c6a35a] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8c56b]">
        {ad.cta}
      </span>
    </div>
  );
}

function HouseRectangle({ ad }: { ad: AdCreative }) {
  return (
    <div className="flex aspect-[6/5] flex-col justify-between p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c56b]">
        {ad.eyebrow}
      </p>
      <div>
        <p className="font-sans text-[1.35rem] font-extrabold leading-[1.15] tracking-tight text-white">
          {ad.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{ad.text}</p>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e8c56b]">
        {ad.cta} →
      </p>
    </div>
  );
}

export function AdSlot({
  ad,
  variant = "rectangle",
  showLabel = false,
}: {
  ad: AdCreative;
  variant?: Variant;
  showLabel?: boolean;
}) {
  const frame =
    variant === "leaderboard"
      ? "on-dark block overflow-hidden rounded-md bg-[#111113] text-white transition-opacity hover:opacity-90"
      : "on-dark block overflow-hidden rounded-xl bg-[#111113] text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-90";

  return (
    <div>
      {showLabel && (
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-mist-dim">
          - Publicidade -
        </p>
      )}
      <AdLink ad={ad} className={frame}>
        {ad.image ? (
          // Advertiser files are swapped in without a fixed host.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.image} alt={ad.alt} className="h-auto w-full" />
        ) : variant === "leaderboard" ? (
          <HouseLeaderboard ad={ad} />
        ) : (
          <HouseRectangle ad={ad} />
        )}
      </AdLink>
    </div>
  );
}

export function AdStack({
  ads,
  showLabel = true,
}: {
  ads: AdCreative[];
  showLabel?: boolean;
}) {
  if (ads.length === 0) return null;

  return (
    <div className="space-y-8">
      {ads.map((ad) => (
        <AdSlot key={ad.id} ad={ad} variant="rectangle" showLabel={showLabel} />
      ))}
    </div>
  );
}
