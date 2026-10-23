import Link from "next/link";
import { ProductHeader } from "../components/product-header";
import { IosIcon } from "../components/ios-icon";
import { redirect } from "next/navigation";
import { getChatGPTUser, safeRelativeReturnPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "请填写有效的姓名和邮箱。",
  admin: "管理员密码不正确。",
  password: "账号或密码不正确。",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to ?? "/workspace");
  const user = await getChatGPTUser();
  if (user) redirect(returnTo);

  return (
    <main className="ios-app ios-auth">
      <ProductHeader />
      <div className="ios-auth-shell">
        <section className="ios-auth-paper">
          <span className="ios-icon-tile blue">
            <IosIcon name="shield" size={26} />
          </span>
          <span className="ios-overline">YOUR NEXT CONNECTION STARTS HERE</span>
          <h1>欢迎回到飞云。</h1>
          <p>登录工作台，让每一次连接都有进展。</p>
          <form
            action="/api/auth/signin"
            method="post"
            className="ios-auth-form"
          >
            <input type="hidden" name="returnTo" value={returnTo} />
            <label>
              姓名 <small>候选人填写</small>
              <input
                autoComplete="name"
                name="displayName"
                placeholder="你的姓名"
              />
            </label>
            <label>
              用户名或邮箱
              <input
                autoComplete="username"
                name="email"
                placeholder="候选人邮箱 / 管理员用户名"
                required
              />
            </label>
            <label>
              密码 <small>已注册账号或管理员填写</small>
              <input
                autoComplete="current-password"
                name="password"
                placeholder="请输入密码"
                type="password"
              />
            </label>
            {params.error && (
              <p className="ios-form-error" role="alert">
                {errorMessages[params.error] ?? "登录失败，请重试。"}
              </p>
            )}
            <button className="ios-button" type="submit">
              进入工作台 <IosIcon name="arrow" size={18} />
            </button>
          </form>
          <p className="ios-auth-register">
            第一次来到飞云？
            <Link href={`/register?return_to=${encodeURIComponent(returnTo)}`}>
              创建账号
            </Link>
          </p>
          <div className="ios-auth-note">
            <IosIcon name="shield" size={14} />
            候选人查看个人申请，管理员进入招聘工作台。
          </div>
        </section>
        <Link className="ios-text-link" href="/jobs">
          先看看开放机会 <IosIcon name="chevron" size={15} />
        </Link>
      </div>
    </main>
  );
}
