import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { chatGPTSignInPath, getChatGPTUser } from "../../../chatgpt-auth";
import { githubStateCookie, githubVerifierCookie } from "../../../lib/github";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.redirect(new URL(chatGPTSignInPath("/workspace"), request.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/workspace?github=unconfigured", request.url));
  }

  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const redirectUri = new URL("/api/github/callback", request.url).toString();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorize);
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  };
  response.cookies.set(githubStateCookie, state, cookieOptions);
  response.cookies.set(githubVerifierCookie, verifier, cookieOptions);
  return response;
}
