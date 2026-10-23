import type { Metadata } from "next";
import Link from "next/link";
import { findInvitation } from "../../lib/interviews";
import {
  formatInterviewTime,
  invitationExpired,
} from "../../lib/interview-core";
import { InvitationResponse } from "../../components/invitation-response";
import { IosIcon } from "../../components/ios-icon";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "面试邀请",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  let invitation = null;
  let unavailable = false;
  try {
    invitation = await findInvitation(
      id,
      typeof token === "string" ? token : "",
    );
  } catch {
    unavailable = true;
  }
  if (!invitation)
    return (
      <main className="ios-app ios-invitation-page">
        <section className="ios-invitation-paper">
          <span className="ios-icon-tile blue">
            <IosIcon name="mail" size={30} />
          </span>
          <h1>{unavailable ? "邀请暂时无法打开" : "这份邀请没有找到"}</h1>
          <p>
            {unavailable
              ? "请稍后刷新重试，你的回复不会因此改变。"
              : "链接可能不完整或已失效，请联系招聘顾问获取新的邀请。"}
          </p>
          <Link className="ios-button secondary" href="/">
            返回飞云
          </Link>
        </section>
      </main>
    );
  return (
    <main className="ios-app ios-invitation-page">
      <Link className="ios-invitation-brand" href="/">
        飞云 <span>FEIYUN</span>
      </Link>
      <section className="ios-invitation-paper">
        <span className="ios-icon-tile blue">
          <IosIcon name="mail" size={28} />
        </span>
        <span className="ios-overline">A CONVERSATION WORTH HAVING</span>
        <h1>
          {invitation.candidateName}，<br />
          期待与你聊一聊。
        </h1>
        <p>我们为你准备了一次关于「{invitation.jobTitle}」的交流。</p>
        <div className="ios-invitation-details">
          <h2>{invitation.title}</h2>
          <p>
            <IosIcon name="calendar" />
            {formatInterviewTime(invitation.startsAt)}
            <small>北京时间 UTC+8</small>
          </p>
          <p>
            <IosIcon name="clock" />
            {invitation.durationMinutes} 分钟
          </p>
          <p>
            <IosIcon name="pin" />
            {invitation.location.startsWith("https://") ? (
              <a
                href={invitation.location}
                target="_blank"
                rel="noopener noreferrer"
              >
                进入面试会议 <IosIcon name="arrow" size={15} />
              </a>
            ) : (
              invitation.location
            )}
          </p>
        </div>
        {invitation.message && <blockquote>{invitation.message}</blockquote>}
        <InvitationResponse
          id={id}
          token={token}
          initialResponse={invitation.response}
          expired={invitationExpired(invitation.startsAt)}
        />
      </section>
      <p className="ios-invitation-bottom">
        <IosIcon name="shield" size={14} />
        此链接专属于你，请妥善保管。
      </p>
    </main>
  );
}
