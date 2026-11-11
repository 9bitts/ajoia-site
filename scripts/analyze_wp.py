import json, re
from pathlib import Path

data = json.loads(Path(r"C:\Users\diego\Documents\ajoia\scripts\wp-export.json").read_text(encoding="utf-8"))
posts = [p for p in data["posts"] if p["type"] in ("post", "page")]
print("elementor", sum(1 for p in posts if "elementor" in p["content"].lower()))
print("wp blocks", sum(1 for p in posts if "<!-- wp:" in p["content"]))
print("empty", sum(1 for p in posts if len(p["content"].strip()) < 20))
print("with excerpt", sum(1 for p in posts if p["excerpt"].strip()))

seed = {
"institutos-de-pesquisas-imprensa-e-maquina-estatal",
"instituto-rodrigo-castanheira-transformando-perda-em-protecao",
"noticias-do-dia-23-de-julho",
"noticias-do-dia-22-de-julho",
"tragedia-familiar-expoe-falhas-e-busca-por-justica",
"a-conta-da-arrogancia-chegou",
"ajoia-brasil-e-lancada-com-posicionamento-claro",
"belo-horizonte-a-deriva-mobilidade-urbana",
"anel-rodoviario-de-bh-limites-de-quem-governa",
"trevo-do-belvedere-palavra-do-prefeito",
"setor-vitivinicola-brasileiro-minas-gerais",
"imprensa-visceral-e-quase-sutil",
"silencio-que-doi-mais-que-grito",
"intervencao-vetor-norte-bh",
"ajoia-lancada-em-bh",
"geopolitica-e-imprensa-livre",
}
slugs = {p["slug"] for p in posts}
print("slug overlap", sorted(seed & slugs))
print("dup slugs", [s for s,c in __import__("collections").Counter(p["slug"] for p in posts).items() if c>1])
print("empty slug", sum(1 for p in posts if not p["slug"]))

# page content sizes
for p in posts:
    if p["type"]=="page":
        print("PAGE", p["slug"], len(p["content"]), p["content"][:120].replace("\n"," "))
