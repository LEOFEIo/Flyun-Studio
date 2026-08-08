"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type GitHubAccount = {
  githubLogin: string | null;
  githubAvatarUrl: string | null;
  githubFollowers: number;
  githubPublicRepos: number;
  githubTopLanguages: string;
};

export function GitHubConnectCard({
  account,
  username,
  oauthStatus,
}: {
  account: GitHubAccount | null;
  username: string | null;
  oauthStatus?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    oauthStatus === "failed"
      ? "GitHub 授权未完成，请重试或使用公开用户名绑定。"
      : oauthStatus === "unconfigured"
        ? "OAuth 尚未配置，可先使用下方公开用户名绑定。"
        : "",
  );

  async function linkPublicAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/github/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: form.get("login") }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "绑定失败");
      setMessage("GitHub 已连接，公开资料已同步。");
      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "GitHub 绑定失败");
    } finally {
      setLoading(false);
    }
  }

  const languages = account?.githubTopLanguages.split(",").filter(Boolean) ?? [];

  return (
    <section className="dashboard-block github-connect-card">
      <div className="block-heading">
        <div>
          <p className="section-kicker">GitHub identity</p>
          <h2>连接你的真实工作</h2>
        </div>
        {username ? <Link href={`/u/${username}`}>查看公开主页 ↗</Link> : <a href="/api/auth/signout?return_to=%2Fregister">注册公开账号 ↗</a>}
      </div>

      {account?.githubLogin ? (
        <div className="github-account-summary">
          {account.githubAvatarUrl ? <Image src={account.githubAvatarUrl} alt="" width={56} height={56} /> : <span className="github-mark">GH</span>}
          <div>
            <span>已连接</span>
            <strong>@{account.githubLogin}</strong>
            <small>{account.githubPublicRepos} 个公开仓库 · {account.githubFollowers} 位关注者</small>
          </div>
          <div className="github-language-list">
            {languages.map((language) => <span key={language}>{language}</span>)}
          </div>
          <a className="secondary-button" href={`https://github.com/${account.githubLogin}`} target="_blank" rel="noreferrer">打开 GitHub ↗</a>
        </div>
      ) : (
        <div className="github-connect-grid">
          <div>
            <span className="github-mark">GH</span>
            <h3>GitHub OAuth</h3>
            <p>授权后同步公开头像、简介、仓库与语言，不保存访问令牌。</p>
            <a className="primary-button" href="/api/github/connect">使用 GitHub 连接 ↗</a>
          </div>
          <form onSubmit={linkPublicAccount}>
            <h3>或绑定公开用户名</h3>
            <p>无需授权，直接读取 GitHub 已公开的信息。</p>
            <label>
              <span>GitHub 用户名</span>
              <div>
                <input name="login" placeholder="octocat" autoCapitalize="none" required />
                <button className="secondary-button" type="submit" disabled={loading}>{loading ? "同步中…" : "连接"}</button>
              </div>
            </label>
          </form>
        </div>
      )}
      {message ? <p className="form-message-inline">{message}</p> : null}
    </section>
  );
}
