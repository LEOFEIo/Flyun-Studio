"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type MissionState = "queued" | "running" | "verified";
type MissionFilter = "all" | MissionState;

type Mission = {
  id: string;
  target: string;
  domain: string;
  state: MissionState;
  signals: number;
  owner: string;
};

const storageKey = "feiyun_research_missions_v1";

const initialMissions: Mission[] = [
  {
    id: "M-01",
    target: "千卡训练与推理优化负责人",
    domain: "AI Infra",
    state: "running",
    signals: 12,
    owner: "证据研究组",
  },
  {
    id: "M-02",
    target: "有真机量产经验的具身算法专家",
    domain: "机器人与具身智能",
    state: "queued",
    signals: 0,
    owner: "人才图谱组",
  },
  {
    id: "M-03",
    target: "世界模型与端到端驾驶负责人",
    domain: "自动驾驶",
    state: "verified",
    signals: 18,
    owner: "顾问复核组",
  },
];

const stateLabel: Record<MissionState, string> = {
  queued: "排队中",
  running: "运行中",
  verified: "已验证",
};

const stateProgress: Record<MissionState, number> = {
  queued: 12,
  running: 64,
  verified: 100,
};

const filters: Array<{ value: MissionFilter; label: string }> = [
  { value: "all", label: "全部任务" },
  { value: "running", label: "运行中" },
  { value: "queued", label: "排队中" },
  { value: "verified", label: "已验证" },
];

function isMission(value: unknown): value is Mission {
  if (!value || typeof value !== "object") return false;
  const mission = value as Partial<Mission>;
  return (
    typeof mission.id === "string" &&
    typeof mission.target === "string" &&
    typeof mission.domain === "string" &&
    (mission.state === "queued" ||
      mission.state === "running" ||
      mission.state === "verified") &&
    typeof mission.signals === "number" &&
    typeof mission.owner === "string"
  );
}

function csvCell(value: string | number) {
  const raw = String(value);
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function MissionControl() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [filter, setFilter] = useState<MissionFilter>("all");
  const [target, setTarget] = useState("");
  const [domain, setDomain] = useState("AI Infra");
  const [lastEvent, setLastEvent] = useState("任务网络已同步");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw === null) return;
        const stored = JSON.parse(raw) as unknown;
        if (Array.isArray(stored)) {
          const valid = stored.filter(isMission).slice(0, 24);
          setMissions(valid);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const counts = useMemo(
    () => ({
      all: missions.length,
      running: missions.filter((mission) => mission.state === "running").length,
      queued: missions.filter((mission) => mission.state === "queued").length,
      verified: missions.filter((mission) => mission.state === "verified").length,
    }),
    [missions],
  );

  const visibleMissions = useMemo(
    () =>
      filter === "all"
        ? missions
        : missions.filter((mission) => mission.state === filter),
    [filter, missions],
  );

  const completion = missions.length
    ? Math.round((counts.verified / missions.length) * 100)
    : 0;

  function commit(next: Mission[], message: string) {
    setMissions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setLastEvent(message);
  }

  function addMission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTarget = target.trim();
    if (!nextTarget) return;
    const sequence = Math.max(0, ...missions.map((mission) => Number(mission.id.replace(/\D/g, "")) || 0)) + 1;
    const mission: Mission = {
      id: `M-${String(sequence).padStart(2, "0")}`,
      target: nextTarget.slice(0, 80),
      domain,
      state: "queued",
      signals: 0,
      owner: "待分配",
    };
    commit([...missions, mission], `${mission.id} 已加入研究队列`);
    setTarget("");
    setFilter("all");
  }

  function advanceMission(id: string) {
    let message = "任务状态已更新";
    const next = missions.map((mission) => {
      if (mission.id !== id) return mission;
      const state: MissionState =
        mission.state === "queued"
          ? "running"
          : mission.state === "running"
            ? "verified"
            : "running";
      message = `${mission.id} 已切换为${stateLabel[state]}`;
      return {
        ...mission,
        state,
        signals:
          state === "verified"
            ? Math.max(mission.signals, 8)
            : state === "running"
              ? Math.max(mission.signals, 1)
              : mission.signals,
        owner: mission.owner === "待分配" ? "证据研究组" : mission.owner,
      };
    });
    commit(next, message);
  }

  function archiveMission(id: string) {
    const mission = missions.find((item) => item.id === id);
    if (!mission) return;
    commit(
      missions.filter((item) => item.id !== id),
      `${mission.id} 已从当前队列归档`,
    );
  }

  function exportMissions() {
    const rows = [
      ["任务编号", "研究目标", "方向", "状态", "信号数", "负责人"],
      ...missions.map((mission) => [
        mission.id,
        mission.target,
        mission.domain,
        stateLabel[mission.state],
        mission.signals,
        mission.owner,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "feiyun-mission-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setLastEvent("任务报告已导出");
  }

  return (
    <div className="mission-control">
      <header className="mission-command-deck">
        <div>
          <span className="mission-eyebrow">MISSION CONTROL / LIVE</span>
          <h3>研究任务控制台</h3>
          <p>把人才需求编排为可推进、可复核、可导出的研究任务。</p>
        </div>
        <div className="mission-telemetry" aria-label="任务完成率">
          <span>任务完成率</span>
          <strong>{completion}%</strong>
          <div className="mission-progress" aria-hidden="true">
            <i style={{ width: `${completion}%` }} />
          </div>
        </div>
        <div className="mission-counters">
          <span><b>{counts.running}</b> 运行</span>
          <span><b>{counts.queued}</b> 排队</span>
          <span><b>{counts.verified}</b> 验证</span>
        </div>
      </header>

      <form className="mission-launch-form" onSubmit={addMission}>
        <label htmlFor="mission-target">新研究目标</label>
        <div>
          <input
            id="mission-target"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="例如：做过推理平台从 0 到 1 的技术负责人"
            maxLength={80}
          />
          <select
            aria-label="研究方向"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            <option>AI Infra</option>
            <option>大模型与多模态</option>
            <option>机器人与具身智能</option>
            <option>自动驾驶</option>
            <option>芯片与体系结构</option>
            <option>AI 产品与设计</option>
          </select>
          <button type="submit" disabled={!target.trim()}>加入队列</button>
        </div>
      </form>

      <div className="mission-toolbar">
        <div className="mission-filters" aria-label="任务状态筛选">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label} <b>{counts[item.value]}</b>
            </button>
          ))}
        </div>
        <button
          className="mission-export"
          type="button"
          onClick={exportMissions}
          disabled={!missions.length}
        >
          导出任务报告 ↓
        </button>
      </div>

      <div className="mission-feed" aria-live="polite">
        <div className="mission-feed-head" aria-hidden="true">
          <span>任务</span>
          <span>目标 / 方向</span>
          <span>遥测</span>
          <span>操作</span>
        </div>
        {visibleMissions.map((mission) => (
          <article className="mission-row" data-state={mission.state} key={mission.id}>
            <span className="mission-id">{mission.id}</span>
            <div className="mission-target">
              <strong>{mission.target}</strong>
              <span>{mission.domain} · {mission.owner}</span>
            </div>
            <div className="mission-signal">
              <span className="mission-state">
                <i aria-hidden="true" /> {stateLabel[mission.state]}
              </span>
              <small>{mission.signals} 个有效信号</small>
              <div aria-hidden="true"><i style={{ width: `${stateProgress[mission.state]}%` }} /></div>
            </div>
            <div className="mission-actions">
              <button type="button" onClick={() => advanceMission(mission.id)}>
                {mission.state === "queued"
                  ? "启动"
                  : mission.state === "running"
                    ? "完成验证"
                    : "重新开启"}
              </button>
              <button type="button" onClick={() => archiveMission(mission.id)}>归档</button>
            </div>
          </article>
        ))}
        {!visibleMissions.length && (
          <div className="mission-empty">
            <strong>当前筛选下没有任务</strong>
            <span>切换状态或加入一个新的研究目标。</span>
          </div>
        )}
      </div>

      <footer className="mission-event-log" aria-live="polite">
        <span className="live-dot" />
        <b>最新事件</b>
        <span>{lastEvent}</span>
        <time suppressHydrationWarning>
          {new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}
        </time>
      </footer>
    </div>
  );
}
