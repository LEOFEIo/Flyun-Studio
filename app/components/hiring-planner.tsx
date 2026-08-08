"use client";

import { useMemo, useState } from "react";

const roleProfiles = {
  "AI Infra": { multiplier: 26, screenRate: 0.34, interviewRate: 0.16 },
  "多模态算法": { multiplier: 22, screenRate: 0.38, interviewRate: 0.18 },
  "具身智能": { multiplier: 28, screenRate: 0.32, interviewRate: 0.15 },
  "AI 产品": { multiplier: 16, screenRate: 0.42, interviewRate: 0.22 },
};

const difficultyFactors = {
  standard: { label: "标准人才", factor: 1 },
  senior: { label: "资深 / 专家", factor: 1.35 },
  leader: { label: "负责人 / 稀缺人才", factor: 1.7 },
};

export function HiringPlanner() {
  const [domain, setDomain] = useState<keyof typeof roleProfiles>("AI Infra");
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyFactors>("senior");
  const [headcount, setHeadcount] = useState(3);
  const [days, setDays] = useState(45);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(() => {
    const profile = roleProfiles[domain];
    const factor = difficultyFactors[difficulty].factor;
    const researched = Math.ceil(headcount * profile.multiplier * factor);
    const conversations = Math.ceil(researched * profile.screenRate);
    const interviews = Math.max(headcount * 3, Math.ceil(researched * profile.interviewRate));
    const offers = Math.max(headcount + 1, Math.ceil(headcount * 1.45));
    const weeks = Math.max(2, days / 7);
    return {
      researched,
      conversations,
      interviews,
      offers,
      weekly: Math.ceil(researched / weeks),
      confidence: Math.min(96, Math.round(68 + days * 0.22 - (factor - 1) * 18)),
    };
  }, [days, difficulty, domain, headcount]);

  const planText = [
    `飞云招聘计划 · ${domain}`,
    `目标：${headcount} 位 ${difficultyFactors[difficulty].label}`,
    `周期：${days} 天`,
    `研究人才：${plan.researched} 位`,
    `有效沟通：${plan.conversations} 位`,
    `建议面试：${plan.interviews} 位`,
    `建议 Offer：${plan.offers} 份`,
    `每周研究节奏：${plan.weekly} 位`,
  ].join("\n");

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(planText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadPlan() {
    const blob = new Blob(["\ufeff", planText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `飞云-${domain}-招聘计划.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="apple-planner">
      <div className="planner-controls">
        <div className="planner-control-head">
          <div>
            <span className="section-kicker">Interactive planning</span>
            <h3>先算清楚，再开始寻找。</h3>
          </div>
          <span className="planner-live"><i /> 实时计算</span>
        </div>

        <label>
          <span>招聘方向</span>
          <select value={domain} onChange={(event) => setDomain(event.target.value as keyof typeof roleProfiles)}>
            {Object.keys(roleProfiles).map((role) => <option key={role}>{role}</option>)}
          </select>
        </label>

        <label>
          <span>人才难度</span>
          <div className="planner-segmented">
            {Object.entries(difficultyFactors).map(([value, item]) => (
              <button
                className={difficulty === value ? "active" : ""}
                key={value}
                onClick={() => setDifficulty(value as keyof typeof difficultyFactors)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </label>

        <label className="planner-range">
          <span>目标 HC <strong>{headcount}</strong></span>
          <input type="range" min="1" max="12" value={headcount} onChange={(event) => setHeadcount(Number(event.target.value))} />
        </label>
        <label className="planner-range">
          <span>招聘周期 <strong>{days} 天</strong></span>
          <input type="range" min="14" max="90" step="1" value={days} onChange={(event) => setDays(Number(event.target.value))} />
        </label>
      </div>

      <div className="planner-output" aria-live="polite">
        <header>
          <span>RECOMMENDED FUNNEL</span>
          <strong>{plan.confidence}%</strong>
          <small>计划置信度</small>
        </header>
        <div className="planner-funnel">
          <article><i style={{ width: "100%" }} /><span>人才研究</span><strong>{plan.researched}</strong></article>
          <article><i style={{ width: "72%" }} /><span>有效沟通</span><strong>{plan.conversations}</strong></article>
          <article><i style={{ width: "48%" }} /><span>进入面试</span><strong>{plan.interviews}</strong></article>
          <article><i style={{ width: "28%" }} /><span>发出 Offer</span><strong>{plan.offers}</strong></article>
          <article><i style={{ width: "18%" }} /><span>目标入职</span><strong>{headcount}</strong></article>
        </div>
        <p>建议每周完成 <b>{plan.weekly}</b> 位人才研究，并在前 7 天完成首轮画像校准。</p>
        <div className="planner-actions">
          <button className="primary-button" type="button" onClick={copyPlan}>{copied ? "已复制" : "复制行动计划"}</button>
          <button className="secondary-button" type="button" onClick={downloadPlan}>下载 TXT</button>
        </div>
      </div>
    </div>
  );
}
