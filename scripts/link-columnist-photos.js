const { existsSync } = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const slugs = [
  "alexandre-siqueira",
  "ray-cunha",
  "neimar-fernandes",
  "walter-navarro",
  "willian-saliba",
  "cesar-wagner",
  "marcia-casali",
  "silvia-faga",
  "joabson-joao",
];

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const slug of slugs) {
      const file = path.join(process.cwd(), "public", "images", "colunistas", `${slug}.jpg`);
      if (!existsSync(file)) {
        console.log("sem arquivo", slug);
        continue;
      }
      const url = `/images/colunistas/${slug}.jpg`;
      const result = await prisma.user.updateMany({
        where: { slug, avatarUrl: null },
        data: { avatarUrl: url },
      });
      console.log(result.count ? "ligada" : "ja tinha", slug);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("fotos dos colunistas", error.message);
  process.exit(1);
});
