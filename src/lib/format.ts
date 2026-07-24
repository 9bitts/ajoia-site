const months = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
