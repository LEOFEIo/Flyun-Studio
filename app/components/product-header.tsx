import type { ChatGPTUser } from "../chatgpt-auth";
import { chatGPTSignInPath, chatGPTSignOutPath } from "../chatgpt-auth";
import Link from "next/link";
export function ProductHeader({
  user,
  active,
}: {
  user?: ChatGPTUser | null;
  active?:
    "product" | "jobs" | "workspace" | "candidate" | "recruiter" | "admin";
}) {
  const links = [
    ["product", "/", "产品概览"],
    ["jobs", "/jobs", "发现机会"],
    ["candidate", "/candidate", "候选人中心"],
    ["recruiter", "/recruiter", "招聘工作台"],
  ];
  return (
    <header className="ios-header">
      <Link className="ios-brand" href="/" aria-label="飞云首页">
        <span className="ios-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 17 12 5l7 12M8 13h8M7 19h10"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <b>
          飞云<span>FEIYUN</span>
        </b>
      </Link>
      <nav className="ios-header-nav" aria-label="主导航">
        {links.map(([key, href, label]) => (
          <Link
            key={key}
            href={href}
            aria-current={active === key ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="ios-header-account">
        {user ? (
          <>
            <span>{user.displayName}</span>
            <a href={chatGPTSignOutPath("/")}>退出</a>
          </>
        ) : (
          <>
            <Link href={chatGPTSignInPath("/recruiter")}>登录</Link>
            <Link className="ios-button small" href="/register">
              开始使用
            </Link>
          </>
        )}
      </div>
      <details className="ios-mobile-menu">
        <summary aria-label="展开导航">菜单</summary>
        <nav>
          {links.map(([key, href, label]) => (
            <Link key={key} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
