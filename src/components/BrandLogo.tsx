import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";

type Props = {
  href?: string;
  className?: string;
  /** Visual size preset */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const sizes = {
  sm: { width: 140, height: 40, className: "h-8 w-auto md:h-9" },
  md: { width: 220, height: 64, className: "h-10 w-auto md:h-12" },
  lg: { width: 320, height: 92, className: "h-14 w-auto md:h-16" },
};

export function BrandLogo({
  href = "/",
  className = "",
  size = "md",
  priority = false,
}: Props) {
  const s = sizes[size];
  const image = (
    <Image
      src="/images/logo-ajoia.png"
      alt={`${siteConfig.shortName} — ${siteConfig.tagline}`}
      width={s.width}
      height={s.height}
      priority={priority}
      className={`${s.className} object-contain object-left ${className}`}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-90">
      {image}
    </Link>
  );
}
