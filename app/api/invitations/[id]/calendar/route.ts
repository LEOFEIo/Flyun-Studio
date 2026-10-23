import { findInvitation } from "../../../../lib/interviews";
import { createCalendar } from "../../../../lib/interview-core";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const invitation = await findInvitation(
      id,
      new URL(request.url).searchParams.get("token") ?? "",
    );
    if (!invitation)
      return Response.json({ error: "邀请链接无效" }, { status: 404 });
    return new Response(createCalendar(invitation), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="feiyun-interview.ics"',
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return Response.json({ error: "日历暂时不可用" }, { status: 503 });
  }
}
