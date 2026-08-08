import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "缺少 DATABASE_URL。请在 Vercel 项目中连接 Neon 数据库，或在本地 .env.local 中设置该变量。",
    );
  }

  if (!database) {
    database = drizzle(neon(connectionString), { schema });
  }

  return database;
}
