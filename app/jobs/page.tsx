import type { Metadata } from "next";
import { getChatGPTUser } from "../chatgpt-auth";
import { ProductHeader } from "../components/product-header";
import { getPublicJobs } from "../lib/job-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI 机会",
  description: "浏览飞云精选的大模型、AI Infra、机器人和自动驾驶机会。",
};

export default async function JobsPage() {
  const [user, rows] = await Promise.all([
    getChatGPTUser(),
    getPublicJobs(),
  ]);

  const domains = [...new Set(rows.map((job) => job.domain))];

  return (
    <main className="product-page">
      <ProductHeader user={user} active="jobs" />
      <section className="jobs-hero">
        <p className="section-kicker">Curated opportunities</p>
        <h1>
          去做值得被
          <br />
          记住的工作。
        </h1>
        <p>
          面向大模型、AI Infra、机器人、自动驾驶和芯片领域的稀缺人才。
          公司信息将在匹配确认后由顾问提供。
        </p>
      </section>
      <section className="jobs-layout">
        <aside className="jobs-filter">
          <span>方向</span>
          <a href="#all">全部机会 <b>{rows.length}</b></a>
          {domains.map((domain) => (
            <a key={domain} href={`#${domain}`}>
              {domain}
              <b>{rows.filter((job) => job.domain === domain).length}</b>
            </a>
          ))}
        </aside>
        <div className="jobs-list" id="all">
          {rows.map((job, index) => (
            <a className="job-card" href={`/jobs/${job.slug}`} key={job.id}>
              <div className="job-index">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="job-tags">
                  <span>{job.domain}</span>
                  <span>{job.employmentType}</span>
                </div>
                <h2>{job.title}</h2>
                <p>{job.summary}</p>
              </div>
              <div className="job-meta">
                <span>{job.location}</span>
                <strong>{job.salaryRange}</strong>
                <i>↗</i>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
