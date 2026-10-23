import { createHmac, timingSafeEqual } from "node:crypto";

export type InterviewInput = {
  applicationId: number;
  title: string;
  startsAt: string;
  durationMinutes: number;
  location: string;
  message: string;
  requestId: string;
};
export type InterviewRecord = {
  id: string;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  location: string;
  message: string;
  response: string;
  deliveryStatus: string;
  deliveryError: string;
  createdAt: string;
};
export function validateInterview(
  value: unknown,
  now = Date.now(),
): InterviewInput {
  if (!value || typeof value !== "object") throw new Error("请填写面试信息");
  const p = value as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof p[key] === "string" ? (p[key] as string).trim().slice(0, max) : "";
  const applicationId = Number(p.applicationId);
  const durationMinutes = Number(p.durationMinutes);
  const startsAt = text("startsAt", 50);
  if (!Number.isSafeInteger(applicationId) || applicationId < 1)
    throw new Error("请选择有效候选人");
  if (!text("title", 150)) throw new Error("请填写面试主题");
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(
      startsAt,
    ) ||
    !Number.isFinite(Date.parse(startsAt)) ||
    Date.parse(startsAt) < now + 60_000
  )
    throw new Error("请选择至少一分钟后的面试时间");
  if (Date.parse(startsAt) > now + 366 * 86_400_000)
    throw new Error("面试时间须在一年以内");
  if (![15, 30, 45, 60, 90, 120].includes(durationMinutes))
    throw new Error("请选择有效面试时长");
  const location = text("location", 500);
  if (!location) throw new Error("请填写会议链接或面试地址");
  if (/^[a-z][a-z\d+.-]*:/i.test(location) && !/^https:\/\//i.test(location))
    throw new Error("线上会议链接请使用 HTTPS");
  if (/^https:\/\//i.test(location)) {
    try {
      const url = new URL(location);
      if (!url.hostname || url.username || url.password) throw new Error();
    } catch {
      throw new Error("会议链接格式不正确");
    }
  }
  const requestId = text("requestId", 80);
  if (!/^[a-f\d-]{36}$/i.test(requestId))
    throw new Error("请求标识无效，请重新打开邀请窗口");
  return {
    applicationId,
    title: text("title", 150),
    startsAt: new Date(startsAt).toISOString(),
    durationMinutes,
    location,
    message: text("message", 2000),
    requestId,
  };
}
export function invitationToken(id: string, secret: string) {
  if (secret.length < 32) throw new Error("AUTH_SECRET 需至少 32 个字符");
  return createHmac("sha256", secret)
    .update(`feiyun-interview:${id}`)
    .digest("base64url");
}
export function verifyInvitationToken(
  id: string,
  token: string,
  secret: string,
) {
  if (!/^[a-f\d-]{36}$/i.test(id) || secret.length < 32 || token.length !== 43)
    return false;
  const expected = Buffer.from(invitationToken(id, secret));
  const received = Buffer.from(token);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
export function invitationExpired(startsAt: string, now = Date.now()) {
  return Date.parse(startsAt) <= now;
}
export function formatInterviewTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function createCalendar(interview: InterviewRecord) {
  const stamp = (value: string) =>
    new Date(value)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FEIYUN//Interviews//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${interview.id}@feiyun`,
    `DTSTAMP:${stamp(interview.createdAt)}`,
    `DTSTART:${stamp(interview.startsAt)}`,
    `DTEND:${stamp(new Date(Date.parse(interview.startsAt) + interview.durationMinutes * 60_000).toISOString())}`,
    `SUMMARY:${escape(interview.title)}`,
    `LOCATION:${escape(interview.location)}`,
    `DESCRIPTION:${escape(`${interview.jobTitle}\n${interview.message}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // RFC 5545: fold lines at 75 octets, without splitting UTF-8 characters.
  return (
    lines
      .map((line) => {
        let result = "",
          current = "";
        for (const char of line) {
          if (Buffer.byteLength(current + char) > 75) {
            result += current + "\r\n";
            current = " ";
          }
          current += char;
        }
        return result + current;
      })
      .join("\r\n") + "\r\n"
  );
}
