import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow();

const updatedAt = () =>
  timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  githubLogin: text("github_login"),
  githubId: text("github_id"),
  githubAvatarUrl: text("github_avatar_url"),
  githubName: text("github_name"),
  githubBio: text("github_bio"),
  githubCompany: text("github_company"),
  githubLocation: text("github_location"),
  githubFollowers: integer("github_followers").notNull().default(0),
  githubPublicRepos: integer("github_public_repos").notNull().default(0),
  githubTopLanguages: text("github_top_languages").notNull().default(""),
  githubConnectedAt: timestamp("github_connected_at", {
    withTimezone: true,
    mode: "string",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull().unique(),
  fullName: text("full_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  location: text("location").notNull().default(""),
  currentCompany: text("current_company").notNull().default(""),
  currentRole: text("current_role").notNull().default(""),
  yearsExperience: integer("years_experience").notNull().default(0),
  currentSalary: text("current_salary").notNull().default(""),
  expectedSalary: text("expected_salary").notNull().default(""),
  jobLevel: text("job_level").notNull().default(""),
  promotionStatus: text("promotion_status").notNull().default(""),
  performancePay: text("performance_pay").notNull().default(""),
  skills: text("skills").notNull().default(""),
  bio: text("bio").notNull().default(""),
  profileStatus: text("profile_status", {
    enum: ["draft", "complete", "published"],
  })
    .notNull()
    .default("draft"),
  updatedAt: updatedAt(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  team: text("team").notNull(),
  domain: text("domain").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull().default("全职"),
  salaryRange: text("salary_range").notNull().default("面议"),
  summary: text("summary").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status", { enum: ["draft", "active", "closed"] })
    .notNull()
    .default("active"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userEmail: text("user_email").notNull(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id),
  candidateName: text("candidate_name").notNull(),
  phone: text("phone").notNull().default(""),
  currentCompany: text("current_company").notNull().default(""),
  currentSalary: text("current_salary").notNull(),
  expectedSalary: text("expected_salary").notNull(),
  jobLevel: text("job_level").notNull(),
  promotionStatus: text("promotion_status").notNull(),
  performancePay: text("performance_pay").notNull(),
  motivation: text("motivation").notNull().default(""),
  status: text("status", {
    enum: [
      "new",
      "contacted",
      "screening",
      "interview",
      "offer",
      "hired",
      "closed",
    ],
  })
    .notNull()
    .default("new"),
  consultantNotes: text("consultant_notes").notNull().default(""),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const talentProfiles = pgTable("talent_profiles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  location: text("location").notNull(),
  summary: text("summary").notNull(),
  skills: text("skills").notNull(),
  evidenceCount: integer("evidence_count").notNull().default(0),
  sourceCount: integer("source_count").notNull().default(0),
  matchScore: integer("match_score").notNull().default(80),
  recentSignal: text("recent_signal").notNull().default(""),
  verified: boolean("verified").notNull().default(true),
  updatedAt: updatedAt(),
});
