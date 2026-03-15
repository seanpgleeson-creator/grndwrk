import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.userProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      narrative_pillars: "[]",
      target_roles: "[]",
      target_stages: "[]",
      cmf_weights: JSON.stringify({
        domain: 30,
        stage: 20,
        scope: 20,
        strategic: 20,
        narrative: 10,
      }),
    },
  });
  console.log("Seeded singleton UserProfile");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
