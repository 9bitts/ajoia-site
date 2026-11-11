import tarfile
from collections import Counter

path = r"C:\Users\diego\OneDrive\Documentos\a Joia Brasil\backup-ajoiabrasil.com.br-10-6-2026.tar.gz"
prefixes = Counter()
upload_bytes = 0
upload_files = 0
top = Counter()
with tarfile.open(path, "r:gz") as tar:
    for m in tar:
        name = m.name.lstrip("./")
        top[name.split("/")[0]] += m.size
        if "/wp-content/uploads/" in name or name.startswith("public_html/wp-content/uploads"):
            if m.isfile():
                upload_bytes += m.size
                upload_files += 1
print("upload_files", upload_files)
print("upload_mb", round(upload_bytes / 1024 / 1024, 1))
print("TOP")
for k, v in top.most_common(15):
    print(round(v / 1024 / 1024, 1), k)
