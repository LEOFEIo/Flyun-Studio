import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getChatGPTUser,
  safeRelativeReturnPath,
} from "../chatgpt-auth";

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
    <main className="signin-page">
      <section className="signin-panel">
        <div className="signin-topline">
          <Link className="ui-mark" href="/">
            <span className="mark-symbol">拾</span>
            <span>
              飞云
              <small>FEIYUN</small>
            </span>
          </Link>
          <span className="status-chip">SECURE</span>
        </div>

        <div className="signin-copy">
          <span className="ui-eyebrow">SECURE WORKSPACE</span>
          <h1>进入你的<br />人才工作台。</h1>
          <p>
            候选人可查看申请进度；管理员使用用户名与密码进入招聘方后台。
          </p>
        </div>

        <form action="/api/auth/signin" method="post" className="signin-form">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label>
            <span>姓名 <small>候选人必填</small></span>
            <input
              autoComplete="name"
              name="displayName"
              placeholder="你的姓名"
            />
          </label>
          <label>
            <span>用户名或邮箱</span>
            <input
              autoComplete="username"
              name="email"
              placeholder="候选人邮箱 / 管理员用户名"
              type="text"
              required
            />
          </label>
          <label>
            <span>密码 <small>已注册账号或管理员填写</small></span>
            <input
              autoComplete="current-password"
              name="password"
              placeholder="••••••••"
              type="password"
            />
          </label>
          {params.error ? (
            <p className="signin-error">
              {errorMessages[params.error] ?? "登录失败，请重试。"}
            </p>
          ) : null}
          <button className="primary-button" type="submit">
            进入工作台 ↗
          </button>
        </form>

        <p className="signin-note">
          还没有公开主页？ <Link href={`/register?return_to=${encodeURIComponent(returnTo)}`}>注册账号</Link><br />
          演示管理员：用户名 admin。生产部署请通过环境变量更换账号和密码。
        </p>
      </section>
      <aside className="signin-visual" aria-hidden="true">
        <span>FEIYUN / AUTH</span>
        <div className="auth-orbit">
          <i />
          <i />
          <i />
        </div>
        <p>Evidence first.<br />People always.</p>
      </aside>
    </main>
  );
}
