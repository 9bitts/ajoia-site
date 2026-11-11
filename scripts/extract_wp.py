"""Extract published WordPress content from the MariaDB dump."""
import gzip
import json
from pathlib import Path

DUMP = Path(r"C:\Users\diego\OneDrive\Documentos\a Joia Brasil\ajoiabrasil_wp93.sql.gz")
OUT = Path(r"C:\Users\diego\Documents\ajoia\scripts\wp-export.json")

WANTED = {
    "wph5_posts",
    "wph5_users",
    "wph5_terms",
    "wph5_term_taxonomy",
    "wph5_term_relationships",
    "wph5_postmeta",
    "wph5_yoast_primary_term",
    "wph5_options",
}

POSTMETA_KEYS = {
    "_thumbnail_id",
    "_yoast_wpseo_title",
    "_yoast_wpseo_metadesc",
    "_wp_attached_file",
    "_wp_attachment_image_alt",
}

OPTION_NAMES = {"permalink_structure", "blogname", "blogdescription", "siteurl", "home", "category_base", "tag_base"}


def unescape(s: str) -> str:
    out = []
    i = 0
    while i < len(s):
        c = s[i]
        if c == "\\" and i + 1 < len(s):
            n = s[i + 1]
            mapping = {
                "0": "\0",
                "n": "\n",
                "r": "\r",
                "t": "\t",
                "Z": "\x1a",
                "\\": "\\",
                "'": "'",
                '"': '"',
            }
            out.append(mapping.get(n, n))
            i += 2
            continue
        out.append(c)
        i += 1
    return "".join(out)


def parse_values(blob: str):
    rows = []
    i = 0
    n = len(blob)
    while i < n:
        while i < n and blob[i] in " \r\n\t,":
            i += 1
        if i >= n or blob[i] == ";":
            break
        if blob[i] != "(":
            i += 1
            continue
        i += 1
        row = []
        while i < n:
            while i < n and blob[i] in " \r\n\t":
                i += 1
            if i >= n:
                break
            if blob[i] == ")":
                i += 1
                rows.append(row)
                break
            if blob[i] == "'":
                i += 1
                buf = []
                while i < n:
                    c = blob[i]
                    if c == "\\":
                        buf.append(c)
                        if i + 1 < n:
                            buf.append(blob[i + 1])
                            i += 2
                            continue
                    if c == "'":
                        i += 1
                        break
                    buf.append(c)
                    i += 1
                row.append(unescape("".join(buf)))
            elif blob[i : i + 4].upper() == "NULL" and (
                i + 4 >= n or blob[i + 4] in ",)"
            ):
                row.append(None)
                i += 4
            else:
                start = i
                while i < n and blob[i] not in ",)":
                    i += 1
                row.append(blob[start:i].strip())
            while i < n and blob[i] in " \r\n\t":
                i += 1
            if i < n and blob[i] == ",":
                i += 1
    return rows


def iter_inserts(path: Path):
    with gzip.open(path, "rt", encoding="utf-8", errors="replace") as f:
        buf = ""
        capturing = None
        for line in f:
            if capturing is None:
                if not line.startswith("INSERT INTO `"):
                    continue
                table = line.split("`", 2)[1]
                if table not in WANTED:
                    continue
                capturing = table
                buf = line
                if line.rstrip().endswith(";"):
                    yield capturing, buf
                    capturing = None
                    buf = ""
                continue
            buf += line
            if line.rstrip().endswith(";"):
                yield capturing, buf
                capturing = None
                buf = ""


def cols_and_values(statement: str):
    head, _, rest = statement.partition(" VALUES ")
    if not rest:
        head, _, rest = statement.partition(" VALUES\n")
    cols = []
    if "(" in head:
        inside = head.split("(", 1)[1].rsplit(")", 1)[0]
        cols = [c.strip().strip("`") for c in inside.split(",")]
    return cols, parse_values(rest)


def main():
    posts = []
    users = []
    terms = []
    tax = []
    rels = []
    meta = []
    primary = []
    options = {}

    for table, stmt in iter_inserts(DUMP):
        cols, rows = cols_and_values(stmt)
        print(table, len(rows), flush=True)
        idx = {c: i for i, c in enumerate(cols)}

        def get(row, name):
            i = idx.get(name)
            return row[i] if i is not None and i < len(row) else None

        if table == "wph5_posts":
            for row in rows:
                post_type = get(row, "post_type")
                status = get(row, "post_status")
                if post_type == "attachment":
                    posts.append(
                        {
                            "id": int(get(row, "ID")),
                            "type": "attachment",
                            "title": get(row, "post_title") or "",
                            "name": get(row, "post_name") or "",
                            "guid": get(row, "guid") or "",
                            "mime": get(row, "post_mime_type") or "",
                            "parent": int(get(row, "post_parent") or 0),
                        }
                    )
                elif post_type in ("post", "page") and status == "publish":
                    password = get(row, "post_password") or ""
                    if password:
                        continue
                    posts.append(
                        {
                            "id": int(get(row, "ID")),
                            "type": post_type,
                            "author": int(get(row, "post_author") or 0),
                            "date": get(row, "post_date_gmt") or get(row, "post_date"),
                            "modified": get(row, "post_modified_gmt") or get(row, "post_modified"),
                            "title": get(row, "post_title") or "",
                            "slug": get(row, "post_name") or "",
                            "excerpt": get(row, "post_excerpt") or "",
                            "content": get(row, "post_content") or "",
                            "guid": get(row, "guid") or "",
                        }
                    )
        elif table == "wph5_users":
            for row in rows:
                users.append(
                    {
                        "id": int(get(row, "ID")),
                        "login": get(row, "user_login"),
                        "nicename": get(row, "user_nicename"),
                        "email": get(row, "user_email"),
                        "name": get(row, "display_name"),
                    }
                )
        elif table == "wph5_terms":
            for row in rows:
                terms.append(
                    {
                        "id": int(get(row, "term_id")),
                        "name": get(row, "name"),
                        "slug": get(row, "slug"),
                    }
                )
        elif table == "wph5_term_taxonomy":
            for row in rows:
                tax.append(
                    {
                        "tt": int(get(row, "term_taxonomy_id")),
                        "term": int(get(row, "term_id")),
                        "taxonomy": get(row, "taxonomy"),
                        "parent": int(get(row, "parent") or 0),
                        "count": int(get(row, "count") or 0),
                    }
                )
        elif table == "wph5_term_relationships":
            for row in rows:
                rels.append(
                    {
                        "object": int(get(row, "object_id")),
                        "tt": int(get(row, "term_taxonomy_id")),
                    }
                )
        elif table == "wph5_postmeta":
            for row in rows:
                key = get(row, "meta_key")
                if key not in POSTMETA_KEYS:
                    continue
                meta.append(
                    {
                        "post": int(get(row, "post_id")),
                        "key": key,
                        "value": get(row, "meta_value") or "",
                    }
                )
        elif table == "wph5_yoast_primary_term":
            for row in rows:
                if get(row, "taxonomy") != "category":
                    continue
                primary.append(
                    {
                        "post": int(get(row, "post_id")),
                        "term": int(get(row, "term_id")),
                    }
                )
        elif table == "wph5_options":
            for row in rows:
                name = get(row, "option_name")
                if name in OPTION_NAMES:
                    options[name] = get(row, "option_value")

    data = {
        "options": options,
        "users": users,
        "terms": terms,
        "tax": tax,
        "rels": rels,
        "meta": meta,
        "primary": primary,
        "posts": posts,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    published = [p for p in posts if p["type"] in ("post", "page")]
    print("users", len(users))
    print("published", len(published), "attachments", len(posts) - len(published))
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
