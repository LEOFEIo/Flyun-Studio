import { sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { findInvitation } from "../../../lib/interviews";
import { invitationExpired } from "../../../lib/interview-core";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "请求格式不正确" }, { status: 400 });
  }
  if (
    !["accepted", "declined"].includes(payload?.response) ||
    typeof payload?.token !== "string"
  )
    return Response.json({ error: "请选择接受或婉拒" }, { status: 400 });
  try {
    const invitation = await findInvitation(id, payload.token);
    if (!invitation)
      return Response.json({ error: "邀请不存在或链接无效" }, { status: 404 });
    if (invitationExpired(invitation.startsAt))
      return Response.json(
        { error: "面试已开始，请联系招聘顾问重新安排" },
        { status: 410 },
      );
    if (invitation.response !== "pending")
      return invitation.response === payload.response
        ? Response.json({ response: invitation.response })
        : Response.json(
            { error: "你已回复此邀请，如需调整请联系招聘顾问" },
            { status: 409 },
          );
    // The response and application transition are a single atomic statement.
    const result = await getDb().execute(sql`WITH answered AS (
      UPDATE interviews SET response = ${payload.response}, updated_at = NOW()
      WHERE id = ${id} AND response = 'pending' AND starts_at > NOW() RETURNING application_id
    ), advanced AS (
      UPDATE applications SET status = 'interview', updated_at = NOW()
      WHERE id IN (SELECT application_id FROM answered) AND ${payload.response} = 'accepted'
      AND status IN ('new','contacted','screening') RETURNING id
    ) SELECT application_id FROM answered`);
    if (!result.rows.length)
      return Response.json(
        { error: "邀请状态已变化，请刷新页面" },
        { status: 409 },
      );
    return Response.json({ response: payload.response });
  } catch {
    return Response.json(
      { error: "回复暂未保存，请稍后重试" },
      { status: 503 },
    );
  }
}
