import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { applications, jobs } from "../../db/schema";
import { ProductHeader } from "../components/product-header";
import { RecruitingWorkspace } from "../components/recruiting-workspace";
import { isAdminEmail, requireUser } from "../lib/server-auth";
import {
  interviewConfiguration,
  listInterviews,
  serializeInterview,
} from "../lib/interviews";
import { previewCandidates } from "../lib/recruiting-data";
import type { InterviewRecord } from "../lib/interview-core";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "招聘工作台",
  description: "有序管理候选人、自动发送面试邀请、跟踪邀约回复。",
  robots: { index: false, follow: false },
};
export default async function RecruiterPage() {
  const config = interviewConfiguration();
  const demo = !config.database;
  const user = demo ? null : await requireUser("/recruiter");
  if (user && !isAdminEmail(user.email))
    return (
      <main className="ios-app">
        <ProductHeader user={user} />
        <section className="ios-access-denied">
          <h1>这个工作空间，仅向招聘管理员开放。</h1>
          <p>你可以前往候选人中心，查看自己的申请进度。</p>
          <Link className="ios-button" href="/candidate">
            进入候选人中心
          </Link>
        </section>
      </main>
    );
  const rows = demo
    ? previewCandidates
    : await getDb()
        .select({
          id: applications.id,
          candidateName: applications.candidateName,
          userEmail: applications.userEmail,
          currentCompany: applications.currentCompany,
          jobLevel: applications.jobLevel,
          expectedSalary: applications.expectedSalary,
          status: applications.status,
          jobTitle: jobs.title,
          jobDomain: jobs.domain,
          jobLocation: jobs.location,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .orderBy(desc(applications.updatedAt));
  let initialInterviews: (InterviewRecord & { invitationUrl?: string })[] = [];
  let loadError = "";
  if (!demo) {
    try {
      initialInterviews = (await listInterviews()).map((row) =>
        config.signing ? serializeInterview(row) : row,
      );
    } catch {
      loadError =
        "面试数据暂时无法读取，请检查数据库连接，并运行面试表初始化。";
    }
  }
  // eslint-disable-next-line react-hooks/purity -- A per-request server timestamp keeps client hydration deterministic.
  const initialNow = Date.now();
  return (
    <main className="ios-app ios-recruiter">
      <ProductHeader user={user} active="recruiter" />
      <RecruitingWorkspace
        rows={rows}
        initialInterviews={initialInterviews}
        demo={demo}
        config={config}
        displayName={user?.displayName || "飞云招聘团队"}
        loadError={loadError}
        initialNow={initialNow}
      />
    </main>
  );
}
