import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { profiles, users } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { ProductHeader } from "../../components/product-header";
import { PublicProfileActions } from "../../components/public-profile-actions";
import { fetchGitHubRepositories, type GitHubRepository } from "../../lib/github";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "公开人才主页",
  description: "展示真实工作、能力证据、职业方向与 GitHub 项目的飞云人才主页。",
};

type PublicProfile = {
  username: string;
  displayName: string;
  createdAt: string;
  githubLogin: string | null;
  githubAvatarUrl: string | null;
  githubName: string | null;
  githubBio: string | null;
  githubCompany: string | null;
  githubLocation: string | null;
  githubFollowers: number;
  githubPublicRepos: number;
  githubTopLanguages: string;
  fullName: string | null;
  location: string | null;
  currentCompany: string | null;
  currentRole: string | null;
  yearsExperience: number | null;
  skills: string | null;
  bio: string | null;
  profileStatus: "draft" | "complete" | "published" | null;
};

const demoProfile: PublicProfile = {
  username: "demo",
  displayName: "陈墨",
  createdAt: new Date().toISOString(),
  githubLogin: null,
  githubAvatarUrl: null,
  githubName: null,
  githubBio: "Building reliable AI infrastructure.",
  githubCompany: "Independent",
  githubLocation: "上海",
  githubFollowers: 128,
  githubPublicRepos: 24,
  githubTopLanguages: "TypeScript,Python,Rust",
  fullName: "陈墨",
  location: "上海",
  currentCompany: "独立研究者",
  currentRole: "AI Infra · Distributed Systems",
  yearsExperience: 8,
  skills: "分布式训练,推理优化,TypeScript,Python,Rust",
  bio: "长期关注训练恢复、推理效率与开发者工具，让复杂的基础设施更可靠、更易使用。",
  profileStatus: "published",
};

async function loadProfile(username: string) {
  if (!process.env.DATABASE_URL) return username === "demo" ? demoProfile : null;
  const [profile] = await getDb()
    .select({
      username: users.username,
      displayName: users.displayName,
      createdAt: users.createdAt,
      githubLogin: users.githubLogin,
      githubAvatarUrl: users.githubAvatarUrl,
      githubName: users.githubName,
      githubBio: users.githubBio,
      githubCompany: users.githubCompany,
      githubLocation: users.githubLocation,
      githubFollowers: users.githubFollowers,
      githubPublicRepos: users.githubPublicRepos,
      githubTopLanguages: users.githubTopLanguages,
      fullName: profiles.fullName,
      location: profiles.location,
      currentCompany: profiles.currentCompany,
      currentRole: profiles.currentRole,
      yearsExperience: profiles.yearsExperience,
      skills: profiles.skills,
      bio: profiles.bio,
      profileStatus: profiles.profileStatus,
    })
    .from(users)
    .leftJoin(profiles, eq(users.email, profiles.userEmail))
    .where(eq(users.username, username))
    .limit(1);
  return profile?.username ? (profile as PublicProfile) : null;
}

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/.test(username)) notFound();

  const [profile, viewer] = await Promise.all([loadProfile(username), getChatGPTUser()]);
  if (!profile) notFound();
  const owner = viewer?.username === profile.username;
  if (profile.profileStatus !== "published" && !owner) notFound();

  let repositories: GitHubRepository[] = [];
  if (profile.githubLogin) {
    repositories = await fetchGitHubRepositories(profile.githubLogin).catch(() => []);
  }

  const name = profile.fullName || profile.githubName || profile.displayName;
  const location = profile.location || profile.githubLocation;
  const company = profile.currentCompany || profile.githubCompany;
  const bio = profile.bio || profile.githubBio || "正在完善这份公开人才主页。";
  const skills = (profile.skills || profile.githubTopLanguages)
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = profile.githubTopLanguages.split(",").filter(Boolean);
  const featuredRepositories = repositories.slice(0, 6);

  return (
    <main className="public-profile-page">
      <ProductHeader user={viewer} />
      <section className="public-profile-shell">
        <header className="public-profile-hero">
          <div className="public-profile-identity">
            {profile.githubAvatarUrl ? (
              <Image src={profile.githubAvatarUrl} alt={`${name} 的头像`} width={112} height={112} priority />
            ) : (
              <span className="public-profile-avatar">{name.slice(0, 1)}</span>
            )}
            <div>
              <span className="verified-pill">✓ 公开人才主页</span>
              <h1>{name}</h1>
              <p>@{profile.username}{profile.currentRole ? ` · ${profile.currentRole}` : ""}</p>
            </div>
          </div>
          <PublicProfileActions username={profile.username} githubLogin={profile.githubLogin} owner={owner} />
        </header>

        <div className="public-profile-grid">
          <article className="public-profile-main">
            <p className="section-kicker">ABOUT</p>
            <h2>{bio}</h2>
            <div className="public-meta-row">
              {location ? <span>⌖ {location}</span> : null}
              {company ? <span>◎ {company}</span> : null}
              {profile.yearsExperience ? <span>↗ {profile.yearsExperience} 年经验</span> : null}
            </div>
            <div className="public-skill-list">
              {skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span>正在补充技能</span>}
            </div>
          </article>

          <aside className="public-profile-side">
            <article>
              <span>GitHub 公开仓库</span>
              <strong>{profile.githubPublicRepos}</strong>
            </article>
            <article>
              <span>GitHub 关注者</span>
              <strong>{profile.githubFollowers}</strong>
            </article>
            <article>
              <span>活跃技术语言</span>
              <strong>{languages.length || skills.slice(0, 3).length}</strong>
            </article>
          </aside>
        </div>

        <section className="public-work-section">
          <div className="block-heading">
            <div>
              <p className="section-kicker">PUBLIC WORK</p>
              <h2>最近的 GitHub 工作</h2>
            </div>
            {profile.githubLogin ? <a href={`https://github.com/${profile.githubLogin}?tab=repositories`} target="_blank" rel="noreferrer">全部仓库 ↗</a> : null}
          </div>
          {featuredRepositories.length ? (
            <div className="public-repo-grid">
              {featuredRepositories.map((repo) => (
                <a href={repo.html_url} target="_blank" rel="noreferrer" key={repo.id}>
                  <span>{repo.language || "Repository"}</span>
                  <strong>{repo.name}</strong>
                  <p>{repo.description || "查看这个公开项目及其最近更新。"}</p>
                  <small>☆ {repo.stargazers_count} · {repo.updated_at.slice(0, 10)}</small>
                </a>
              ))}
            </div>
          ) : (
            <div className="public-empty-work">
              <span>GH</span>
              <div>
                <h3>{profile.githubLogin ? "GitHub 暂时无法读取" : "还没有连接 GitHub"}</h3>
                <p>{owner ? "前往个人工作台连接 GitHub，公开项目会自动出现在这里。" : "这位用户正在整理公开工作。"}</p>
              </div>
              {owner ? <a className="secondary-button" href="/workspace">连接 GitHub ↗</a> : null}
            </div>
          )}
        </section>
      </section>
      <footer className="public-profile-footer">
        <span>FEIYUN PROFILE / @{profile.username}</span>
        <a href="/register">创建你的公开主页 ↗</a>
      </footer>
    </main>
  );
}
