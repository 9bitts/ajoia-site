import Link from "next/link";

const links = [
  { href: "/admin/livraria", label: "Itens" },
  { href: "/admin/livraria/itens/novo", label: "Novo item" },
  { href: "/admin/livraria/categorias", label: "Categorias" },
  { href: "/admin/livraria/pedidos", label: "Pedidos" },
];

export function StoreAdminNav() {
  return (
    <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-mist-muted">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-11 items-center hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
