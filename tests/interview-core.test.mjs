import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import ts from "typescript";
// Transpile only the pure module; no database, email, or network is used.
const source = readFileSync(
  new URL("../app/lib/interview-core.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const {
  validateInterview,
  invitationToken,
  verifyInvitationToken,
  invitationExpired,
  formatInterviewTime,
  createCalendar,
  escapeHtml,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const now = Date.parse("2026-10-23T01:00:00Z");
const valid = () => ({
  applicationId: 1,
  title: "初次交流",
  startsAt: "2026-10-24T10:00:00+08:00",
  durationMinutes: 45,
  location: "https://meet.example.com/interview",
  message: "期待相见",
  requestId: randomUUID(),
});
test("valid interview uses an explicit timezone and normalizes to UTC", () => {
  assert.equal(
    validateInterview(valid(), now).startsAt,
    "2026-10-24T02:00:00.000Z",
  );
});
for (const [name, payload] of [
  ["past time", { startsAt: "2026-10-22T10:00:00+08:00" }],
  ["missing timezone", { startsAt: "2026-10-24T10:00" }],
  ["invalid date", { startsAt: "tomorrow" }],
  ["unsupported duration", { durationMinutes: 31 }],
  ["invalid candidate", { applicationId: -1 }],
  ["empty title", { title: " " }],
  ["empty location", { location: "" }],
  ["script URL", { location: "javascript:alert(1)" }],
  ["insecure URL", { location: "http://meeting.example.com" }],
  ["credential URL", { location: "https://user:password@meeting.example.com" }],
  ["invalid request key", { requestId: "duplicate" }],
])
  test(`rejects ${name}`, () =>
    assert.throws(() => validateInterview({ ...valid(), ...payload }, now)));
test("offline addresses and bounded user messages are supported", () => {
  const row = validateInterview(
    {
      ...valid(),
      location: "上海市徐汇区 · 会议室 A",
      message: "a".repeat(3000),
    },
    now,
  );
  assert.equal(row.message.length, 2000);
});
test("signed invitation cannot be used for another invitation or a different secret", () => {
  const id = randomUUID();
  const secret = "a".repeat(32);
  const token = invitationToken(id, secret);
  assert.ok(verifyInvitationToken(id, token, secret));
  assert.equal(verifyInvitationToken(randomUUID(), token, secret), false);
  assert.equal(verifyInvitationToken(id, token, "b".repeat(32)), false);
  assert.equal(verifyInvitationToken(id, token.slice(1), secret), false);
  assert.equal(verifyInvitationToken(id, token, "short"), false);
  assert.throws(() => invitationToken(id, "short"));
});
test("expiry starts exactly at the interview start", () => {
  assert.equal(invitationExpired(new Date(now).toISOString(), now), true);
  assert.equal(invitationExpired(new Date(now + 1).toISOString(), now), false);
});
test("Beijing time presentation does not depend on server timezone", () => {
  assert.match(formatInterviewTime("2026-10-24T02:00:00Z"), /10:00/);
});
test("HTML user content is escaped", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="x">&'),
    "&lt;img src=x onerror=&quot;x&quot;&gt;&amp;",
  );
});
test("calendar has stable UID, UTC duration, correct escaping, and UTF-8 line folding", () => {
  const row = {
    id: randomUUID(),
    createdAt: "2026-10-23T01:00:00Z",
    startsAt: "2026-10-24T02:00:00Z",
    durationMinutes: 45,
    title: "面试,讨论;主题",
    location: "上海会议室",
    jobTitle: "AI Infra",
    message: "中文".repeat(100) + "\nEND:VEVENT",
  };
  const calendar = createCalendar(row);
  assert.match(calendar, /DTSTART:20261024T020000Z/);
  assert.match(calendar, /DTEND:20261024T024500Z/);
  assert.ok(calendar.includes("SUMMARY:面试\\,讨论\\;主题"));
  assert.ok(calendar.includes("\\nEND:VEVENT"));
  assert.equal(
    calendar.split("\r\n").filter((l) => l === "END:VEVENT").length,
    1,
  );
  assert.ok(calendar.split("\r\n").every((l) => Buffer.byteLength(l) <= 75));
  assert.match(calendar, new RegExp(row.id + "@feiyun"));
  assert.ok(calendar.endsWith("\r\n"));
});
