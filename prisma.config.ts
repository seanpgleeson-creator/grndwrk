import "dotenv/config";
import { defineConfig } from "prisma/config";

// Vercel's Neon integration injects POSTGRES_URL; fall back to DATABASE_URL for
// local dev, then to a SQLite placeholder that will surface a clear error.
const dbUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: dbUrl,
  },
});
