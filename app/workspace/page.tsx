import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { applications, jobs, profiles, users } from "../../db/schema";
import { GitHubConnectCard } from "../components/github-connect-card";
import { ProfileForm } from "../components/profile-form";
import { ProductHeader } from "../components/product-header";
import { demoJobs } from "../lib/demo-data";
import { requireUser } from "../lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "个人工作台",
  description: "管理你的飞云档案、机会申请和顾问进度。",
};

const statusLabels: Record<string, string> = {
  new: "新申请",
  contacted: "已联系",
  screening: "顾问沟通",
  interview: "面试中",
  offer: "Offer",
  hired: "已入职",
  closed: "已结束",
};

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser("/workspace");
  const db = process.env.DATABASE_URL ? getDb() : null;
  const [profileRows, applicationRows, recommendedJobs, accountRows] = db
    ? await Promise.all([
        db
          .select()
          .from(profiles)
          .where(eq(profiles.userEmail, user.email))
          .limit(1),
        db
          .select({
            id: applications.id,
            status: applications.status,
            createdAt: applications.createdAt,
            updatedAt: applications.updatedAt,
            jobTitle: jobs.title,
            jobSlug: jobs.slug,
            location: jobs.location,
            domain: jobs.domain,
          })
          .from(applications)
          .innerJoin(jobs, eq(applications.jobId, jobs.id))
          .where(eq(applications.userEmail, user.email))
          .orderBy(desc(applications.createdAt)),
        db.select().from(jobs).where(eq(jobs.status, "active")).limit(3),
        db
          .select({
            username: users.username,
            githubLogin: users.githubLogin,
            githubAvatarUrl: users.githubAvatarUrl,
            githubFollowers: users.githubFollowers,
            githubPublicRepos: users.githubPublicRepos,
            githubTopLanguages: users.githubTopLanguages,
          })
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1),
      ])
    : [[], [], demoJobs.slice(0, 3), []];
  const profile = profileRows[0] ?? null;
  const account = accountRows[0] ?? null;
  const publicUsername = account?.username ?? user.username;
  const completeness = profile
    ? Math.round(
        ([
          profile.fullName,
          profile.currentRole,
          profile.location,
          profile.skills,
          profile.bio,
          profile.currentSalary,
          profile.expectedSalary,
        ].filter(Boolean).length /
          7) *
          100,
      )
    : 0;

  return (
    <main className="dashboard-page">
      <ProductHeader user={user} active="workspace" />
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="account-avatar">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
          <strong>{user.displayName}</strong>
          <span>{user.email}</span>
          <nav>
            <a className="active" href="#overview">概览</a>
            <a href="#applications">我的申请</a>
            <a href="#profile">飞云档案</a>
            {publicUsername ? <Link href={`/u/${publicUsername}`}>公开主页 ↗</Link> : null}
            <Link href="/jobs">发现机会 ↗</Link>
          </nav>
        </aside>

        <div className="dashboard-content">
          <section className="dashboard-heading" id="overview">
            <div>
              <p className="section-kicker">Personal workspace</p>
              <h1>你好，{user.displayName}。</h1>
            </div>
            <Link className="primary-button" href="/jobs">浏览新机会 ↗</Link>
          </section>

          <section className="dashboard-stats">
            <article>
              <span>档案完成度</span>
              <strong>{completeness}%</strong>
              <div className="completion-track">
                <i style={{ width: `${completeness}%` }} />
              </div>
            </article>
            <article>
              <span>机会申请</span>
              <strong>{applicationRows.length}</strong>
              <small>全部申请记录</small>
            </article>
            <article>
              <span>进行中</span>
              <strong>
                {applicationRows.filter((item) => !["hired", "closed"].includes(item.status)).length}
              </strong>
              <small>等待顾问或面试反馈</small>
            </article>
          </section>

          <GitHubConnectCard
            account={account}
            username={publicUsername}
            oauthStatus={params.github}
          />

          <section className="dashboard-block" id="applications">
            <div className="block-heading">
              <div>
                <p className="section-kicker">Pipeline</p>
                <h2>我的申请</h2>
              </div>
              <Link href="/jobs">继续浏览</Link>
            </div>
            <div className="application-list">
              {applicationRows.length ? (
                applicationRows.map((application) => (
                  <a
                    className="application-row"
                    href={`/jobs/${application.jobSlug}`}
                    key={application.id}
                  >
                    <div>
                      <span>{application.domain}</span>
                      <strong>{application.jobTitle}</strong>
                      <small>{application.location}</small>
                    </div>
                    <div className={`status-chip status-${application.status}`}>
                      {statusLabels[application.status] ?? application.status}
                    </div>
                    <time>{application.updatedAt.slice(0, 10)}</time>
                    <b>↗</b>
                  </a>
                ))
              ) : (
                <div className="empty-state">
                  <span>还没有申请记录</span>
                  <p>从当前机会中选择你真正感兴趣的方向。</p>
                  <Link className="secondary-button" href="/jobs">查看机会</Link>
                </div>
              )}
            </div>
          </section>

          <section className="dashboard-block" id="profile">
            <div className="block-heading">
              <div>
                <p className="section-kicker">Living profile</p>
                <h2>我的飞云档案</h2>
              </div>
              <span className="profile-state">
                {profile?.profileStatus === "published" ? "已发布" : "仅自己可见"}
              </span>
            </div>
            <ProfileForm initialProfile={profile} />
          </section>

          <section className="dashboard-block">
            <div className="block-heading">
              <div>
                <p className="section-kicker">Recommended</p>
                <h2>可能适合你的机会</h2>
              </div>
            </div>
            <div className="recommend-grid">
              {recommendedJobs.map((job) => (
                <a href={`/jobs/${job.slug}`} key={job.id}>
                  <span>{job.domain}</span>
                  <strong>{job.title}</strong>
                  <small>{job.location}</small>
                  <b>↗</b>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
