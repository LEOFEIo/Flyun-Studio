import { requireApiAdmin } from "../../../../../lib/server-auth";
import {
  listInterviews,
  sendInvitation,
  serializeInterview,
} from "../../../../../lib/interviews";
export const maxDuration = 30;
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  const { id } = await context.params;
  if (!/^[a-f\d-]{36}$/i.test(id))
    return Response.json({ error: "邀请标识无效" }, { status: 400 });
  if (!process.env.DATABASE_URL)
    return Response.json({ error: "请连接数据库" }, { status: 503 });
  try {
    await sendInvitation(id);
    const interview = (await listInterviews()).find((row) => row.id === id);
    if (!interview)
      return Response.json({ error: "邀请不存在" }, { status: 404 });
    return Response.json({ interview: serializeInterview(interview) });
  } catch {
    return Response.json({ error: "重试失败，请稍后再试" }, { status: 503 });
  }
}
