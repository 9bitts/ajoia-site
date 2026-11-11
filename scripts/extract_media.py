"""Copy only the WordPress uploads referenced by imported articles."""
import tarfile
from pathlib import Path

TAR = Path(r"C:\Users\diego\OneDrive\Documentos\a Joia Brasil\backup-ajoiabrasil.com.br-10-6-2026.tar.gz")
MANIFEST = Path(r"C:\Users\diego\Documents\ajoia\scripts\media-paths.txt")
DEST = Path(r"C:\Users\diego\Documents\ajoia\tmp\wp-media")

wanted = {line.strip().lstrip("/") for line in MANIFEST.read_text(encoding="utf-8").splitlines() if line.strip()}
found = set()
DEST.mkdir(parents=True, exist_ok=True)

with tarfile.open(TAR, "r:gz") as tar:
    for member in tar:
        if not member.isfile():
            continue
        name = member.name.replace("\\", "/").lstrip("./")
        marker = "wp-content/uploads/"
        if marker not in name:
            continue
        rel = name.split(marker, 1)[1]
        if rel not in wanted or rel in found:
            continue
        target = DEST / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        source = tar.extractfile(member)
        if source is None:
            continue
        with target.open("wb") as out:
            out.write(source.read())
        found.add(rel)
        if len(found) % 50 == 0:
            print("extracted", len(found), flush=True)

missing = sorted(wanted - found)
print("wanted", len(wanted), "found", len(found), "missing", len(missing))
if missing:
    Path(r"C:\Users\diego\Documents\ajoia\scripts\media-missing.txt").write_text(
        "\n".join(missing), encoding="utf-8"
    )
