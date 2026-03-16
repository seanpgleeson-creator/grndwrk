import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString: dbUrl });
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
