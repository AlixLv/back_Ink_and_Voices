import "dotenv/config";
import { defineConfig } from "prisma/config";

const isDevelopment = process.env.NODE_ENV !== "production";
const databaseURL =
  (isDevelopment ? process.env["LOCAL_DATABASE_URL"] : process.env["DATABASE_URL"]) ||
  process.env["DATABASE_URL"] ||
  "";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseURL,
  },
});
