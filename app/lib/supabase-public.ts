const DEFAULT_SUPABASE_URL = "https://neppacfsixrjzpkvcgxy.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz";

type QueryValue = string | number | boolean;

export type SupabasePublicJob = {
  id: number;
  slug: string;
  title: string;
  team: string;
  domain: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  summary: string;
  requirements: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SupabaseTalentProfile = {
  id: number;
  name: string;
  title: string;
  domain: string;
  skills: string;
  summary: string;
  evidenceCount: number;
  sourceCount: number;
  matchScore: number;
};

function config() {
  return {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function supabaseFetch<T>(
  path: string,
  query: Record<string, QueryValue> = {},
): Promise<T> {
  const { url, key } = config();
  const endpoint = new URL(path, `${url.replace(/\/$/, "")}/`);
  Object.entries(query).forEach(([name, value]) => {
    endpoint.searchParams.set(name, String(value));
  });

  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 240);
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }
  return (await response.json()) as T;
}

export async function verifySupabaseConnection() {
  await supabaseFetch<Record<string, unknown>>("auth/v1/settings");
  return {
    connected: true,
    projectUrl: config().url,
    access: "publishable/RLS",
  } as const;
}

async function selectRows<T>(
  table: string,
  query: Record<string, QueryValue>,
): Promise<T[]> {
  if (!/^[a-z][a-z0-9_]*$/.test(table)) {
    throw new Error("Invalid Supabase table name.");
  }
  return supabaseFetch<T[]>(`rest/v1/${table}`, query);
}

export async function getSupabasePublicJobs(): Promise<SupabasePublicJob[]> {
  const rows = await selectRows<Record<string, unknown>>("jobs", {
    select:
      "id,slug,title,team,domain,location,employment_type,salary_range,summary,requirements,status,created_at,updated_at",
    status: "eq.active",
    order: "id.asc",
    limit: 100,
  });

  return rows.map((row) => ({
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    team: String(row.team ?? ""),
    domain: String(row.domain ?? ""),
    location: String(row.location ?? ""),
    employmentType: String(row.employment_type ?? "全职"),
    salaryRange: String(row.salary_range ?? "面议"),
    summary: String(row.summary ?? ""),
    requirements: String(row.requirements ?? ""),
    status: String(row.status ?? "active"),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }));
}

export async function getSupabasePublicJob(
  slug: string,
): Promise<SupabasePublicJob | null> {
  const rows = await selectRows<Record<string, unknown>>("jobs", {
    select:
      "id,slug,title,team,domain,location,employment_type,salary_range,summary,requirements,status,created_at,updated_at",
    slug: `eq.${slug}`,
    status: "eq.active",
    limit: 1,
  });
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: Number(row.id),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    team: String(row.team ?? ""),
    domain: String(row.domain ?? ""),
    location: String(row.location ?? ""),
    employmentType: String(row.employment_type ?? "全职"),
    salaryRange: String(row.salary_range ?? "面议"),
    summary: String(row.summary ?? ""),
    requirements: String(row.requirements ?? ""),
    status: String(row.status ?? "active"),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function getSupabaseTalentProfiles(
  search = "",
): Promise<SupabaseTalentProfile[]> {
  const rows = await selectRows<Record<string, unknown>>("talent_profiles", {
    select:
      "id,name,title,domain,skills,summary,evidence_count,source_count,match_score",
    order: "match_score.desc",
    limit: 50,
  });
  const normalizedSearch = search.trim().toLowerCase();
  return rows
    .map((row) => ({
      id: Number(row.id),
      name: String(row.name ?? ""),
      title: String(row.title ?? ""),
      domain: String(row.domain ?? ""),
      skills: String(row.skills ?? ""),
      summary: String(row.summary ?? ""),
      evidenceCount: Number(row.evidence_count ?? 0),
      sourceCount: Number(row.source_count ?? 0),
      matchScore: Number(row.match_score ?? 0),
    }))
    .filter((profile) => {
      if (!normalizedSearch) return true;
      return [profile.title, profile.domain, profile.skills, profile.summary]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .slice(0, 12);
}
