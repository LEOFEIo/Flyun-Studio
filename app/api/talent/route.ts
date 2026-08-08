import { desc, like, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { talentProfiles } from "../../../db/schema";
import { demoTalentProfiles } from "../../lib/demo-data";
import { getSupabaseTalentProfiles } from "../../lib/supabase-public";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (!process.env.DATABASE_URL) {
      try {
        const profiles = await getSupabaseTalentProfiles(query);
        if (profiles.length) return Response.json({ profiles });
      } catch {
        // Fall back to bundled demo data until the Supabase schema is ready.
      }
      const normalized = query.toLowerCase();
      const rows = normalized
        ? demoTalentProfiles.filter((profile) =>
            [
              profile.title,
              profile.domain,
              profile.skills,
              profile.summary,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalized),
          )
        : demoTalentProfiles;
      return Response.json({ profiles: rows });
    }
    const db = getDb();
    const rows = query
      ? await db
          .select()
          .from(talentProfiles)
          .where(
            or(
              like(talentProfiles.title, `%${query}%`),
              like(talentProfiles.domain, `%${query}%`),
              like(talentProfiles.skills, `%${query}%`),
              like(talentProfiles.summary, `%${query}%`),
            ),
          )
          .orderBy(desc(talentProfiles.matchScore))
          .limit(12)
      : await db
          .select()
          .from(talentProfiles)
          .orderBy(desc(talentProfiles.matchScore))
          .limit(12);

    return Response.json({ profiles: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "人才数据读取失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
