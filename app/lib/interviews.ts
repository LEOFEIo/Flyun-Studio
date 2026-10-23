import { and, asc, eq, lt, ne, or } from "drizzle-orm";
import { getDb } from "../../db";
import { interviews } from "../../db/schema";
import {
  escapeHtml,
  formatInterviewTime,
  invitationToken,
  verifyInvitationToken,
  type InterviewRecord,
} from "./interview-core";

export function interviewConfiguration() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    email: Boolean(
      process.env.RESEND_API_KEY && process.env.INTERVIEW_FROM_EMAIL,
    ),
    signing: (process.env.AUTH_SECRET?.trim().length ?? 0) >= 32,
    site: Boolean(
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ),
  };
}
export function invitationUrl(id: string) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return `${origin.replace(/\/$/, "")}/invite/${id}?token=${invitationToken(id, process.env.AUTH_SECRET?.trim() ?? "")}`;
}
export async function findInvitation(id: string, token: string) {
  if (
    !process.env.DATABASE_URL ||
    !verifyInvitationToken(id, token, process.env.AUTH_SECRET?.trim() ?? "")
  )
    return null;
  const [interview] = await getDb()
    .select()
    .from(interviews)
    .where(eq(interviews.id, id))
    .limit(1);
  return interview ?? null;
}
export async function listInterviews() {
  return getDb().select().from(interviews).orderBy(asc(interviews.startsAt));
}

export async function sendInvitation(id: string) {
  const db = getDb();
  // A claim prevents concurrent clicks from sending the same invitation twice.
  const [claimed] = await db
    .update(interviews)
    .set({
      deliveryStatus: "sending",
      deliveryError: "",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(interviews.id, id),
        eq(interviews.response, "pending"),
        ne(interviews.deliveryStatus, "sent"),
        or(
          ne(interviews.deliveryStatus, "sending"),
          lt(interviews.updatedAt, new Date(Date.now() - 90_000).toISOString()),
        ),
      ),
    )
    .returning();
  if (!claimed) return;
  try {
    if (!interviewConfiguration().email)
      throw new Error(
        "邮件服务未配置，请设置 RESEND_API_KEY 和 INTERVIEW_FROM_EMAIL，或复制邀请链接",
      );
    if (Date.parse(claimed.startsAt) <= Date.now())
      throw new Error("面试已开始，请重新安排时间");
    const url = invitationUrl(id);
    const e = escapeHtml;
    const time = `${formatInterviewTime(claimed.startsAt)}（北京时间，${claimed.durationMinutes} 分钟）`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `feiyun-interview-${id}`,
      },
      body: JSON.stringify({
        from: process.env.INTERVIEW_FROM_EMAIL,
        to: [claimed.candidateEmail],
        subject: `面试邀请 · ${claimed.title.replace(/[\r\n]/g, " ")}`,
        text: `${claimed.candidateName}，你好！\n邀请你参加 ${claimed.jobTitle} 的面试。\n${time}\n地点：${claimed.location}\n${claimed.message}\n查看并回复邀请：${url}`,
        html: `<div style="font-family:-apple-system,Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#1d1d1f"><p style="color:#0066cc">飞云 FEIYUN</p><h1>期待与你聊一聊。</h1><p>${e(claimed.candidateName)}，你好！邀请你参加 ${e(claimed.jobTitle)} 的面试。</p><p><b>${e(claimed.title)}</b></p><p>${e(time)}</p><p>地点：${e(claimed.location)}</p><p style="white-space:pre-line">${e(claimed.message)}</p><a href="${e(url)}" style="display:inline-block;background:#007aff;color:white;padding:14px 24px;border-radius:14px;text-decoration:none">查看并回复邀请</a><p style="color:#666;font-size:13px">打开链接不会自动确认。你可以接受或婉拒本次邀请。</p></div>`,
      }),
    });
    if (!response.ok)
      throw new Error(
        `邮件服务暂未接受请求（${response.status}），请检查发件域名和邮件配置后重试`,
      );
    await db
      .update(interviews)
      .set({
        deliveryStatus: "sent",
        deliveryError: "",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(interviews.id, id));
  } catch (error) {
    await db
      .update(interviews)
      .set({
        deliveryStatus: "failed",
        deliveryError:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "邮件发送失败，请稍后重试",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(interviews.id, id));
  }
}
export function serializeInterview(row: InterviewRecord) {
  return { ...row, invitationUrl: invitationUrl(row.id) };
}
