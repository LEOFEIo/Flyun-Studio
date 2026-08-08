"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Profile = {
  fullName: string;
  phone: string;
  location: string;
  currentCompany: string;
  currentRole: string;
  yearsExperience: number;
  currentSalary: string;
  expectedSalary: string;
  jobLevel: string;
  promotionStatus: string;
  performancePay: string;
  skills: string;
  bio: string;
  profileStatus: "draft" | "complete" | "published";
} | null;

export function ProfileForm({ initialProfile }: { initialProfile: Profile }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialProfile || !formRef.current) return;
    try {
      const stored = JSON.parse(localStorage.getItem("feiyun_local_profile_v1") ?? "null") as Record<string, string> | null;
      if (!stored) return;
      Object.entries(stored).forEach(([name, value]) => {
        const field = formRef.current?.elements.namedItem(name);
        if (field instanceof HTMLInputElement) {
          if (field.type === "checkbox") field.checked = value === "published";
          else field.value = value;
        }
        if (field instanceof HTMLTextAreaElement) field.value = value;
      });
    } catch {
      localStorage.removeItem("feiyun_local_profile_v1");
    }
  }, [initialProfile]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; demo?: boolean };
      if (response.ok) {
        setMessage("档案已安全保存");
      } else if (response.status === 503 && result.demo) {
        localStorage.setItem("feiyun_local_profile_v1", JSON.stringify(payload));
        setMessage("演示档案已保存到当前浏览器");
      } else {
        setMessage(result.error ?? "保存失败");
      }
    } catch {
      localStorage.setItem("feiyun_local_profile_v1", JSON.stringify(payload));
      setMessage("网络不可用，档案已保存到当前浏览器");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={submit} ref={formRef}>
      <div className="form-grid">
        <label>
          <span>姓名 *</span>
          <input name="fullName" required defaultValue={initialProfile?.fullName} />
        </label>
        <label>
          <span>联系电话</span>
          <input name="phone" defaultValue={initialProfile?.phone} />
        </label>
        <label>
          <span>所在城市</span>
          <input name="location" defaultValue={initialProfile?.location} />
        </label>
        <label>
          <span>当前公司</span>
          <input
            name="currentCompany"
            defaultValue={initialProfile?.currentCompany}
          />
        </label>
        <label>
          <span>当前岗位</span>
          <input name="currentRole" defaultValue={initialProfile?.currentRole} />
        </label>
        <label>
          <span>工作年限</span>
          <input
            name="yearsExperience"
            type="number"
            min="0"
            max="60"
            defaultValue={initialProfile?.yearsExperience ?? 0}
          />
        </label>
        <label>
          <span>当前薪资</span>
          <input
            name="currentSalary"
            defaultValue={initialProfile?.currentSalary}
          />
        </label>
        <label>
          <span>期望薪资</span>
          <input
            name="expectedSalary"
            defaultValue={initialProfile?.expectedSalary}
          />
        </label>
        <label>
          <span>当前职级</span>
          <input name="jobLevel" defaultValue={initialProfile?.jobLevel} />
        </label>
        <label>
          <span>绩效与奖金</span>
          <input
            name="performancePay"
            defaultValue={initialProfile?.performancePay}
          />
        </label>
        <label className="full-field">
          <span>晋升情况</span>
          <input
            name="promotionStatus"
            defaultValue={initialProfile?.promotionStatus}
          />
        </label>
        <label className="full-field">
          <span>核心技能</span>
          <input
            name="skills"
            defaultValue={initialProfile?.skills}
            placeholder="例如：VLA、强化学习、真机控制、PyTorch"
          />
        </label>
        <label className="full-field">
          <span>关于我</span>
          <textarea
            name="bio"
            rows={5}
            defaultValue={initialProfile?.bio}
            placeholder="用一段话说明你正在做什么、擅长什么，以及下一步想解决什么问题"
          />
        </label>
      </div>
      <div className="form-submit-row">
        <label className="publish-toggle">
          <input
            type="checkbox"
            name="profileStatus"
            value="published"
            defaultChecked={initialProfile?.profileStatus === "published"}
          />
          <span>公开展示这份档案，并允许飞云用于机会匹配</span>
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "保存中…" : "保存档案"}
        </button>
      </div>
      {message && <div className="form-message-inline">{message}</div>}
    </form>
  );
}
