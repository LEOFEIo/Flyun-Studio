import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../../db";
import { profiles, users } from "../../../../db/schema";
import {
  createSessionToken,
  safeRelativeReturnPath,
  sessionCookieName,
} from "../../../chatgpt-auth";
import { hashPassword } from "../../../lib/password";

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;
const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "apply",
  "candidate",
  "jobs",
  "recruiter",
  "register",
  "signin",
  "u",
  "workspace",
]);

function registerError(request: Request, returnTo: string, error: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("return_to", returnTo);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const displayName = String(form.get("displayName") ?? "").trim().slice(0, 80);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(form.get("password") ?? "");
  const currentRole = String(form.get("currentRole") ?? "").trim().slice(0, 120);
  const bio = String(form.get("bio") ?? "").trim().slice(0, 1200);
  const returnTo = safeRelativeReturnPath(String(form.get("returnTo") ?? "/workspace"));

  if (
    !USERNAME_PATTERN.test(username) ||
    RESERVED_USERNAMES.has(username) ||
    displayName.length < 2 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return registerError(request, returnTo, "invalid");
  }

  if (!process.env.DATABASE_URL) {
    return registerError(request, returnTo, "database");
  }

  const db = getDb();
  const [existing] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  if (existing) {
    return registerError(
      request,
      returnTo,
      existing.email === email ? "email" : "username",
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    await db.insert(users).values({
      email,
      username,
      passwordHash,
      displayName,
    });
    await db.insert(profiles).values({
      userEmail: email,
      fullName: displayName,
      currentRole,
      bio,
      profileStatus: "published",
    });

    const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
    response.cookies.set(
      sessionCookieName,
      createSessionToken({
        displayName,
        email,
        fullName: displayName,
        username,
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
  } catch {
    return registerError(request, returnTo, "conflict");
  }
}
