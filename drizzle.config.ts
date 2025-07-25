import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Validate DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error("❌ DATABASE_URL must be a valid PostgreSQL connection string");
  process.exit(1);
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
