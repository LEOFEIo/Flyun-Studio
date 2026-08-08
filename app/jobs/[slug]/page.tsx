import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getChatGPTUser } from "../../chatgpt-auth";
import { ProductHeader } from "../../components/product-header";
import { getPublicJob } from "../../lib/job-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJob(slug);
  return job
    ? { title: job.title, description: job.summary }
    : { title: "机会不存在" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, result] = await Promise.all([
    getChatGPTUser(),
    getPublicJob(slug),
  ]);
  const job = result;
  if (!job) notFound();

  return (
    <main className="product-page">
      <ProductHeader user={user} active="jobs" />
      <section className="job-detail">
        <Link className="back-link" href="/jobs">
          ← 返回全部机会
        </Link>
        <div className="job-detail-grid">
          <div className="job-detail-main">
            <p className="section-kicker">{job.domain}</p>
            <h1>{job.title}</h1>
            <p className="job-lead">{job.summary}</p>
            <div className="job-facts">
              <div><span>团队</span><strong>{job.team}</strong></div>
              <div><span>地点</span><strong>{job.location}</strong></div>
              <div><span>类型</span><strong>{job.employmentType}</strong></div>
              <div><span>薪酬</span><strong>{job.salaryRange}</strong></div>
            </div>
            <div className="job-section">
              <h2>我们在寻找</h2>
              <ul>
                {job.requirements.split("|").map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
            <div className="job-section">
              <h2>飞云如何帮助你</h2>
              <p>
                提交意向后，顾问会结合你的公开工作与补充资料完成人才判断，
                再与你确认公司、团队和岗位细节。你的薪酬与职业信息仅用于本次匹配。
              </p>
            </div>
          </div>
          <aside className="job-apply-card">
            <span>Interested?</span>
            <h2>对这个机会感兴趣</h2>
            <p>补充真实职业信息，顾问将在工作台中同步后续进度。</p>
            <a className="primary-button" href={`/apply?job=${job.id}`}>
              提交意向 ↗
            </a>
            <small>约 3 分钟 · 信息仅对你与顾问可见</small>
          </aside>
        </div>
      </section>
    </main>
  );
}
