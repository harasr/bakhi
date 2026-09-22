import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!sqlHost || !sqlDbName || !user || !password) {
  // During build, these might be missing, so we don't throw to avoid breaking the build
  // but we log a warning.
  console.warn("SQL environment variables are missing for Drizzle Kit.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: sqlHost || "",
    user: user || "",
    password: password || "",
    database: sqlDbName || "",
    ssl: false, // Local proxy handles security
  },
  verbose: true,
  strict: true,
});
