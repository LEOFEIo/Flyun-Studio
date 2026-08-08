import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles, users } from "../../../db/schema";
import { requireApiUser } from "../../lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  if (!process.env.DATABASE_URL) {
    return Response.json({ user: auth.user, profile: null, storage: "browser" });
  }

  const [profile] = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userEmail, auth.user.email))
    .limit(1);

  return Response.json({
    user: auth.user,
    profile: profile ?? null,
  });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const payload = (await request.json()) as Record<string, unknown>;
  const text = (key: string, max = 500) =>
    String(payload[key] ?? "")
      .trim()
      .slice(0, max);
  const yearsExperience = Math.max(
    0,
    Math.min(60, Number(payload.yearsExperience) || 0),
  );
  const status =
    text("profileStatus", 20) === "published" ? "published" : "complete";

  const values = {
    fullName: text("fullName", 80),
    phone: text("phone", 40),
    location: text("location", 80),
    currentCompany: text("currentCompany", 120),
    currentRole: text("currentRole", 120),
    yearsExperience,
    currentSalary: text("currentSalary", 80),
    expectedSalary: text("expectedSalary", 80),
    jobLevel: text("jobLevel", 80),
    promotionStatus: text("promotionStatus", 200),
    performancePay: text("performancePay", 120),
    skills: text("skills", 600),
    bio: text("bio", 1200),
    profileStatus: status as "complete" | "published",
    updatedAt: new Date().toISOString(),
  };

  if (!values.fullName) {
    return Response.json({ error: "姓名不能为空" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "演示环境未连接数据库，请保存到当前浏览器", demo: true, profile: values },
      { status: 503 },
    );
  }

  const db = getDb();
  await db
    .insert(users)
    .values({
      email: auth.user.email,
      displayName: auth.user.displayName,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        displayName: auth.user.displayName,
        updatedAt: new Date().toISOString(),
      },
    });

  const [profile] = await db
    .insert(profiles)
    .values({ userEmail: auth.user.email, ...values })
    .onConflictDoUpdate({
      target: profiles.userEmail,
      set: values,
    })
    .returning();

  return Response.json({ profile });
}
