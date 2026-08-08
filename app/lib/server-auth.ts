import { getChatGPTUser, requireChatGPTUser } from "../chatgpt-auth";

function configuredAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function requireUser(returnTo: string) {
  return requireChatGPTUser(returnTo);
}

export async function requireApiUser() {
  const user = await getChatGPTUser();
  if (!user) {
    return {
      user: null,
      response: Response.json({ error: "请先登录后继续" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

export function isAdminEmail(email: string) {
  const admin = configuredAdminEmail();
  return Boolean(admin && email.trim().toLowerCase() === admin);
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if (!result.user || result.response) return result;
  if (!isAdminEmail(result.user.email)) {
    return {
      user: result.user,
      response: Response.json({ error: "你没有顾问后台权限" }, { status: 403 }),
    };
  }
  return { user: result.user, response: null };
}
