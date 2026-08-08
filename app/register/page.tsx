import Link from "next/link";
import { redirect } from "next/navigation";
import { getChatGPTUser, safeRelativeReturnPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "请检查用户名、邮箱和密码。用户名需为 3–30 位英文字母、数字、下划线或短横线，密码至少 8 位。",
  database: "注册服务尚未连接数据库，请先在部署环境配置 DATABASE_URL。",
  email: "这个邮箱已经注册，可以直接登录。",
  username: "这个用户名已经被使用，请换一个。",
  conflict: "账号创建失败，请更换用户名或邮箱后重试。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to ?? "/workspace");
  const user = await getChatGPTUser();
  if (user) redirect(returnTo);

  return (
    <main className="signin-page register-page">
      <section className="signin-panel">
        <div className="signin-topline">
          <Link className="ui-mark" href="/">
            <span className="mark-symbol">拾</span>
            <span>飞云<small>FEIYUN</small></span>
          </Link>
          <span className="status-chip">PUBLIC ID</span>
        </div>

        <div className="signin-copy register-copy">
          <span className="ui-eyebrow">CREATE YOUR PROFILE</span>
          <h1>创建你的<br />公开人才主页。</h1>
          <p>获得专属 `/u/用户名` 链接，展示真实工作、职业方向，并连接你的 GitHub。</p>
        </div>

        <form action="/api/auth/register" method="post" className="signin-form register-form">
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="register-form-grid">
            <label>
              <span>用户名 *</span>
              <input autoCapitalize="none" autoComplete="username" name="username" placeholder="kelvinsun" pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,28}[A-Za-z0-9]" minLength={3} maxLength={30} required />
            </label>
            <label>
              <span>姓名 *</span>
              <input autoComplete="name" name="displayName" placeholder="你的姓名" minLength={2} maxLength={80} required />
            </label>
            <label>
              <span>邮箱 *</span>
              <input autoComplete="email" name="email" placeholder="you@example.com" type="email" required />
            </label>
            <label>
              <span>密码 *</span>
              <input autoComplete="new-password" name="password" placeholder="至少 8 位" type="password" minLength={8} maxLength={128} required />
            </label>
            <label className="full-field">
              <span>当前方向</span>
              <input name="currentRole" placeholder="例如：AI Infra / Product Designer" maxLength={120} />
            </label>
            <label className="full-field">
              <span>一句话介绍</span>
              <textarea name="bio" rows={3} placeholder="你正在做什么，以及希望解决什么问题" maxLength={1200} />
            </label>
          </div>
          {params.error ? <p className="signin-error">{errorMessages[params.error] ?? "注册失败，请重试。"}</p> : null}
          <button className="primary-button" type="submit">注册并创建主页 ↗</button>
        </form>

        <p className="signin-note">已有账号？ <Link href={`/signin?return_to=${encodeURIComponent(returnTo)}`}>返回登录</Link></p>
      </section>
      <aside className="signin-visual register-visual" aria-hidden="true">
        <span>FEIYUN / PROFILE</span>
        <div className="public-profile-preview">
          <i>你</i>
          <strong>yourname</strong>
          <p>Work, evidence and direction.</p>
          <code>/u/yourname</code>
        </div>
        <p>One profile.<br />Your real work.</p>
      </aside>
    </main>
  );
}
