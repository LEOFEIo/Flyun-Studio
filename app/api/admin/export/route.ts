import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applications, jobs } from "../../../../db/schema";
import { requireApiAdmin } from "../../../lib/server-auth";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  if (!process.env.DATABASE_URL) {
    const demo = [
      ["ID", "候选人", "邮箱", "岗位", "流程状态", "说明"],
      ["DEMO-01", "林知夏", "zhixia@example.com", "AI Infra 平台负责人", "面试中", "演示数据"],
      ["DEMO-02", "陈嘉树", "jiashu@example.com", "多模态基模算法专家", "顾问沟通", "演示数据"],
    ];
    return new Response(`\uFEFF${demo.map((row) => row.map(csvCell).join(",")).join("\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=feiyun-demo-applications.csv",
      },
    });
  }

  const rows = await getDb()
    .select({
      id: applications.id,
      candidateName: applications.candidateName,
      email: applications.userEmail,
      phone: applications.phone,
      jobTitle: jobs.title,
      currentCompany: applications.currentCompany,
      currentSalary: applications.currentSalary,
      expectedSalary: applications.expectedSalary,
      jobLevel: applications.jobLevel,
      promotionStatus: applications.promotionStatus,
      performancePay: applications.performancePay,
      status: applications.status,
      consultantNotes: applications.consultantNotes,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt));

  const headers = [
    "ID",
    "候选人",
    "邮箱",
    "电话",
    "岗位",
    "当前公司",
    "当前薪资",
    "期望薪资",
    "职级",
    "晋升情况",
    "绩效薪资",
    "流程状态",
    "顾问备注",
    "提交时间",
  ];
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => Object.values(row).map(csvCell).join(",")),
  ];

  return new Response(`\uFEFF${lines.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feiyun-applications-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
