import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import {
  createSessionToken,
  safeRelativeReturnPath,
  sessionCookieName,
} from "../../../chatgpt-auth";
import { verifyPassword } from "../../../lib/password";

export async function POST(request: Request) {
  const form = await request.formData();
  const displayName = String(form.get("displayName") ?? "").trim().slice(0, 80);
  const login = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(form.get("password") ?? "");
  const returnTo = safeRelativeReturnPath(
    String(form.get("returnTo") ?? "/workspace"),
  );
  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("return_to", returnTo);

  const adminUsername = (process.env.ADMIN_USERNAME ?? "").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const isAdminLogin = Boolean(
    adminPassword &&
      ((adminUsername && login === adminUsername) ||
        (adminEmail && login === adminEmail)),
  );
  let email = isAdminLogin ? adminEmail : login;
  let account:
    | {
        email: string;
        username: string | null;
        passwordHash: string | null;
        displayName: string;
        fullName: string | null;
      }
    | undefined;

  if (!isAdminLogin && process.env.DATABASE_URL) {
    [account] = await getDb()
      .select({
        email: users.email,
        username: users.username,
        passwordHash: users.passwordHash,
        displayName: users.displayName,
        fullName: profiles.fullName,
      })
      .from(users)
      .leftJoin(profiles, eq(users.email, profiles.userEmail))
      .where(or(eq(users.email, login), eq(users.username, login)))
      .limit(1);
    if (account) email = account.email;
  }

  if ((!isAdminLogin && !account && (!displayName || !email.includes("@"))) || !login) {
    signInUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(signInUrl, 303);
  }

  if (isAdminLogin && password !== adminPassword) {
    signInUrl.searchParams.set("error", "admin");
    return NextResponse.redirect(signInUrl, 303);
  }

  if (account?.passwordHash) {
    const validPassword = await verifyPassword(password, account.passwordHash);
    if (!validPassword) {
      signInUrl.searchParams.set("error", "password");
      return NextResponse.redirect(signInUrl, 303);
    }
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.cookies.set(
    sessionCookieName,
    createSessionToken({
      displayName: isAdminLogin ? "admin" : (account?.displayName ?? displayName),
      email,
      fullName: isAdminLogin
        ? "Administrator"
        : (account?.fullName || account?.displayName || displayName),
      username: isAdminLogin ? null : (account?.username ?? null),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    },
  );
  return response;
}
