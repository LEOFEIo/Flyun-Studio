import type { Metadata } from "next";
import { getChatGPTUser } from "../chatgpt-auth";
import { ProductHeader } from "../components/product-header";
import { JobExplorer } from "../components/job-explorer";
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

  const explorerJobs = rows.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    team: job.team,
    domain: job.domain,
    location: job.location,
    employmentType: job.employmentType,
    salaryRange: job.salaryRange,
    summary: job.summary,
    updatedAt: job.updatedAt,
  }));

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
      <JobExplorer jobs={explorerJobs} />
    </main>
  );
}
