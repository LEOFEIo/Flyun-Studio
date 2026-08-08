import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import {
  fetchGitHubIdentity,
  fetchGitHubRepositories,
  githubAccountValues,
} from "../../../lib/github";
import { requireApiUser } from "../../../lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "尚未连接数据库" }, { status: 503 });
  }

  const body = (await request.json()) as { login?: unknown };
  const login = String(body.login ?? "").trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(login)) {
    return Response.json({ error: "请输入有效的 GitHub 用户名" }, { status: 400 });
  }

  try {
    const profile = await fetchGitHubIdentity(login);
    const repositories = await fetchGitHubRepositories(profile.login);
    const db = getDb();
    await db
      .insert(users)
      .values({ email: auth.user.email, displayName: auth.user.displayName })
      .onConflictDoNothing();
    await db
      .update(users)
      .set(githubAccountValues(profile, repositories))
      .where(eq(users.email, auth.user.email));
    return Response.json({ ok: true, login: profile.login });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "GitHub 绑定失败" },
      { status: 400 },
    );
  }
}
