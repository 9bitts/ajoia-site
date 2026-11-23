import Image from "next/image";

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-12 w-12 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-28 w-28 text-3xl",
};

export function ColumnistAvatar({ name, avatarUrl, size = "md", className = "" }: Props) {
  const box = sizes[size];
  if (avatarUrl) {
    return (
      <div className={`relative overflow-hidden rounded-full border-2 border-gold ${box} ${className}`}>
        <Image
          src={avatarUrl}
          alt={name}
          fill
          sizes={size === "lg" ? "112px" : "56px"}
          className="object-cover"
        />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-gold font-display text-[var(--text)] ${box} ${className}`}
    >
      {initials}
    </div>
  );
}
