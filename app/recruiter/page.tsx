import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { applications, jobs } from "../../db/schema";
import { ProductHeader } from "../components/product-header";
import { isAdminEmail, requireUser } from "../lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "招聘方后台",
  description: "查看人才漏斗、候选人状态、招聘任务与职位数据。",
};

const demoApplications = [
  { id: 1, candidateName: "林知夏", userEmail: "zhixia@example.com", currentCompany: "Nebula AI", jobLevel: "P7", expectedSalary: "70–90K", status: "interview", updatedAt: "2026-07-31T10:30:00.000Z", jobTitle: "AI Infra 平台负责人", jobDomain: "AI Infra", jobLocation: "北京 / 上海" },
  { id: 2, candidateName: "陈嘉树", userEmail: "jiashu@example.com", currentCompany: "OpenVision", jobLevel: "资深", expectedSalary: "65–85K", status: "screening", updatedAt: "2026-07-31T09:20:00.000Z", jobTitle: "多模态基模算法专家", jobDomain: "大模型与多模态", jobLocation: "北京 / 深圳 / 杭州" },
  { id: 3, candidateName: "周砚", userEmail: "yan@example.com", currentCompany: "VectorLab", jobLevel: "专家", expectedSalary: "80–100K", status: "new", updatedAt: "2026-07-30T18:10:00.000Z", jobTitle: "大模型推理优化架构师", jobDomain: "AI Infra", jobLocation: "杭州 / 上海 / 深圳" },
  { id: 4, candidateName: "许云澜", userEmail: "yunlan@example.com", currentCompany: "Arc Studio", jobLevel: "负责人", expectedSalary: "面议", status: "offer", updatedAt: "2026-07-30T16:40:00.000Z", jobTitle: "AI 产品构建者", jobDomain: "AI 产品与设计", jobLocation: "北京 / 远程" },
  { id: 5, candidateName: "沈亦安", userEmail: "yian@example.com", currentCompany: "MotionX", jobLevel: "高级", expectedSalary: "60–80K", status: "interview", updatedAt: "2026-07-29T14:00:00.000Z", jobTitle: "具身学习算法科学家", jobDomain: "机器人与具身智能", jobLocation: "北京 / 深圳" },
  { id: 6, candidateName: "顾南川", userEmail: "nanchuan@example.com", currentCompany: "Autonomy", jobLevel: "负责人", expectedSalary: "90–120K", status: "contacted", updatedAt: "2026-07-29T11:15:00.000Z", jobTitle: "端到端自动驾驶算法负责人", jobDomain: "自动驾驶", jobLocation: "北京 / 苏州 / 上海" },
];

const stages = [
  ["new", "新人才"],
  ["screening", "评估中"],
  ["interview", "面试中"],
  ["offer", "Offer"],
] as const;

export default async function RecruiterPage() {
  const user = await requireUser("/recruiter");
  if (!isAdminEmail(user.email)) {
    return (
      <main className="product-page portal-page recruiter-portal">
        <ProductHeader user={user} active="recruiter" />
        <section className="access-denied">
          <span>403</span>
          <h1>招聘方后台仅向管理员开放。</h1>
          <p>请使用管理员用户名登录，候选人账号可继续访问候选人中心。</p>
          <Link className="primary-button" href="/candidate">返回候选人中心</Link>
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
          currentCompany: applications.currentCompany,
          jobLevel: applications.jobLevel,
          expectedSalary: applications.expectedSalary,
          status: applications.status,
          updatedAt: applications.updatedAt,
          jobTitle: jobs.title,
          jobDomain: jobs.domain,
          jobLocation: jobs.location,
        })
        .from(applications)
        .innerJoin(jobs, eq(applications.jobId, jobs.id))
        .orderBy(desc(applications.updatedAt))
    : demoApplications;

  const active = rows.filter((row) => !["hired", "closed"].includes(row.status));
  const interviews = rows.filter((row) => ["interview", "offer", "hired"].includes(row.status));
  const offers = rows.filter((row) => ["offer", "hired"].includes(row.status));
  const conversion = rows.length ? Math.round((offers.length / rows.length) * 100) : 0;

  return (
    <main className="product-page portal-page recruiter-portal">
      <ProductHeader user={user} active="recruiter" />

      <section className="recruiter-hero">
        <div>
          <p className="section-kicker">Recruiter command center</p>
          <h1>人才、机会与行动，<br /><span>保持在同一条线上。</span></h1>
        </div>
        <div className="recruiter-actions">
          <Link className="primary-button" href="/admin">管理全部申请 ↗</Link>
          <Link className="secondary-button" href="/#search">搜索人才</Link>
        </div>
      </section>

      <section className="recruiter-metrics">
        <article><span>人才总数</span><strong>{rows.length}</strong><small>全部申请与人才记录</small></article>
        <article><span>活跃流程</span><strong>{active.length}</strong><small>未结束的招聘流程</small></article>
        <article><span>面试阶段</span><strong>{interviews.length}</strong><small>面试、Offer 与入职</small></article>
        <article><span>Offer 转化</span><strong>{conversion}%</strong><small>演示流程转化指标</small></article>
      </section>

      <section className="recruiter-block">
        <header>
          <div><p className="section-kicker">Talent pipeline</p><h2>招聘人才管道</h2></div>
          <span>实时视图 · {active.length} 个活跃流程</span>
        </header>
        <div className="kanban-board">
          {stages.map(([stage, label]) => {
            const stageRows = rows.filter((row) =>
              stage === "screening"
                ? ["contacted", "screening"].includes(row.status)
                : row.status === stage,
            );
            return (
              <section className="kanban-column" key={stage}>
                <header><strong>{label}</strong><span>{stageRows.length}</span></header>
                <div>
                  {stageRows.slice(0, 4).map((row) => (
                    <article key={row.id}>
                      <div className="kanban-avatar">{row.candidateName.slice(0, 1)}</div>
                      <strong>{row.candidateName}</strong>
                      <p>{row.jobTitle}</p>
                      <small>{row.currentCompany || "公司待补充"} · {row.jobLevel || "职级待补充"}</small>
                      <footer><span>{row.jobDomain}</span><time>{row.updatedAt.slice(5, 10)}</time></footer>
                    </article>
                  ))}
                  {!stageRows.length ? <div className="kanban-empty">暂无候选人</div> : null}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="recruiter-grid">
        <div className="recruiter-block talent-table-block">
          <header>
            <div><p className="section-kicker">Recent talent</p><h2>最近更新的人才</h2></div>
            <Link href="/admin">查看完整数据 →</Link>
          </header>
          <div className="recruiter-table">
            <div className="recruiter-table-head"><span>候选人</span><span>目标职位</span><span>期望薪资</span><span>状态</span></div>
            {rows.slice(0, 6).map((row) => (
              <div className="recruiter-table-row" key={row.id}>
                <span><i>{row.candidateName.slice(0, 1)}</i><b>{row.candidateName}</b><small>{row.userEmail}</small></span>
                <span>{row.jobTitle}<small>{row.jobLocation}</small></span>
                <span>{row.expectedSalary || "待沟通"}</span>
                <span className={`status-chip status-${row.status}`}>{row.status}</span>
              </div>
            ))}
            {!rows.length ? <div className="kanban-empty">暂无申请数据，提交一份演示申请后这里会自动更新。</div> : null}
          </div>
        </div>

        <aside className="recruiter-side-card">
          <p className="section-kicker">AI action list</p>
          <h2>今天值得优先推进。</h2>
          <ol>
            <li><span>01</span><div><b>复核高匹配候选人</b><p>对 3 位 AI Infra 人才补充架构判断证据。</p></div></li>
            <li><span>02</span><div><b>安排面试反馈</b><p>{interviews.length} 个流程等待统一面试结论。</p></div></li>
            <li><span>03</span><div><b>更新人才触达</b><p>根据近期公开工作重新生成沟通内容。</p></div></li>
          </ol>
          <Link className="primary-button" href="/admin">进入管理控制台</Link>
        </aside>
      </section>
    </main>
  );
}
