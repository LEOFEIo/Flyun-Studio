"use client";
import { useState } from "react";
import { IosIcon } from "./ios-icon";
export function InvitationResponse({
  id,
  token,
  initialResponse,
  expired,
}: {
  id: string;
  token: string;
  initialResponse: string;
  expired: boolean;
}) {
  const [response, setResponse] = useState(initialResponse);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function reply(value: string) {
    setBusy(value);
    setError("");
    try {
      const result = await fetch(`/api/invitations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response: value }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error);
      setResponse(data.response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "暂时无法保存回复，请重试");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="ios-rsvp">
      {expired ? (
        <p className="ios-info-banner">
          本次面试已开始。如需重新安排，请联系向你发送邀请的招聘顾问。
        </p>
      ) : response === "pending" ? (
        <>
          <button
            className="ios-button"
            disabled={!!busy}
            onClick={() => reply("accepted")}
          >
            <IosIcon name="check" size={18} />
            {busy === "accepted" ? "正在确认…" : "接受面试邀请"}
          </button>
          <button
            className="ios-button secondary"
            disabled={!!busy}
            onClick={() => reply("declined")}
          >
            {busy === "declined" ? "正在保存…" : "婉拒本次邀请"}
          </button>
          <p>点击按钮才会提交回复。仅打开链接不会自动确认。</p>
        </>
      ) : (
        <div className="ios-rsvp-result" role="status">
          <span
            className={
              "ios-icon-tile " + (response === "accepted" ? "green" : "blue")
            }
          >
            <IosIcon name="check" size={26} />
          </span>
          <h2>
            {response === "accepted" ? "期待与你相见。" : "谢谢你的回复。"}
          </h2>
          <p>
            {response === "accepted"
              ? "你已接受邀请，招聘顾问可以看到你的确认。"
              : "你已婉拒本次邀请，回复已同步给招聘顾问。"}
          </p>
          {response === "accepted" && (
            <a
              className="ios-button secondary"
              href={`/api/invitations/${id}/calendar?token=${encodeURIComponent(token)}`}
            >
              <IosIcon name="calendar" size={18} />
              添加到日历
            </a>
          )}
        </div>
      )}
      {error && (
        <p className="ios-form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
