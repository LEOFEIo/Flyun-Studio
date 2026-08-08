import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { applications, jobs } from "../../db/schema";
import { AdminConsole } from "../components/admin-console";
import { ProductHeader } from "../components/product-header";
import { isAdminEmail, requireUser } from "../lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "顾问后台",
  description: "管理候选人申请、流程状态、备注和数据导出。",
};

export default async function AdminPage() {
  const user = await requireUser("/admin");
  if (!isAdminEmail(user.email)) {
    return (
      <main className="product-page">
        <ProductHeader user={user} active="admin" />
        <section className="access-denied">
          <span>403</span>
          <h1>你没有顾问后台权限。</h1>
          <p>当前账号可以使用个人工作台，但不能查看其他候选人的职业信息。</p>
          <a className="primary-button" href="/workspace">返回个人工作台</a>
        </section>
      </main>
    );
  }

  const rows = process.env.DATABASE_URL
    ? await getDb()
        .select({
          id: applications.id,
          candidateName: applications.candidateName,
          userEmail: applications.userEmail,
          phone: applications.phone,
          currentCompany: applications.currentCompany,
          currentSalary: applications.currentSalary,
          expectedSalary: applications.expectedSalary,
          jobLevel: applications.jobLevel,
          promotionStatus: applications.promotionStatus,
          performancePay: applications.performancePay,
          motivation: applications.motivation,
          status: applications.status,
          consultantNotes: applications.consultantNotes,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          jobTitle: jobs.title,
          jobLocation: jobs.location,
          jobDomain: jobs.domain,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .orderBy(desc(applications.createdAt))
    : [];

  return (
    <main className="admin-page">
      <ProductHeader user={user} active="admin" />
      <section className="admin-hero">
        <div>
          <p className="section-kicker">Consultant OS</p>
          <h1>人才与机会，保持在同一条线上。</h1>
        </div>
        <div className="admin-summary">
          <article><span>全部申请</span><strong>{rows.length}</strong></article>
          <article>
            <span>进行中</span>
            <strong>{rows.filter((row) => !["hired", "closed"].includes(row.status)).length}</strong>
          </article>
          <article>
            <span>进入面试</span>
            <strong>{rows.filter((row) => ["interview", "offer", "hired"].includes(row.status)).length}</strong>
          </article>
        </div>
      </section>
      <AdminConsole initialApplications={rows} />
    </main>
  );
}
