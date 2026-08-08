"use client";

import { FormEvent, useState } from "react";

type ProfileSeed = {
  fullName: string;
  phone: string;
  currentCompany: string;
  currentSalary: string;
  expectedSalary: string;
  jobLevel: string;
  promotionStatus: string;
  performancePay: string;
} | null;

export function ApplyForm({
  job,
  initialProfile,
}: {
  job: { id: number; title: string; location: string };
  initialProfile: ProfileSeed;
}) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const saveLocal = () => {
      const key = "feiyun_local_applications_v1";
      try {
        const current = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
        localStorage.setItem(key, JSON.stringify([
          { ...payload, jobId: job.id, jobTitle: job.title, createdAt: new Date().toISOString(), status: "new" },
          ...(Array.isArray(current) ? current : []),
        ]));
      } catch {
        localStorage.setItem(key, JSON.stringify([{ ...payload, jobId: job.id, jobTitle: job.title, status: "new" }]));
      }
      setDemoMode(true);
      setSubmitted(true);
    };

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, jobId: job.id }),
      });
      const data = (await response.json()) as { error?: string; demo?: boolean };
      if (response.ok) {
        setSubmitted(true);
      } else if (response.status === 503 && data.demo) {
        saveLocal();
      } else {
        setMessage(data.error ?? "提交失败，请稍后再试");
      }
    } catch {
      saveLocal();
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="success-panel">
        <span>✓</span>
        <h2>意向已提交</h2>
        <p>
          {demoMode
            ? `你对「${job.title}」的意向已保存在当前浏览器，可继续体验候选人流程。`
            : `顾问已收到你对「${job.title}」的申请。后续状态会同步到个人工作台。`}
        </p>
        <a className="primary-button" href="/workspace">
          查看工作台 ↗
        </a>
      </div>
    );
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <div className="selected-job">
        <span>申请岗位</span>
        <strong>{job.title}</strong>
        <small>{job.location}</small>
      </div>
      <div className="form-grid">
        <label>
          <span>姓名 *</span>
          <input
            name="candidateName"
            required
            defaultValue={initialProfile?.fullName}
            placeholder="你的姓名"
          />
        </label>
        <label>
          <span>联系电话</span>
          <input
            name="phone"
            defaultValue={initialProfile?.phone}
            placeholder="手机号或微信"
          />
        </label>
        <label>
          <span>当前公司</span>
          <input
            name="currentCompany"
            defaultValue={initialProfile?.currentCompany}
            placeholder="公司 / 团队"
          />
        </label>
        <label>
          <span>当前职级 *</span>
          <input
            name="jobLevel"
            required
            defaultValue={initialProfile?.jobLevel}
            placeholder="例如：P7 / 17 级 / Staff"
          />
        </label>
        <label>
          <span>当前薪资 *</span>
          <input
            name="currentSalary"
            required
            defaultValue={initialProfile?.currentSalary}
            placeholder="例如：60W + 股票"
          />
        </label>
        <label>
          <span>期望薪资 *</span>
          <input
            name="expectedSalary"
            required
            defaultValue={initialProfile?.expectedSalary}
            placeholder="例如：80W 以上"
          />
        </label>
        <label className="full-field">
          <span>晋升情况 *</span>
          <input
            name="promotionStatus"
            required
            defaultValue={initialProfile?.promotionStatus}
            placeholder="例如：近两年晋升一次，下一晋升窗口在年底"
          />
        </label>
        <label className="full-field">
          <span>绩效与奖金 *</span>
          <input
            name="performancePay"
            required
            defaultValue={initialProfile?.performancePay}
            placeholder="例如：近两年绩效 A / B+，年终奖 4 个月"
          />
        </label>
        <label className="full-field">
          <span>为什么对这个机会感兴趣</span>
          <textarea
            name="motivation"
            rows={5}
            placeholder="可以写你想解决的问题、职业方向或对下一份工作的期待"
          />
        </label>
      </div>
      <div className="form-submit-row">
        <p>提交即表示你同意顾问为本次机会查看以上信息。</p>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "正在提交…" : "确认提交 ↗"}
        </button>
      </div>
      {message && <div className="form-error">{message}</div>}
    </form>
  );
}
