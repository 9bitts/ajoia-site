import json
from collections import Counter
from pathlib import Path

data = json.loads(Path(r"C:\Users\diego\Documents\ajoia\scripts\wp-export.json").read_text(encoding="utf-8"))
print("OPTIONS")
for k, v in data["options"].items():
    print(k, (v or "")[:180].replace("\n", " "))

posts = [p for p in data["posts"] if p["type"] == "post"]
pages = [p for p in data["posts"] if p["type"] == "page"]
atts = [p for p in data["posts"] if p["type"] == "attachment"]
print("posts", len(posts), "pages", len(pages), "attachments", len(atts))

users = {u["id"]: u for u in data["users"]}
print("AUTHORS")
ac = Counter(p["author"] for p in posts + pages)
for uid, n in ac.most_common():
    u = users.get(uid, {})
    print(n, u.get("name"), u.get("nicename"))

terms = {t["id"]: t for t in data["terms"]}
tax_by_tt = {t["tt"]: t for t in data["tax"]}
cats = [t for t in data["tax"] if t["taxonomy"] == "category"]
print("CATEGORIES")
for t in sorted(cats, key=lambda x: -x["count"]):
    term = terms.get(t["term"], {})
    print(t["count"], term.get("slug"), term.get("name"), "parent", t["parent"])

print("PAGE TITLES")
for p in pages:
    print("-", p["slug"], "|", p["title"][:90])

# sample content start
sample = max(posts, key=lambda p: len(p["content"]))
print("LONGEST", len(sample["content"]), sample["title"][:80])
print(sample["content"][:600].replace("\n", "\\n"))

# image refs
import re
img_re = re.compile(r"wp-content/uploads/([^\"'\s)]+)")
refs = 0
for p in posts + pages:
    refs += len(img_re.findall(p["content"]))
print("inline image refs", refs)
print("meta", len(data["meta"]), "primary", len(data["primary"]))
print("content chars", sum(len(p["content"]) for p in posts + pages))
