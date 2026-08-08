"use client";

import { FormEvent, useMemo, useState } from "react";

const suggestions = [
  "懂千卡训练与推理优化的人",
  "有真机量产经验的具身算法专家",
  "做过世界模型与端到端驾驶的人",
];

const fallbackResults = [
  {
    id: 1,
    name: "陈墨",
    title: "AI Infra · 分布式训练",
    evidenceCount: 16,
    sourceCount: 9,
    matchScore: 94,
  },
  {
    id: 2,
    name: "林乔",
    title: "具身智能 · 机器人学习",
    evidenceCount: 14,
    sourceCount: 7,
    matchScore: 91,
  },
  {
    id: 3,
    name: "周也",
    title: "推理架构 · 编译器",
    evidenceCount: 18,
    sourceCount: 10,
    matchScore: 88,
  },
];

type TalentResult = {
  id: number;
  name: string;
  title: string;
  evidenceCount: number;
  sourceCount: number;
  matchScore: number;
};

export function TalentPrompt() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<TalentResult[]>(fallbackResults);
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem("feiyun_next_shortlist_v1") ?? "[]") as number[];
      return Array.isArray(stored) ? stored.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  });
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const compared = useMemo(
    () => compareIds.map((id) => results.find((result) => result.id === id)).filter(Boolean) as TalentResult[],
    [compareIds, results],
  );

  function toggleSaved(id: number) {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("feiyun_next_shortlist_v1", JSON.stringify(next));
      return next;
    });
  }

  function toggleCompare(id: number) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length >= 2 ? [current[1], id] : [...current, id];
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    try {
      const response = await fetch(`/api/talent?q=${encodeURIComponent(query)}`);
      const data = (await response.json()) as { profiles?: TalentResult[] };
      if (response.ok && data.profiles?.length) {
        setResults(data.profiles.slice(0, 3));
      } else {
        setResults(fallbackResults);
      }
    } catch {
      setResults(fallbackResults);
    } finally {
      await new Promise((resolve) => window.setTimeout(resolve, 520));
      setIsSearching(false);
      setShowResults(true);
    }
  }

  return (
    <div className="prompt-wrap">
      <form className="talent-prompt" onSubmit={submit}>
        <label htmlFor="talent-query">你正在寻找怎样的人？</label>
        <div className="prompt-input-row">
          <textarea
            id="talent-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：做过千卡训练，持续维护开源项目，最近关注推理效率的人"
            rows={2}
          />
          <button type="submit" aria-label="开始搜索" disabled={isSearching}>
            {isSearching ? "···" : "↑"}
          </button>
        </div>
        <div className="prompt-tools">
          <span className="tool-dot" />
          <span>全网证据搜索</span>
          <span>·</span>
          <span>中文 / English</span>
        </div>
      </form>

      <div className="prompt-suggestions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => setQuery(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      {(isSearching || showResults) && (
        <div className={`prompt-results ${isSearching ? "is-searching" : ""}`}>
          {isSearching ? (
            <div className="searching-state">
              <span className="search-orbit" />
              正在读取并验证人才信号
            </div>
          ) : (
            <>
              <div className="results-head">
                <span>为你找到的高相关人才</span>
                <span>{savedIds.length} 位已收藏 · 选择 2 位进行对比</span>
              </div>
              {results.map((result) => (
                <article key={result.id} className="mini-result">
                  <div className="mini-avatar">{result.name.slice(0, 1)}</div>
                  <div>
                    <strong>{result.name}</strong>
                    <span>{result.title}</span>
                  </div>
                  <small>
                    {result.evidenceCount} 项证据 · {result.sourceCount} 个来源
                  </small>
                  <b>{result.matchScore}%</b>
                  <div className="mini-result-actions">
                    <button
                      aria-pressed={savedIds.includes(result.id)}
                      onClick={() => toggleSaved(result.id)}
                      type="button"
                    >
                      {savedIds.includes(result.id) ? "已收藏" : "收藏"}
                    </button>
                    <button
                      aria-pressed={compareIds.includes(result.id)}
                      onClick={() => toggleCompare(result.id)}
                      type="button"
                    >
                      {compareIds.includes(result.id) ? "已选" : "对比"}
                    </button>
                  </div>
                </article>
              ))}
              {compared.length === 2 && (
                <div className="talent-compare-panel">
                  <div>
                    <span>{compared[0].name}</span>
                    <strong>{compared[0].matchScore}%</strong>
                    <small>{compared[0].evidenceCount} 项证据</small>
                  </div>
                  <i>VS</i>
                  <div>
                    <span>{compared[1].name}</span>
                    <strong>{compared[1].matchScore}%</strong>
                    <small>{compared[1].evidenceCount} 项证据</small>
                  </div>
                  <p>
                    当前建议优先深入验证 <b>{compared[0].matchScore >= compared[1].matchScore ? compared[0].name : compared[1].name}</b>，同时保留另一位作为互补样本。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
