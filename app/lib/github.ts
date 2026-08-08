export type GitHubProfile = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
};

export const githubStateCookie = "feiyun_github_state";
export const githubVerifierCookie = "feiyun_github_verifier";

export type GitHubRepository = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
};

function githubHeaders(token?: string) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Feiyun-Talent-Profile",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, {
    headers: githubHeaders(token),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(response.status === 404 ? "GitHub 用户不存在" : "GitHub 数据读取失败");
  }
  return (await response.json()) as T;
}

export async function fetchGitHubIdentity(login?: string, token?: string) {
  const endpoint = token
    ? "https://api.github.com/user"
    : `https://api.github.com/users/${encodeURIComponent(login ?? "")}`;
  return githubJson<GitHubProfile>(endpoint, token);
}

export async function fetchGitHubRepositories(login: string, token?: string) {
  const endpoint = token
    ? "https://api.github.com/user/repos?visibility=public&affiliation=owner&sort=updated&per_page=100"
    : `https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=100`;
  const repos = await githubJson<GitHubRepository[]>(endpoint, token);
  return repos.filter((repo) => !repo.fork);
}

export function topLanguages(repositories: GitHubRepository[]) {
  const counts = new Map<string, number>();
  repositories.forEach((repo) => {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([language]) => language);
}

export function githubAccountValues(
  profile: GitHubProfile,
  repositories: GitHubRepository[],
) {
  return {
    githubLogin: profile.login,
    githubId: String(profile.id),
    githubAvatarUrl: profile.avatar_url,
    githubName: profile.name ?? "",
    githubBio: profile.bio ?? "",
    githubCompany: profile.company ?? "",
    githubLocation: profile.location ?? "",
    githubFollowers: profile.followers,
    githubPublicRepos: profile.public_repos,
    githubTopLanguages: topLanguages(repositories).join(","),
    githubConnectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
