"use client";

import { useMemo, useState } from "react";

type Application = {
  id: number;
  candidateName: string;
  userEmail: string;
  phone: string;
  currentCompany: string;
  currentSalary: string;
  expectedSalary: string;
  jobLevel: string;
  promotionStatus: string;
  performancePay: string;
  motivation: string;
  status: string;
  consultantNotes: string;
  createdAt: string;
  updatedAt: string;
  jobTitle: string;
  jobLocation: string;
  jobDomain: string;
};

const statusOptions = [
  ["new", "新申请"],
  ["contacted", "已联系"],
  ["screening", "顾问沟通"],
  ["interview", "面试中"],
  ["offer", "Offer"],
  ["hired", "已入职"],
  ["closed", "已结束"],
];

export function AdminConsole({
  initialApplications,
}: {
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Application | null>(
    initialApplications[0] ?? null,
  );
  const [notes, setNotes] = useState(selected?.consultantNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () =>
      applications.filter((application) => {
        const haystack = [
          application.candidateName,
          application.userEmail,
          application.currentCompany,
          application.jobTitle,
          application.jobDomain,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
          (status === "all" || application.status === status)
        );
      }),
    [applications, query, status],
  );

  function choose(application: Application) {
    setSelected(application);
    setNotes(application.consultantNotes);
    setMessage("");
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/applications/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected.status, consultantNotes: notes }),
    });
    const result = (await response.json()) as {
      application?: Partial<Application>;
      error?: string;
    };
    setSaving(false);
    if (!response.ok || !result.application) {
      setMessage(result.error ?? "保存失败");
      return;
    }
    setApplications((current) =>
      current.map((application) =>
        application.id === selected.id
          ? { ...application, ...result.application, consultantNotes: notes }
          : application,
      ),
    );
    setSelected((current) =>
      current ? { ...current, ...result.application, consultantNotes: notes } : current,
    );
    setMessage("已保存");
  }

  return (
    <section className="admin-console">
      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索候选人、岗位、公司或邮箱"
          />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">全部状态</option>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <a className="secondary-button" href="/api/admin/export">
          导出 CSV ↓
        </a>
      </div>

      <div className="admin-layout">
        <div className="candidate-table">
          <div className="table-head">
            <span>候选人</span>
            <span>申请岗位</span>
            <span>薪资</span>
            <span>进度</span>
          </div>
          {filtered.length ? (
            filtered.map((application) => (
              <button
                className={`table-row ${selected?.id === application.id ? "active" : ""}`}
                key={application.id}
                onClick={() => choose(application)}
              >
                <span>
                  <b>{application.candidateName}</b>
                  <small>{application.currentCompany || application.userEmail}</small>
                </span>
                <span>
                  <b>{application.jobTitle}</b>
                  <small>{application.jobLocation}</small>
                </span>
                <span>
                  <b>{application.expectedSalary}</b>
                  <small>当前 {application.currentSalary}</small>
                </span>
                <span className={`status-chip status-${application.status}`}>
                  {statusOptions.find(([value]) => value === application.status)?.[1] ??
                    application.status}
                </span>
              </button>
            ))
          ) : (
            <div className="empty-table">没有符合当前筛选条件的申请</div>
          )}
        </div>

        <aside className="candidate-drawer">
          {selected ? (
            <>
              <div className="drawer-title">
                <div className="candidate-initial">{selected.candidateName.slice(0, 1)}</div>
                <div>
                  <h2>{selected.candidateName}</h2>
                  <p>{selected.currentCompany || "公司待补充"} · {selected.jobLevel}</p>
                </div>
              </div>
              <div className="drawer-contact">
                <a href={`mailto:${selected.userEmail}`}>{selected.userEmail}</a>
                <span>{selected.phone || "未填写电话"}</span>
              </div>
              <div className="candidate-facts">
                <div><span>申请岗位</span><strong>{selected.jobTitle}</strong></div>
                <div><span>当前薪资</span><strong>{selected.currentSalary}</strong></div>
                <div><span>期望薪资</span><strong>{selected.expectedSalary}</strong></div>
                <div><span>绩效奖金</span><strong>{selected.performancePay}</strong></div>
                <div className="wide"><span>晋升情况</span><strong>{selected.promotionStatus}</strong></div>
              </div>
              {selected.motivation && (
                <div className="candidate-motivation">
                  <span>求职动机</span>
                  <p>{selected.motivation}</p>
                </div>
              )}
              <label className="drawer-field">
                <span>流程状态</span>
                <select
                  value={selected.status}
                  onChange={(event) =>
                    setSelected({ ...selected, status: event.target.value })
                  }
                >
                  {statusOptions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="drawer-field">
                <span>顾问备注</span>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="记录沟通情况、下一步动作和风险点"
                />
              </label>
              <div className="drawer-actions">
                <span>{message}</span>
                <button className="primary-button" onClick={save} disabled={saving}>
                  {saving ? "保存中…" : "保存更新"}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">选择一位候选人查看详情</div>
          )}
        </aside>
      </div>
    </section>
  );
}
