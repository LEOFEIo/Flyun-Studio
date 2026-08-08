import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applications, jobs } from "../../../../db/schema";
import { requireApiAdmin } from "../../../lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;

  if (!process.env.DATABASE_URL) {
    return Response.json({ applications: [], storage: "browser" });
  }

  const rows = await getDb()
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
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt));

  return Response.json({ applications: rows });
}
