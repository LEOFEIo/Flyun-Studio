import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { applications, jobs, profiles } from "../../db/schema";
import { ProductHeader } from "../components/product-header";
import { demoJobs } from "../lib/demo-data";
import { requireUser } from "../lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "候选人中心",
  description: "查看人才档案、职位推荐、申请状态与顾问反馈。",
};

const statusLabels: Record<string, string> = {
  new: "新申请",
  contacted: "顾问已联系",
  screening: "顾问沟通",
  interview: "面试中",
  offer: "Offer",
  hired: "已入职",
  closed: "已结束",
};

export default async function CandidatePage() {
  const user = await requireUser("/candidate");
  const db = process.env.DATABASE_URL ? getDb() : null;
  const [profileRows, applicationRows, recommendedJobs] = db
    ? await Promise.all([
        db.select().from(profiles).where(eq(profiles.userEmail, user.email)).limit(1),
        db
          .select({
            id: applications.id,
            status: applications.status,
            updatedAt: applications.updatedAt,
            consultantNotes: applications.consultantNotes,
            jobTitle: jobs.title,
            jobSlug: jobs.slug,
            domain: jobs.domain,
            location: jobs.location,
          })
          .from(applications)
          .innerJoin(jobs, eq(applications.jobId, jobs.id))
          .where(eq(applications.userEmail, user.email))
          .orderBy(desc(applications.updatedAt)),
        db.select().from(jobs).where(eq(jobs.status, "active")).limit(4),
      ])
    : [[], [], demoJobs.slice(0, 4)];

  const profile = profileRows[0];
  const profileFields = profile
    ? [
        profile.fullName,
        profile.currentRole,
        profile.location,
        profile.skills,
        profile.bio,
        profile.currentSalary,
        profile.expectedSalary,
      ]
    : [];
  const completeness = profile
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;
  const activeApplications = applicationRows.filter(
    (application) => !["hired", "closed"].includes(application.status),
  );

  return (
    <main className="product-page portal-page candidate-portal">
      <ProductHeader user={user} active="candidate" />

      <section className="portal-hero">
        <div>
          <p className="section-kicker">Candidate workspace</p>
          <h1>你好，{user.displayName}。<br /><span>你的下一步，保持清晰。</span></h1>
          <p>管理职业档案、跟踪申请进度，并从真实能力与长期方向出发发现新机会。</p>
        </div>
        <div className="portal-hero-orbit" aria-hidden="true">
          <i />
          <i />
          <strong>{completeness}%</strong>
          <span>PROFILE READY</span>
        </div>
      </section>

      <section className="portal-stats" aria-label="候选人概览">
        <article><span>档案完成度</span><strong>{completeness}%</strong><small>完善档案可获得更准确推荐</small></article>
        <article><span>进行中申请</span><strong>{activeApplications.length}</strong><small>等待顾问或面试反馈</small></article>
        <article><span>推荐机会</span><strong>{recommendedJobs.length}</strong><small>根据当前技术方向筛选</small></article>
        <article><span>档案状态</span><strong>{profile?.profileStatus === "published" ? "公开" : "私密"}</strong><small>你始终掌控职业信息</small></article>
      </section>

      <div className="portal-layout">
        <section className="portal-panel portal-pipeline">
          <header>
            <div><p className="section-kicker">Application pipeline</p><h2>申请进度</h2></div>
            <Link href="/jobs">发现机会 ↗</Link>
          </header>
          <div className="candidate-application-list">
            {applicationRows.length ? applicationRows.map((application, index) => (
              <Link href={`/jobs/${application.jobSlug}`} key={application.id}>
                <span className="portal-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{application.domain} · {application.location}</small>
                  <strong>{application.jobTitle}</strong>
                  <p>{application.consultantNotes || "顾问正在整理本轮反馈与下一步安排。"}</p>
                </div>
                <div>
                  <span className={`status-chip status-${application.status}`}>
                    {statusLabels[application.status] ?? application.status}
                  </span>
                  <time>{application.updatedAt.slice(0, 10)}</time>
                </div>
              </Link>
            )) : (
              <div className="portal-empty">
                <strong>还没有申请记录</strong>
                <p>从真正感兴趣的技术问题开始，而不是从职位名称开始。</p>
                <Link className="primary-button" href="/jobs">浏览开放机会</Link>
              </div>
            )}
          </div>
        </section>

        <aside className="portal-side">
          <section className="portal-panel profile-health">
            <div className="portal-panel-icon">◎</div>
            <p className="section-kicker">Living profile</p>
            <h2>让真正做过的事，持续被看见。</h2>
            <p>补充技能、项目与期望信息，让顾问更准确地理解你的下一步。</p>
            <div className="profile-health-track"><i style={{ width: `${completeness}%` }} /></div>
            <Link className="secondary-button" href="/workspace#profile">编辑飞云档案</Link>
          </section>

          <section className="portal-panel candidate-message">
            <p className="section-kicker">Advisor note</p>
            <blockquote>“你的系统工程经历很完整，下一轮建议重点展开一次从架构判断到业务结果的完整案例。”</blockquote>
            <span>飞云人才顾问 · 刚刚更新</span>
          </section>
        </aside>
      </div>

      <section className="portal-opportunities">
        <header><div><p className="section-kicker">Recommended</p><h2>可能适合你的机会</h2></div><Link href="/jobs">查看全部 →</Link></header>
        <div>
          {recommendedJobs.map((job, index) => (
            <Link href={`/jobs/${job.slug}`} key={job.id}>
              <span>{String(index + 1).padStart(2, "0")} / {job.domain}</span>
              <strong>{job.title}</strong>
              <small>{job.location}</small>
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
