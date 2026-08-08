import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { applications } from "../../../../../db/schema";
import { requireApiAdmin } from "../../../../lib/server-auth";

const statuses = new Set([
  "new",
  "contacted",
  "screening",
  "interview",
  "offer",
  "hired",
  "closed",
]);

type ApplicationStatus =
  | "new"
  | "contacted"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "closed";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const applicationId = Number(id);
  const payload = (await request.json()) as {
    status?: string;
    consultantNotes?: string;
  };
  if (!Number.isInteger(applicationId) || applicationId < 1) {
    return Response.json({ error: "无效申请记录" }, { status: 400 });
  }

  const status = String(payload.status ?? "");
  if (!statuses.has(status)) {
    return Response.json({ error: "无效流程状态" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "演示环境未连接数据库，状态仅可在静态招聘方后台本地修改", demo: true },
      { status: 503 },
    );
  }

  const [updated] = await getDb()
    .update(applications)
    .set({
      status: status as ApplicationStatus,
      consultantNotes: String(payload.consultantNotes ?? "")
        .trim()
        .slice(0, 2000),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(applications.id, applicationId))
    .returning();

  if (!updated) {
    return Response.json({ error: "申请记录不存在" }, { status: 404 });
  }

  return Response.json({ application: updated });
}
