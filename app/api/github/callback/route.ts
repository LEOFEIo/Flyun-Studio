import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import {
  fetchGitHubIdentity,
  fetchGitHubRepositories,
  githubAccountValues,
  githubStateCookie,
  githubVerifierCookie,
} from "../../../lib/github";

export const dynamic = "force-dynamic";

function finish(request: Request, status: string) {
  const response = NextResponse.redirect(new URL(`/workspace?github=${status}`, request.url));
  response.cookies.set(githubStateCookie, "", { path: "/", maxAge: 0 });
  response.cookies.set(githubVerifierCookie, "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user || !process.env.DATABASE_URL) return finish(request, "failed");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(githubStateCookie)?.value;
  const verifier = request.cookies.get(githubVerifierCookie)?.value;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!code || !state || !expectedState || state !== expectedState || !verifier || !clientId || !clientSecret) {
    return finish(request, "failed");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: new URL("/api/github/callback", request.url).toString(),
        code_verifier: verifier,
      }),
      cache: "no-store",
    });
    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenResponse.ok || !tokenPayload.access_token) return finish(request, "failed");

    const profile = await fetchGitHubIdentity(undefined, tokenPayload.access_token);
    const repositories = await fetchGitHubRepositories(profile.login, tokenPayload.access_token);
    const db = getDb();
    await db
      .insert(users)
      .values({ email: user.email, displayName: user.displayName })
      .onConflictDoNothing();
    await db
      .update(users)
      .set(githubAccountValues(profile, repositories))
      .where(eq(users.email, user.email));
    return finish(request, "connected");
  } catch {
    return finish(request, "failed");
  }
}
