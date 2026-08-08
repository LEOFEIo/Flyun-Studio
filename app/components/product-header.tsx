import type { ChatGPTUser } from "../chatgpt-auth";
import { chatGPTSignInPath, chatGPTSignOutPath } from "../chatgpt-auth";
import Link from "next/link";

export function ProductHeader({
  user,
  active,
}: {
  user?: ChatGPTUser | null;
  active?: "product" | "jobs" | "workspace" | "candidate" | "recruiter" | "admin";
}) {
  const signInReturnTo =
    active === "recruiter" || active === "admin"
      ? "/recruiter"
      : active === "candidate" || active === "workspace"
        ? "/candidate"
        : "/workspace";

  return (
    <header className="product-header">
      <Link className="wordmark" href="/">
        <i aria-hidden="true">拾</i>
        <span>
          <b>飞云</b>
          <small>talent intelligence</small>
        </span>
      </Link>
      <nav className="product-nav" aria-label="产品导航">
        <Link
          className={active === "product" ? "active" : ""}
          href="/#thinking"
        >
          产品
        </Link>
        <Link className={active === "jobs" ? "active" : ""} href="/jobs">
          开放机会
        </Link>
        <Link
          className={["workspace", "candidate"].includes(active ?? "") ? "active" : ""}
          href="/candidate"
        >
          候选人端
        </Link>
        <Link
          className={["recruiter", "admin"].includes(active ?? "") ? "active" : ""}
          href="/recruiter"
        >
          招聘方后台
        </Link>
      </nav>
      <div className="product-account">
        {user ? (
          <>
            {user.username ? (
              <Link className="header-text-action" href={`/u/${user.username}`}>
                我的主页
              </Link>
            ) : null}
            <span className="account-name">
              <i className="live-dot" />
              {user.displayName}
            </span>
            <a className="header-text-action" href={chatGPTSignOutPath("/")}>
              退出
            </a>
          </>
        ) : (
          <>
            <a
              className="header-text-action"
              href={chatGPTSignInPath(signInReturnTo)}
            >
              登录
            </a>
            <Link className="header-primary-action" href="/register">
              创建主页
            </Link>
          </>
        )}
      </div>
      <details className="mobile-nav">
        <summary>菜单</summary>
        <nav aria-label="移动端产品导航">
          <Link href="/#thinking">产品</Link>
          <Link href="/jobs">开放机会</Link>
          <Link href="/candidate">候选人端</Link>
          <Link href="/recruiter">招聘方后台</Link>
          {user?.username ? <Link href={`/u/${user.username}`}>我的主页</Link> : <a href={chatGPTSignOutPath("/register")}>注册公开账号</a>}
        </nav>
      </details>
    </header>
  );
}
