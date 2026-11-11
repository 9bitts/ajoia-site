"""Turn the WordPress export into articles the new site can import."""
import html
import json
import re
from pathlib import Path

SRC = Path(r"C:\Users\diego\Documents\ajoia\scripts\wp-export.json")
OUT = Path(r"C:\Users\diego\Documents\ajoia\scripts\import-ready.json")
MEDIA = Path(r"C:\Users\diego\Documents\ajoia\scripts\media-paths.txt")

NICENAME_TO_SLUG = {
    "edvancir-jose-fernandes": "edy-fernandes",
    "jose-aparecido-ribeiro": "jose-aparecido-ribeiro",
    "alexandre-pinto-siqueira": "alexandre-siqueira",
    "ajoia-brasil": "redacao",
    "super-admin": "redacao",
    "arilda-costa-mcclive": "arilda-costa-mcclive",
    "walter-felix-cardoso-junior": "walter-felix",
    "joabson-joao": "joabson-joao",
    "neimar-fernandes-lopes": "neimar-fernandes",
    "adriana-garcia-silva-dos-santos": "adriana-garcia",
    "cesar-wagner-maia-martins": "cesar-wagner",
    "marcia-cristina-ferreira-casali-de-araujo": "marcia-casali",
    "leandro-peters-heringer": "leandro-heringer",
    "eduardo-bastos-moreira-lima": "eduardo-bastos",
    "daniel-ataide-da-silva": "dan-berg",
    "luiz-gustavo-dos-santos-chrispino": "luiz-gustavo-chrispino",
    "silvia-maria-faga-fernandes": "silvia-faga",
    "mario-caetano-de-souza": "mario-plaka",
    "rogerio-aguiar-domingues": "rogerio-aguiar",
    "raimundo-pereira-cunha": "ray-cunha",
    "jorge-da-silva-bessa": "jorge-bessa",
    "ana-paula-rocha-teixeira": "ana-paula-rocha",
    "cristina-reis-graeml": "cristina-graeml",
    "jussara-aparecida-ribeiro": "jussara-ribeiro",
    "mauro-santana-goncalves": "mauro-but",
    "jose-roberto-santana-lima": "roberto-santana",
    "antonio-willian-saliba": "willian-saliba",
    "david-areias-vianna": "david-vianna",
}

PAGE_SLUGS = {
    "fundadores",
    "politica-de-privacidade",
    "termos-de-uso",
    "responsabilidade-social",
    "diretoria-executiva",
    "conselhos",
    "1a-conferencia-ajoia-brasil-sao-paulo-2026",
}

NEWS_SECTIONS = [
    "editorial",
    "opiniao",
    "politica",
    "estado",
    "cidade",
    "mundo",
    "cultura",
    "tema-livre",
]

COMMENT = re.compile(r"<!--.*?-->", re.S)
CAPTION = re.compile(r"\[/?caption[^\]]*\]", re.I)
GALLERY = re.compile(r"\[gallery[^\]]*ids=[\"']([^\"']+)[\"'][^\]]*\]", re.I)
YOUTUBE = re.compile(
    r"(?<![\"'=])https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]{6,})[^\s<]*"
)
UPLOAD = re.compile(
    r"(?:https?:)?//(?:www\.)?ajoiabrasil\.com\.br/wp-content/uploads/([^\"'\s>]+)",
    re.I,
)
REL_UPLOAD = re.compile(r"(?<![\w/])/wp-content/uploads/([^\"'\s>]+)", re.I)
INTERNAL = re.compile(
    r"https?://(?:www\.)?ajoiabrasil\.com\.br/(\d{4})/(\d{2})/(\d{2})/([^/\"'\s>]+)/?",
    re.I,
)
PAGE_LINK = re.compile(
    r"https?://(?:www\.)?ajoiabrasil\.com\.br/([a-z0-9\-]+)/?",
    re.I,
)
TAG = re.compile(r"<[^>]+>")
SPACE = re.compile(r"\s+")
SRCSET = re.compile(r"\s(?:srcset|sizes)=([\"']).*?\1", re.I)


def plain(value: str) -> str:
    text = html.unescape(TAG.sub(" ", value or ""))
    text = SPACE.sub(" ", text).replace("\xa0", " ").strip()
    return text


def dek_from(content: str) -> str:
    text = plain(content)
    if len(text) <= 220:
        return text
    cut = text[:220].rsplit(" ", 1)[0]
    return cut.rstrip(".,;:") + "…"


def author_slug(user: dict) -> str:
    nice = user.get("nicename") or ""
    if nice in NICENAME_TO_SLUG:
        return NICENAME_TO_SLUG[nice]
    slug = re.sub(r"[^a-z0-9\-]", "", nice.lower())[:80]
    return slug or "redacao"


def choose_section(cat_slugs: list[str], primary: str | None, is_page: bool):
    if is_page:
        return "editorial", False
    if primary in NEWS_SECTIONS:
        section = primary
    else:
        section = next((s for s in NEWS_SECTIONS if s in cat_slugs), None)
        if section is None:
            section = "opiniao" if "colunistas" in cat_slugs else "tema-livre"
    opinion = section in {"opiniao", "editorial", "tema-livre"} or "colunistas" in cat_slugs
    return section, opinion


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    users = {u["id"]: u for u in data["users"]}
    terms = {t["id"]: t for t in data["terms"]}
    tax_by_tt = {t["tt"]: t for t in data["tax"]}
    primary = {row["post"]: row["term"] for row in data["primary"]}

    cats_of: dict[int, list[str]] = {}
    for rel in data["rels"]:
        tax = tax_by_tt.get(rel["tt"])
        if not tax or tax["taxonomy"] != "category":
            continue
        term = terms.get(tax["term"])
        if not term:
            continue
        cats_of.setdefault(rel["object"], []).append(term["slug"])

    files: dict[int, str] = {}
    alts: dict[int, str] = {}
    thumbs: dict[int, int] = {}
    for row in data["meta"]:
        if row["key"] == "_wp_attached_file" and row["value"]:
            files[row["post"]] = row["value"].lstrip("/")
        elif row["key"] == "_wp_attachment_image_alt":
            alts[row["post"]] = row["value"]
        elif row["key"] == "_thumbnail_id" and str(row["value"]).isdigit():
            thumbs[row["post"]] = int(row["value"])

    media: set[str] = set()

    def local_src(path: str) -> str:
        clean = path.split("?")[0].split("#")[0]
        clean = re.sub(r"-\d+x\d+(?=\.[a-zA-Z0-9]+$)", "", clean)
        media.add(clean)
        return f"/media/wp/{clean}"

    def expand_gallery(match: re.Match) -> str:
        ids = []
        for part in match.group(1).split(","):
            part = part.strip()
            if part.isdigit():
                ids.append(int(part))
        figures = []
        for att_id in ids:
            path = files.get(att_id)
            if not path:
                continue
            alt = html.escape(alts.get(att_id) or "", quote=True)
            figures.append(
                f'<figure><img src="{local_src(path)}" alt="{alt}" /></figure>'
            )
        return "\n".join(figures)

    def rewrite(content: str) -> str:
        content = COMMENT.sub("", content)
        content = CAPTION.sub("", content)
        content = GALLERY.sub(expand_gallery, content)
        content = YOUTUBE.sub(
            lambda m: (
                f'<p><a href="https://www.youtube.com/watch?v={m.group(1)}">'
                "Assistir no YouTube</a></p>"
            ),
            content,
        )
        content = SRCSET.sub("", content)

        def repl_upload(match: re.Match) -> str:
            return local_src(match.group(1))

        content = UPLOAD.sub(repl_upload, content)
        content = REL_UPLOAD.sub(repl_upload, content)
        content = INTERNAL.sub(lambda m: f"/artigo/{m.group(4).strip('/')}", content)

        def repl_page(match: re.Match) -> str:
            slug = match.group(1).lower()
            known = {
                "contato": "/contato",
                "expediente": "/expediente",
                "diretrizes": "/diretrizes",
                "quem-somos": "/quem-somos",
                "midia-kit-publicidade": "/midia-kit",
                "categorias": "/ultimas",
            }
            if slug in known:
                return known[slug]
            if slug in PAGE_SLUGS:
                return f"/artigo/{slug}"
            return match.group(0)

        content = PAGE_LINK.sub(repl_page, content)
        return content.strip()

    authors: dict[str, dict] = {}
    articles = []
    skipped = 0

    items = []
    for post in data["posts"]:
        if post["type"] == "post":
            items.append(post)
        elif post["type"] == "page" and post["slug"] in PAGE_SLUGS:
            items.append(post)

    for post in items:
        body = rewrite(post["content"] or "")
        text = plain(body)
        title = html.unescape(post["title"] or "").strip() or post["slug"]
        if len(text) < 20 or not post["slug"]:
            skipped += 1
            continue
        user = users.get(post["author"], {})
        slug = author_slug(user) if user else "redacao"
        name = (user.get("name") or "Redação Ajoia").strip()
        if slug == "redacao":
            name = "Redação Ajoia"
        email = (user.get("email") or f"{slug}@ajoiabrasil.com.br").strip().lower()
        if slug not in authors:
            authors[slug] = {
                "slug": slug,
                "name": name,
                "email": email,
                "roleLabel": "Redação" if slug == "redacao" else "Colunista",
            }
        cat_slugs = cats_of.get(post["id"], [])
        primary_slug = None
        primary_term = primary.get(post["id"])
        if primary_term and primary_term in terms:
            primary_slug = terms[primary_term]["slug"]
        is_page = post["type"] == "page"
        section, opinion = choose_section(cat_slugs, primary_slug, is_page)
        thumb = thumbs.get(post["id"])
        image = None
        image_alt = title
        if thumb and files.get(thumb):
            image = local_src(files[thumb])
            image_alt = plain(alts.get(thumb) or "") or title
        dek = dek_from(body)
        articles.append(
            {
                "slug": post["slug"][:180],
                "title": title[:300],
                "dek": dek,
                "body": body,
                "section": section,
                "authorSlug": slug,
                "publishedAt": (post["date"] or "2026-01-01 12:00:00").replace(" ", "T") + "Z",
                "updatedAt": (post["modified"] or post["date"] or "2026-01-01 12:00:00").replace(" ", "T") + "Z",
                "imageUrl": image,
                "imageAlt": image_alt[:300],
                "seoTitle": title[:110],
                "seoDescription": dek[:220],
                "isOpinion": opinion,
            }
        )

    payload = {"authors": list(authors.values()), "articles": articles}
    OUT.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    MEDIA.write_text("\n".join(sorted(media)), encoding="utf-8")
    print("authors", len(authors))
    print("articles", len(articles), "skipped", skipped)
    print("media", len(media))
    print("bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
