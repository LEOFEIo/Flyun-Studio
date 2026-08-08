import { asc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { jobs } from "../../db/schema";
import { demoJobs } from "./demo-data";
import {
  getSupabasePublicJob,
  getSupabasePublicJobs,
} from "./supabase-public";

export async function getPublicJobs() {
  if (!process.env.DATABASE_URL) {
    try {
      const rows = await getSupabasePublicJobs();
      if (rows.length) return rows;
    } catch {
      // Public Supabase tables are optional until the checked-in schema is run.
    }
    return [...demoJobs];
  }

  return getDb()
    .select()
    .from(jobs)
    .where(eq(jobs.status, "active"))
    .orderBy(asc(jobs.id));
}

export async function getPublicJob(slug: string) {
  if (!process.env.DATABASE_URL) {
    try {
      const row = await getSupabasePublicJob(slug);
      if (row) return row;
    } catch {
      // Keep the site useful while Supabase is offline or not initialized.
    }
    return demoJobs.find((job) => job.slug === slug) ?? null;
  }

  const [job] = await getDb()
    .select()
    .from(jobs)
    .where(eq(jobs.slug, slug))
    .limit(1);
  return job?.status === "active" ? job : null;
}
