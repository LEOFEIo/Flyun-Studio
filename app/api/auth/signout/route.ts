import { NextResponse } from "next/server";
import {
  safeRelativeReturnPath,
  sessionCookieName,
} from "../../../chatgpt-auth";

export async function GET(request: Request) {
  const returnTo = safeRelativeReturnPath(
    new URL(request.url).searchParams.get("return_to") ?? "/",
  );
  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
