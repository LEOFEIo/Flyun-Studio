import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applications, interviews, jobs } from "../../../../db/schema";
import { requireApiAdmin } from "../../../lib/server-auth";
import { validateInterview } from "../../../lib/interview-core";
import {
  interviewConfiguration,
  listInterviews,
  sendInvitation,
  serializeInterview,
} from "../../../lib/interviews";
export const maxDuration = 30;

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  if (!process.env.DATABASE_URL)
    return Response.json({ error: "请先连接数据库" }, { status: 503 });
  try {
    return Response.json({
      interviews: (await listInterviews()).map(serializeInterview),
    });
  } catch {
    return Response.json(
      { error: "面试数据读取失败，请确认已完成面试表初始化" },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  const config = interviewConfiguration();
  if (!config.database || !config.signing || !config.site)
    return Response.json(
      { error: "请先配置数据库、至少 32 字符的 AUTH_SECRET 和网站公开地址" },
      { status: 503 },
    );
  let input;
  try {
    input = validateInterview(await request.json());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "请求格式不正确" },
      { status: 400 },
    );
  }
  try {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.requestId, input.requestId));
    if (existing)
      return Response.json({ interview: serializeInterview(existing) });
    const [candidate] = await db
      .select({
        name: applications.candidateName,
        email: applications.userEmail,
        jobTitle: jobs.title,
        status: applications.status,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, input.applicationId));
    if (!candidate)
      return Response.json({ error: "候选人申请不存在" }, { status: 404 });
    if (["closed", "hired"].includes(candidate.status))
      return Response.json(
        { error: "该招聘流程已结束，请先重新开放申请" },
        { status: 409 },
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email))
      return Response.json({ error: "候选人邮箱格式不正确" }, { status: 400 });
    // The unique request_id makes repeated or concurrent submissions idempotent.
    const [created] = await db
      .insert(interviews)
      .values({
        id: randomUUID(),
        ...input,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: candidate.jobTitle,
      })
      .onConflictDoNothing({ target: interviews.requestId })
      .returning();
    const row =
      created ??
      (
        await db
          .select()
          .from(interviews)
          .where(eq(interviews.requestId, input.requestId))
      )[0];
    if (created) await sendInvitation(row.id);
    const [saved] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.id, row.id));
    return Response.json(
      { interview: serializeInterview(saved) },
      { status: created ? 201 : 200 },
    );
  } catch {
    return Response.json(
      { error: "邀请创建失败，请检查数据库连接与面试表初始化后重试" },
      { status: 503 },
    );
  }
}
