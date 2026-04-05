import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },

  datasource: {
    // Provide a fallback for build-time generation if the environment variable is missing
    url: process.env.DATABASE_URL || "postgresql://postgres:dummy@localhost:5432/railway",
  },

});
