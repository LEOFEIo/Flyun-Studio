"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type JobExplorerItem = {
  id: number;
  slug: string;
  title: string;
  team: string;
  domain: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  summary: string;
  updatedAt: string;
};

type WorkMode = "all" | "remote" | "onsite";
type SortMode = "latest" | "title";

const favoritesKey = "feiyun_favorite_jobs_v1";

export function JobExplorer({ jobs }: { jobs: JobExplorerItem[] }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("全部机会");
  const [workMode, setWorkMode] = useState<WorkMode>("all");
  const [sort, setSort] = useState<SortMode>("latest");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]") as unknown;
        if (Array.isArray(stored)) {
          const available = new Set(jobs.map((job) => job.slug));
          setFavorites(
            stored.filter(
              (value): value is string =>
                typeof value === "string" && available.has(value),
            ),
          );
        }
      } catch {
        localStorage.removeItem(favoritesKey);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [jobs]);

  const domains = useMemo(
    () => ["全部机会", ...new Set(jobs.map((job) => job.domain))],
    [jobs],
  );

  const domainCounts = useMemo(
    () =>
      Object.fromEntries(
        domains.map((item) => [
          item,
          item === "全部机会" ? jobs.length : jobs.filter((job) => job.domain === item).length,
        ]),
      ) as Record<string, number>,
    [domains, jobs],
  );

  const visibleJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return jobs
      .filter((job) => domain === "全部机会" || job.domain === domain)
      .filter((job) => {
        if (workMode === "all") return true;
        const remote = job.location.includes("远程");
        return workMode === "remote" ? remote : !remote;
      })
      .filter((job) => !favoriteOnly || favorites.includes(job.slug))
      .filter((job) => {
        if (!normalized) return true;
        return [job.title, job.team, job.domain, job.location, job.summary]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((left, right) =>
        sort === "title"
          ? left.title.localeCompare(right.title, "zh-CN")
          : Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
      );
  }, [domain, favoriteOnly, favorites, jobs, query, sort, workMode]);

  function toggleFavorite(slug: string) {
    setFavorites((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      localStorage.setItem(favoritesKey, JSON.stringify(next));
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setDomain("全部机会");
    setWorkMode("all");
    setSort("latest");
    setFavoriteOnly(false);
  }

  return (
    <section className="job-explorer" aria-label="职位探索器">
      <aside className="job-explorer-filter">
        <span className="mission-eyebrow">MISSION FILTER</span>
        <h2>研究方向</h2>
        <div className="job-domain-filters">
          {domains.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={domain === item}
              onClick={() => setDomain(item)}
            >
              <span>{item}</span>
              <b>{domainCounts[item]}</b>
            </button>
          ))}
        </div>
        <button
          className="favorite-filter"
          type="button"
          aria-pressed={favoriteOnly}
          onClick={() => setFavoriteOnly((current) => !current)}
        >
          <span>只看已收藏</span>
          <b>{favorites.length}</b>
        </button>
      </aside>

      <div className="job-explorer-main">
        <div className="job-explorer-toolbar">
          <label className="job-search-field">
            <span>搜索职位</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="职位、方向、城市或关键词"
            />
          </label>
          <label>
            <span>工作方式</span>
            <select value={workMode} onChange={(event) => setWorkMode(event.target.value as WorkMode)}>
              <option value="all">全部方式</option>
              <option value="remote">支持远程</option>
              <option value="onsite">现场优先</option>
            </select>
          </label>
          <label>
            <span>排序</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="latest">最近更新</option>
              <option value="title">职位名称</option>
            </select>
          </label>
        </div>

        <div className="job-results-meta" aria-live="polite">
          <span><b>{String(visibleJobs.length).padStart(2, "0")}</b> 个匹配机会</span>
          <span>{domain} · {favoriteOnly ? "已收藏任务" : "全部任务"}</span>
          <button type="button" onClick={clearFilters}>清除筛选</button>
        </div>

        <div className="jobs-list job-explorer-list">
          {visibleJobs.map((job, index) => {
            const saved = favorites.includes(job.slug);
            return (
              <article className="job-card job-explorer-card" key={job.id}>
                <div className="job-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="job-card-body">
                  <div className="job-tags">
                    <span>{job.domain}</span>
                    <span>{job.employmentType}</span>
                    <span>{job.team}</span>
                  </div>
                  <Link href={`/jobs/${job.slug}`}><h2>{job.title}</h2></Link>
                  <p>{job.summary}</p>
                </div>
                <div className="job-meta">
                  <span>{job.location}</span>
                  <strong>{job.salaryRange}</strong>
                  <button
                    className="job-save-button"
                    type="button"
                    aria-pressed={saved}
                    onClick={() => toggleFavorite(job.slug)}
                  >
                    {saved ? "已收藏" : "收藏职位"}
                  </button>
                  <Link className="job-open-link" href={`/jobs/${job.slug}`} aria-label={`查看 ${job.title}`}>
                    查看任务 ↗
                  </Link>
                </div>
              </article>
            );
          })}
          {!visibleJobs.length && (
            <div className="job-empty-state">
              <span className="mission-eyebrow">NO MATCH / 00</span>
              <h2>没有符合条件的机会</h2>
              <p>试试更宽的研究方向，或清除当前筛选。</p>
              <button type="button" onClick={clearFilters}>重置职位雷达</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
