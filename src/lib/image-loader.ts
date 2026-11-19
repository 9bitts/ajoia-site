type LoaderArgs = { src: string; width: number; quality?: number };

/** O Next pede a largura. O servidor em /img devolve WebP nessa medida. */
export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  const params = new URLSearchParams({
    src,
    w: String(width),
    q: String(quality ?? 75),
  });
  return `/img?${params.toString()}`;
}
