import { getPublicJobs } from "../../lib/job-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getPublicJobs();
    return Response.json({ jobs: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "岗位数据读取失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
