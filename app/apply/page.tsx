import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../db";
import { jobs, profiles } from "../../db/schema";
import { ProductHeader } from "../components/product-header";
import { ApplyForm } from "../components/apply-form";
import { demoJobs } from "../lib/demo-data";
import { requireUser } from "../lib/server-auth";

export const dynamic = "force-dynamic";

async function ApplyContent({ jobId }: { jobId: number }) {
  const user = await requireUser(`/apply?job=${jobId}`);
  const db = process.env.DATABASE_URL ? getDb() : null;
  const [jobRows, profileRows] = db
    ? await Promise.all([
        db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1),
        db
          .select()
          .from(profiles)
          .where(eq(profiles.userEmail, user.email))
          .limit(1),
      ])
    : [demoJobs.filter((job) => job.id === jobId), []];
  const job = jobRows[0];
  if (!job || job.status !== "active") notFound();

  return (
    <>
      <ProductHeader user={user} active="jobs" />
      <section className="form-page">
        <div className="form-intro">
          <p className="section-kicker">Opportunity application</p>
          <h1>告诉我们，你现在在哪里。</h1>
          <p>
            申请 <strong>{job.title}</strong>。这不是一份重复填写的简历，
            而是帮助顾问理解你的职业阶段与下一步选择。
          </p>
        </div>
        <ApplyForm
          job={{ id: job.id, title: job.title, location: job.location }}
          initialProfile={profileRows[0] ?? null}
        />
      </section>
    </>
  );
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const query = await searchParams;
  const jobId = Number(query.job);
  if (!Number.isInteger(jobId) || jobId < 1) notFound();
  return (
    <main className="product-page">
      <ApplyContent jobId={jobId} />
    </main>
  );
}
