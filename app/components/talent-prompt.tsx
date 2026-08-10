"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [searchNote, setSearchNote] = useState("等待研究任务");
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("feiyun_next_shortlist_v1") ?? "[]") as number[];
        if (Array.isArray(stored)) setSavedIds(stored.filter(Number.isInteger));
      } catch {
        localStorage.removeItem("feiyun_next_shortlist_v1");
      }
      try {
        const stored = JSON.parse(localStorage.getItem("feiyun_talent_history_v1") ?? "[]") as unknown;
        if (Array.isArray(stored)) {
          setHistory(stored.filter((value): value is string => typeof value === "string").slice(0, 5));
        }
      } catch {
        localStorage.removeItem("feiyun_talent_history_v1");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

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

  function rememberSearch(value: string) {
    setHistory((current) => {
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 5);
      localStorage.setItem("feiyun_talent_history_v1", JSON.stringify(next));
      return next;
    });
  }

  async function searchTalent(value: string) {
    const nextQuery = value.trim();
    if (!nextQuery) return;
    setQuery(nextQuery);
    rememberSearch(nextQuery);
    setIsSearching(true);
    setShowResults(false);
    setSearchNote("正在连接公开信号源");
    try {
      const response = await fetch(`/api/talent?q=${encodeURIComponent(nextQuery)}`);
      const data = (await response.json()) as { profiles?: TalentResult[] };
      if (response.ok && data.profiles?.length) {
        setResults(data.profiles.slice(0, 3));
        setSearchNote(`${data.profiles.length} 位候选人通过初步验证`);
      } else {
        setResults(fallbackResults);
        setSearchNote("已载入演示人才网络结果");
      }
    } catch {
      setResults(fallbackResults);
      setSearchNote("网络暂不可用，已载入本地验证样本");
    } finally {
      await new Promise((resolve) => window.setTimeout(resolve, 360));
      setIsSearching(false);
      setShowResults(true);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void searchTalent(query);
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("feiyun_talent_history_v1");
  }

  function exportShortlist() {
    const shortlist = results.filter((result) => savedIds.includes(result.id));
    if (!shortlist.length) return;
    const escape = (value: string | number) => {
      const raw = String(value);
      const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const csv = `\uFEFF${[
      ["姓名", "方向", "匹配度", "证据数", "来源数"],
      ...shortlist.map((result) => [
        result.name,
        result.title,
        `${result.matchScore}%`,
        result.evidenceCount,
        result.sourceCount,
      ]),
    ].map((row) => row.map(escape).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "feiyun-talent-shortlist.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setSearchNote(`已导出 ${shortlist.length} 位收藏人才`);
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

      {history.length > 0 && (
        <div className="prompt-history">
          <span>最近研究</span>
          <div>
            {history.map((item) => (
              <button key={item} type="button" onClick={() => void searchTalent(item)} disabled={isSearching}>
                {item}
              </button>
            ))}
          </div>
          <button type="button" onClick={clearHistory}>清除</button>
        </div>
      )}

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
                <div>
                  <span>为你找到的高相关人才</span>
                  <small>{searchNote}</small>
                </div>
                <div className="results-operations">
                  <span>{savedIds.length} 位已收藏 · 选择 2 位进行对比</span>
                  <button
                    type="button"
                    onClick={exportShortlist}
                    disabled={!results.some((result) => savedIds.includes(result.id))}
                  >
                    导出当前收藏 ↓
                  </button>
                  {compareIds.length > 0 && (
                    <button type="button" onClick={() => setCompareIds([])}>清除对比</button>
                  )}
                </div>
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
