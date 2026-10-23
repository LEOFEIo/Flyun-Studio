import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL) throw new Error("请先设置 DATABASE_URL");
const sql = neon(process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  candidate_name TEXT NOT NULL, candidate_email TEXT NOT NULL, job_title TEXT NOT NULL,
  title TEXT NOT NULL, starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (15,30,45,60,90,120)),
  location TEXT NOT NULL, message TEXT NOT NULL DEFAULT '',
  response TEXT NOT NULL DEFAULT 'pending' CHECK (response IN ('pending','accepted','declined')),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sending','sent','failed')),
  delivery_error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`CREATE INDEX IF NOT EXISTS interviews_starts_at_idx ON interviews(starts_at)`;
await sql`CREATE INDEX IF NOT EXISTS interviews_application_idx ON interviews(application_id)`;
console.log("面试邀请表已就绪");
