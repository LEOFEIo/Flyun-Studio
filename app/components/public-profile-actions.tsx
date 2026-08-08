"use client";

import { useState } from "react";
import Link from "next/link";

export function PublicProfileActions({
  username,
  githubLogin,
  owner,
}: {
  username: string;
  githubLogin: string | null;
  owner: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/u/${username}`;
    if (navigator.share) {
      await navigator.share({ title: `@${username} · 飞云`, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="public-profile-actions">
      <button className="primary-button" type="button" onClick={share}>
        {copied ? "链接已复制 ✓" : "分享主页 ↗"}
      </button>
      {githubLogin ? (
        <a className="secondary-button" href={`https://github.com/${githubLogin}`} target="_blank" rel="noreferrer">
          GitHub
        </a>
      ) : null}
      {owner ? <Link className="secondary-button" href="/workspace#profile">编辑主页</Link> : null}
    </div>
  );
}
