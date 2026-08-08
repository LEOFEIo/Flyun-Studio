import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { applications, jobs, profiles, users } from "../../../db/schema";
import { requireApiUser } from "../../lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  if (!process.env.DATABASE_URL) {
    return Response.json({ applications: [], storage: "browser" });
  }

  const rows = await getDb()
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      jobTitle: jobs.title,
      location: jobs.location,
      team: jobs.team,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userEmail, auth.user.email))
    .orderBy(desc(applications.createdAt));

  return Response.json({ applications: rows });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const payload = (await request.json()) as Record<string, unknown>;
  const text = (key: string, max = 500) =>
    String(payload[key] ?? "")
      .trim()
      .slice(0, max);
  const jobId = Number(payload.jobId);
  const required = [
    "candidateName",
    "currentSalary",
    "expectedSalary",
    "jobLevel",
    "promotionStatus",
    "performancePay",
  ];
  if (!Number.isInteger(jobId) || jobId < 1) {
    return Response.json({ error: "请选择有效岗位" }, { status: 400 });
  }
  if (required.some((key) => !text(key))) {
    return Response.json({ error: "请完整填写必填信息" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "演示环境未连接数据库，请保存到当前浏览器", demo: true },
      { status: 503 },
    );
  }

  const db = getDb();
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.status, "active")))
    .limit(1);
  if (!job) {
    return Response.json({ error: "岗位不存在或已关闭" }, { status: 404 });
  }

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

  const values = {
    userEmail: auth.user.email,
    jobId,
    candidateName: text("candidateName", 80),
    phone: text("phone", 40),
    currentCompany: text("currentCompany", 120),
    currentSalary: text("currentSalary", 80),
    expectedSalary: text("expectedSalary", 80),
    jobLevel: text("jobLevel", 80),
    promotionStatus: text("promotionStatus", 200),
    performancePay: text("performancePay", 120),
    motivation: text("motivation", 1200),
  };

  const [application] = await db.insert(applications).values(values).returning();

  await db
    .insert(profiles)
    .values({
      userEmail: auth.user.email,
      fullName: values.candidateName,
      phone: values.phone,
      currentCompany: values.currentCompany,
      currentSalary: values.currentSalary,
      expectedSalary: values.expectedSalary,
      jobLevel: values.jobLevel,
      promotionStatus: values.promotionStatus,
      performancePay: values.performancePay,
      profileStatus: "complete",
    })
    .onConflictDoUpdate({
      target: profiles.userEmail,
      set: {
        fullName: values.candidateName,
        phone: values.phone,
        currentCompany: values.currentCompany,
        currentSalary: values.currentSalary,
        expectedSalary: values.expectedSalary,
        jobLevel: values.jobLevel,
        promotionStatus: values.promotionStatus,
        performancePay: values.performancePay,
        profileStatus: "complete",
        updatedAt: new Date().toISOString(),
      },
    });

  return Response.json({ application }, { status: 201 });
}
