"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IosIcon } from "./ios-icon";
import type { InterviewRecord } from "../lib/interview-core";
import { formatInterviewTime } from "../lib/interview-display";
import { stageLabels, type CandidateRow } from "../lib/recruiting-data";

type Invite = InterviewRecord & { invitationUrl?: string };
type Config = {
  database: boolean;
  signing: boolean;
  email: boolean;
  site: boolean;
};
type Props = {
  rows: CandidateRow[];
  initialInterviews: Invite[];
  demo: boolean;
  config: Config;
  displayName: string;
  initialNow: number;
  loadError?: string;
};
const responseLabels: Record<string, string> = {
  pending: "等待确认",
  accepted: "已接受",
  declined: "已婉拒",
};
const deliveryLabels: Record<string, string> = {
  pending: "待发送",
  sending: "发送中",
  sent: "已提交邮件服务",
  failed: "邮件未发送",
};

export function RecruitingWorkspace({
  rows,
  initialInterviews,
  demo,
  config,
  displayName,
  initialNow,
  loadError,
}: Props) {
  const router = useRouter();
  const [now, setNow] = useState(initialNow);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"overview" | "candidates" | "schedule">(
    "overview",
  );
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [invites, setInvites] = useState(initialInterviews);
  const [selected, setSelected] = useState<CandidateRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [retrying, setRetrying] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const ready =
    !demo && config.database && config.signing && config.site && !loadError;
  const active = rows.filter((r) => !["closed", "hired"].includes(r.status));
  const filtered = rows.filter(
    (r) =>
      (stage === "all" || r.status === stage) &&
      `${r.candidateName} ${r.currentCompany} ${r.jobTitle} ${r.userEmail}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const upcoming = invites.filter(
    (i) => i.response !== "declined" && Date.parse(i.startsAt) > now,
  );
  const interviewCount = rows.filter((r) => r.status === "interview").length;
  function openInvite(row?: CandidateRow) {
    setIsOpen(true);
    setSelected(row ?? active[0] ?? null);
    setRequestId(crypto.randomUUID());
    setError("");
    dialog.current?.showModal();
  }
  async function refresh() {
    if (demo) {
      setNotice("当前是界面演示。连接数据库后可读取真实招聘进展。");
      return;
    }
    setBusy(true);
    setNow(Date.now());
    setError("");
    try {
      const response = await fetch("/api/admin/interviews", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInvites(data.interviews);
      router.refresh();
      setNotice("已更新面试与候选人进展");
    } catch (e) {
      setError(e instanceof Error ? e.message : "刷新失败");
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: Number(form.get("applicationId")),
          title: form.get("title"),
          startsAt: `${form.get("startsAt")}:00+08:00`,
          durationMinutes: Number(form.get("durationMinutes")),
          location: form.get("location"),
          message: form.get("message"),
          requestId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "创建失败");
      setInvites((current) =>
        [
          ...current.filter((i) => i.id !== data.interview.id),
          data.interview,
        ].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
      );
      setNotice(
        data.interview.deliveryStatus === "sent"
          ? "面试邀请已创建，邮件已提交发送。候选人回复后会同步到这里。"
          : "邀请已保存，邮件尚未发送。你可以复制邀请链接，或检查配置后重试。",
      );
      dialog.current?.close();
      setView("schedule");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "邀请暂未创建，请重试");
    } finally {
      setBusy(false);
    }
  }
  async function retry(id: string) {
    setRetrying(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/interviews/${id}/retry`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInvites((current) =>
        current.map((i) => (i.id === id ? data.interview : i)),
      );
      setNotice(
        data.interview.deliveryStatus === "sent"
          ? "邮件已提交发送"
          : data.interview.deliveryError || "邮件仍未发送，请检查配置",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "重试失败");
    } finally {
      setRetrying("");
    }
  }
  async function copy(url?: string) {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("邀请链接已复制。请仅分享给对应候选人。");
    } catch {
      setError("无法访问剪贴板，请在 HTTPS 环境使用复制功能");
    }
  }
  const nextDay =
    new Date(now + 86_400_000 + 8 * 3_600_000).toISOString().slice(0, 10) +
    "T10:00";
  function renderInvitation(invite: Invite) {
    return (
      <article className="ios-interview-card" key={invite.id}>
        <div className="ios-interview-date">
          <IosIcon name="calendar" size={23} />
          <span>
            {new Intl.DateTimeFormat("zh-CN", {
              timeZone: "Asia/Shanghai",
              month: "numeric",
              day: "numeric",
            }).format(new Date(invite.startsAt))}
          </span>
        </div>
        <div className="ios-interview-content">
          <div className="ios-inline">
            <h3>{invite.title}</h3>
            <span className={"ios-status " + invite.response}>
              {responseLabels[invite.response]}
            </span>
          </div>
          <p>
            {invite.candidateName} · {invite.jobTitle}
          </p>
          <div className="ios-interview-meta">
            <span>
              <IosIcon name="clock" size={15} />
              {formatInterviewTime(invite.startsAt)} · {invite.durationMinutes}{" "}
              分钟
            </span>
            <span>
              <IosIcon name="pin" size={15} />
              {invite.location}
            </span>
          </div>
          <small
            className={
              invite.deliveryStatus === "failed"
                ? "ios-error-text"
                : "ios-muted"
            }
          >
            {deliveryLabels[invite.deliveryStatus]}
            {invite.deliveryError ? ` · ${invite.deliveryError}` : ""}
          </small>
        </div>
        <div className="ios-interview-actions">
          <button
            className="ios-button secondary small"
            onClick={() => copy(invite.invitationUrl)}
          >
            <IosIcon name="link" size={16} />
            复制邀请
          </button>
          {["failed", "pending", "sending"].includes(invite.deliveryStatus) && (
            <button
              className="ios-text-link"
              disabled={retrying === invite.id}
              onClick={() => retry(invite.id)}
            >
              {retrying === invite.id ? "正在重试…" : "重试发送"}
            </button>
          )}
        </div>
      </article>
    );
  }
  return (
    <div className="ios-workspace-shell">
      <aside className="ios-sidebar">
        <div className="ios-workspace-label">
          工作空间 <span>WORKSPACE</span>
        </div>
        <nav aria-label="工作台导航">
          {(
            [
              ["overview", "grid", "工作概览"],
              ["candidates", "people", "候选人"],
              ["schedule", "calendar", "面试日程"],
            ] as const
          ).map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-current={view === key ? "page" : undefined}
            >
              <IosIcon name={icon} />
              {label}
              {key === "candidates" && <span>{rows.length}</span>}
              {key === "schedule" && upcoming.length > 0 && (
                <span>{upcoming.length}</span>
              )}
            </button>
          ))}
          <Link href="/jobs">
            <IosIcon name="briefcase" />
            开放职位
          </Link>
          <Link href="/#search">
            <IosIcon name="search" />
            发现人才
          </Link>
        </nav>
        <div className="ios-sidebar-bottom">
          <span className="ios-icon-tile blue">
            <IosIcon name="sparkle" />
          </span>
          <h3>好招聘，少些忙碌。</h3>
          <p>
            选好时间，邀请自动发送。
            <br />
            下一步，让飞云帮你记住。
          </p>
          <Link href="/admin">
            申请管理 <IosIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="ios-sidebar-user">
          <span className="ios-avatar">{displayName.slice(0, 1)}</span>
          <div>
            <b>{displayName}</b>
            <small>{demo ? "预览工作空间" : "招聘管理员"}</small>
          </div>
          <IosIcon name="shield" size={16} />
        </div>
      </aside>
      <div className="ios-workspace-main">
        <div className="ios-workspace-topline">
          <span>
            我的工作空间 <IosIcon name="chevron" size={12} />{" "}
            {view === "overview"
              ? "工作概览"
              : view === "candidates"
                ? "候选人"
                : "面试日程"}
          </span>
          <button
            className="ios-icon-button"
            onClick={refresh}
            disabled={busy}
            aria-label="刷新招聘数据"
          >
            <IosIcon name="refresh" size={18} />
          </button>
        </div>
        <div className="ios-dashboard-heading">
          <div>
            <span className="ios-overline">
              A LITTLE LESS BUSY. A LOT MORE HUMAN.
            </span>
            <h1>
              {view === "overview"
                ? "每一份期待，都有进展。"
                : view === "candidates"
                  ? "把合适的人，放在眼前。"
                  : "为下一次对话，留好时间。"}
            </h1>
            <p>
              {demo
                ? "欢迎来到飞云，这里是你的招聘工作空间。"
                : `${displayName}，你好。今天也让每一次连接更进一步。`}
            </p>
          </div>
          <button
            className="ios-button"
            onClick={() => openInvite()}
            disabled={!active.length}
          >
            <IosIcon name="plus" size={18} />
            {demo ? "预览面试邀约" : "安排面试"}
          </button>
        </div>
        {demo && (
          <div className="ios-info-banner">
            <IosIcon name="shield" size={19} />
            <span>
              <b>你正在浏览演示工作空间</b> ·
              下方为示例候选人，连接数据库并登录管理员后即可创建真实邀请。
            </span>
            <Link href="/signin?return_to=%2Frecruiter">
              管理员登录 <IosIcon name="chevron" size={14} />
            </Link>
          </div>
        )}
        {!demo && !ready && (
          <div className="ios-info-banner warning">
            <IosIcon name="shield" />
            <span>
              {loadError ||
                "面试功能待配置：请连接数据库、设置至少 32 字符的 AUTH_SECRET 和 NEXT_PUBLIC_SITE_URL。"}
            </span>
          </div>
        )}
        {!demo && ready && !config.email && (
          <div className="ios-info-banner warning">
            <IosIcon name="mail" />
            <span>
              邮件服务未连接：可创建并复制专属邀请链接。配置 RESEND_API_KEY
              与发件邮箱后即可自动发送。
            </span>
          </div>
        )}
        {notice && (
          <div className="ios-notice" role="status">
            <IosIcon name="check" size={18} />
            {notice}
            <button
              onClick={() => setNotice("")}
              className="ios-icon-button"
              aria-label="关闭通知"
            >
              <IosIcon name="close" size={16} />
            </button>
          </div>
        )}
        {error && !isOpen && (
          <p role="alert" className="ios-form-error">
            {error}
          </p>
        )}
        {view === "overview" && (
          <section className="ios-metric-grid" aria-label="招聘数据">
            {[
              [
                "活跃候选人",
                active.length,
                "正在推进的招聘流程",
                "people",
                "blue",
              ],
              [
                "面试阶段",
                interviewCount,
                "已进入面试的候选人",
                "calendar",
                "purple",
              ],
              [
                "待确认邀请",
                invites.filter(
                  (i) =>
                    i.response === "pending" && Date.parse(i.startsAt) > now,
                ).length,
                "等待候选人回复",
                "mail",
                "orange",
              ],
              [
                "Offer 沟通",
                rows.filter((r) => r.status === "offer").length,
                "距离好相遇更近一步",
                "briefcase",
                "green",
              ],
            ].map(([label, num, note, icon, color]) => (
              <article key={label}>
                <div>
                  <span>{label}</span>
                  <span className={"ios-icon-tile " + color}>
                    <IosIcon name={icon as "people"} size={19} />
                  </span>
                </div>
                <strong>{num}</strong>
                <small>{note}</small>
              </article>
            ))}
          </section>
        )}
        {view === "schedule" ? (
          <section className="ios-panel">
            <div className="ios-section-heading">
              <div>
                <h2>面试与邀约</h2>
                <p>全部时间以北京时间显示 · 邮件状态表示服务已接受请求</p>
              </div>
              <span className="ios-badge">{invites.length} 场安排</span>
            </div>
            <div className="ios-interview-list">
              {invites.length ? (
                invites.map(renderInvitation)
              ) : (
                <div className="ios-empty">
                  <span className="ios-icon-tile blue">
                    <IosIcon name="calendar" size={28} />
                  </span>
                  <h3>为一场好对话，留出时间。</h3>
                  <p>
                    {demo
                      ? "演示空间尚未创建面试。可以预览邀请表单，了解完整流程。"
                      : "安排第一场面试，飞云会自动生成候选人专属邀请。"}
                  </p>
                  <button
                    className="ios-button secondary"
                    onClick={() => openInvite()}
                    disabled={!active.length}
                  >
                    {demo ? "预览邀请表单" : "安排第一场面试"}
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className={view === "overview" ? "ios-dashboard-columns" : ""}>
            <section className="ios-panel ios-candidate-panel">
              <div className="ios-section-heading">
                <div>
                  <h2>
                    候选人 <span className="ios-count">{rows.length}</span>
                  </h2>
                  <p>发现、了解、连接，一切有序发生。</p>
                </div>
                <label className="ios-search-field">
                  <IosIcon name="search" size={17} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索姓名、职位或公司"
                    aria-label="搜索候选人"
                  />
                </label>
              </div>
              <div className="ios-segments" aria-label="候选人阶段筛选">
                {[
                  ["all", "全部"],
                  ["new", "新申请"],
                  ["screening", "评估中"],
                  ["interview", "面试中"],
                  ["offer", "Offer"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    aria-pressed={stage === value}
                    onClick={() => setStage(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="ios-candidate-table">
                <div className="ios-table-header">
                  <span>候选人</span>
                  <span>目标职位</span>
                  <span>流程状态</span>
                  <span>下一步</span>
                </div>
                {filtered.map((row, i) => (
                  <article className="ios-candidate-row" key={row.id}>
                    <div className="ios-person">
                      <span className={"ios-avatar tone-" + (i % 5)}>
                        {row.candidateName.slice(0, 1)}
                      </span>
                      <div>
                        <b>{row.candidateName}</b>
                        <small>
                          {row.currentCompany || "公司待补充"} · {row.jobLevel}
                        </small>
                      </div>
                    </div>
                    <div className="ios-row-job">
                      <b>{row.jobTitle}</b>
                      <small>{row.jobLocation}</small>
                    </div>
                    <span className={"ios-status " + row.status}>
                      {stageLabels[row.status] || row.status}
                    </span>
                    <button
                      className="ios-invite-button"
                      onClick={() => openInvite(row)}
                      disabled={["hired", "closed"].includes(row.status)}
                      aria-label={`邀约${row.candidateName}`}
                    >
                      <IosIcon name="calendar" size={16} />
                      邀约
                    </button>
                  </article>
                ))}
                {!filtered.length && (
                  <div className="ios-empty">
                    <IosIcon name="search" size={30} />
                    <h3>
                      {rows.length
                        ? "没有找到匹配的候选人"
                        : "下一位好人才，正在路上。"}
                    </h3>
                    <p>
                      {rows.length
                        ? "试试其他关键词或流程阶段。"
                        : "候选人提交职位申请后，会出现在这里。"}
                    </p>
                    {rows.length > 0 && (
                      <button
                        className="ios-text-link"
                        onClick={() => {
                          setStage("all");
                          setQuery("");
                        }}
                      >
                        清除筛选
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="ios-panel-footer">
                <span>
                  共 {filtered.length} 位候选人{demo ? " · 示例数据" : ""}
                </span>
                <Link href="/admin">
                  管理申请与备注 <IosIcon name="chevron" size={14} />
                </Link>
              </div>
            </section>
            {view === "overview" && (
              <aside className="ios-dashboard-aside">
                <section className="ios-panel">
                  <div className="ios-section-heading">
                    <h2>即将到来</h2>
                    <span className="ios-icon-tile blue">
                      <IosIcon name="calendar" size={18} />
                    </span>
                  </div>
                  {upcoming.slice(0, 3).map((invite) => (
                    <div className="ios-upcoming" key={invite.id}>
                      <span className="ios-live-dot" />
                      <div>
                        <b>{invite.candidateName}</b>
                        <p>{invite.title}</p>
                        <small>{formatInterviewTime(invite.startsAt)}</small>
                        <span className={"ios-status " + invite.response}>
                          {responseLabels[invite.response]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!upcoming.length && (
                    <div className="ios-aside-empty">
                      <IosIcon name="clock" size={32} />
                      <h3>给下一次相遇，留点时间。</h3>
                      <p>安排面试后，你的近期日程会展示在这里。</p>
                    </div>
                  )}
                  <button
                    className="ios-wide-link"
                    onClick={() => setView("schedule")}
                  >
                    查看面试日程 <IosIcon name="arrow" size={16} />
                  </button>
                </section>
                <section className="ios-tip-card">
                  <span className="ios-icon-tile purple">
                    <IosIcon name="sparkle" size={22} />
                  </span>
                  <h3>连接，从一封好邀请开始。</h3>
                  <p>
                    清晰的主题、明确的时间、一句真诚的留言，让候选人感受到你的期待。
                  </p>
                  <button
                    className="ios-text-link"
                    onClick={() => openInvite()}
                    disabled={!active.length}
                  >
                    试试面试邀约 <IosIcon name="arrow" size={16} />
                  </button>
                </section>
              </aside>
            )}
          </div>
        )}
        <p className="ios-workspace-footnote">
          <IosIcon name="shield" size={13} />{" "}
          {demo
            ? "示例数据仅用于展示，不会发送邮件。"
            : "候选人信息仅对招聘管理员可见。请妥善保管专属邀请链接。"}
        </p>
      </div>
      <dialog
        onClose={() => setIsOpen(false)}
        ref={dialog}
        className="ios-invite-dialog"
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <form onSubmit={submit}>
          <header>
            <div>
              <span className="ios-icon-tile blue">
                <IosIcon name="calendar" size={22} />
              </span>
              <h2>安排一次好对话。</h2>
              <p>填好安排，飞云为你生成专属面试邀请。</p>
            </div>
            <button
              type="button"
              className="ios-icon-button"
              disabled={busy}
              aria-label="关闭邀约窗口"
              onClick={() => {
                dialog.current?.close();
                setError("");
              }}
            >
              <IosIcon name="close" />
            </button>
          </header>
          <div className="ios-form-body">
            {demo && (
              <p className="ios-info-banner">
                表单预览 · 示例邮箱不会收到邮件。
              </p>
            )}
            <label>
              邀请谁来聊聊
              <select
                name="applicationId"
                required
                value={selected?.id ?? ""}
                onChange={(e) =>
                  setSelected(
                    rows.find((r) => r.id === Number(e.target.value)) ?? null,
                  )
                }
              >
                {active.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.candidateName} · {row.jobTitle}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <p className="ios-field-hint">
                <IosIcon name="mail" size={14} />
                {selected.userEmail}
              </p>
            )}
            <label>
              面试主题
              <input
                key={selected?.id}
                name="title"
                required
                maxLength={150}
                defaultValue={selected ? `${selected.jobTitle} · 初次交流` : ""}
              />
            </label>
            <div className="ios-form-columns">
              <label>
                开始时间 · 北京时间
                <input
                  name="startsAt"
                  type="datetime-local"
                  required
                  defaultValue={nextDay}
                />
              </label>
              <label>
                预计时长
                <select name="durationMinutes" defaultValue="45">
                  {[15, 30, 45, 60, 90, 120].map((n) => (
                    <option key={n} value={n}>
                      {n} 分钟
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              会议链接或面试地址
              <input
                name="location"
                required
                maxLength={500}
                placeholder="https://… 或详细线下面试地址"
              />
            </label>
            <label>
              想对候选人说的话 <span className="ios-muted">选填</span>
              <textarea
                name="message"
                rows={3}
                maxLength={2000}
                defaultValue="你好，很高兴有机会与你交流。期待了解你的经历，也向你介绍我们的团队与机会。"
              />
            </label>
            {error && (
              <p className="ios-form-error" role="alert">
                {error}
              </p>
            )}
            {!demo && !ready && (
              <p className="ios-form-error">
                请完成面试功能配置后创建真实邀请。
              </p>
            )}
            <div className="ios-invite-explainer">
              <IosIcon name="shield" size={17} />
              <span>
                邀请会保存到工作台，并自动发送到候选人邮箱。对方可以在线接受或婉拒，确认后支持添加到日历。
              </span>
            </div>
          </div>
          <footer>
            <button
              className="ios-button secondary"
              type="button"
              disabled={busy}
              onClick={() => dialog.current?.close()}
            >
              取消
            </button>
            <button
              className="ios-button"
              type="submit"
              disabled={!ready || busy}
            >
              {busy
                ? "正在创建并发送…"
                : demo
                  ? "演示模式 · 不发送"
                  : "创建并发送邀请"}
              <IosIcon name="arrow" size={17} />
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
