import Link from "next/link";
import { getChatGPTUser } from "./chatgpt-auth";
import { ProductHeader } from "./components/product-header";
import { IosIcon } from "./components/ios-icon";
import { TalentPrompt } from "./components/talent-prompt";
import { previewCandidates, stageLabels } from "./lib/recruiting-data";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  return (
    <main className="ios-app ios-home">
      <ProductHeader user={user} active="product" />
      <section className="ios-hero">
        <div className="ios-eyebrow">
          <span className="ios-live-dot" /> 让招聘，回归人与人的连接{" "}
          <IosIcon name="chevron" size={14} />
        </div>
        <h1>
          好人才，
          <br />
          值得一次<span>好相遇。</span>
        </h1>
        <p>
          从发现人才到面试邀约，把繁琐留给飞云。
          <br />
          让你专注每一次有价值的对话。
        </p>
        <div className="ios-hero-actions">
          <Link className="ios-button" href="/recruiter">
            开启招聘工作台 <IosIcon name="arrow" size={18} />
          </Link>
          <Link className="ios-text-link" href="/jobs">
            寻找我的下一站 <IosIcon name="chevron" size={16} />
          </Link>
        </div>
        <div className="ios-hero-notes">
          <span>
            <IosIcon name="check" size={14} /> 清晰的人才流程
          </span>
          <span>
            <IosIcon name="check" size={14} /> 自动发送面试邀请
          </span>
          <span>
            <IosIcon name="check" size={14} /> 候选人在线确认
          </span>
        </div>
      </section>
      <section
        className="ios-product-preview"
        aria-label="招聘工作台界面预览，内容为示例"
      >
        <div className="ios-preview-toolbar">
          <span className="ios-window-dots">
            <i />
            <i />
            <i />
          </span>
          <span>
            <IosIcon name="shield" size={13} /> 飞云 · 招聘工作台
          </span>
          <span className="ios-badge">界面预览</span>
        </div>
        <div className="ios-preview-layout">
          <aside className="ios-preview-nav">
            <span className="ios-workspace-label">我的工作空间</span>
            <b>
              <IosIcon name="grid" size={17} /> 工作概览
            </b>
            <span>
              <IosIcon name="people" size={17} /> 候选人
            </span>
            <span>
              <IosIcon name="calendar" size={17} /> 面试日程
            </span>
            <span>
              <IosIcon name="briefcase" size={17} /> 职位管理
            </span>
            <div className="ios-preview-user">
              <span className="ios-avatar">飞</span>
              <div>
                <b>飞云招聘团队</b>
                <small>让每一次相遇更进一步</small>
              </div>
            </div>
          </aside>
          <div className="ios-preview-main">
            <div className="ios-section-heading">
              <div>
                <span className="ios-overline">YOUR HIRING, SIMPLIFIED</span>
                <h2>把好的人，放在心上。</h2>
                <p>候选人的每一步进展，都清晰可见。</p>
              </div>
              <Link href="/recruiter" className="ios-button small">
                <IosIcon name="plus" size={16} /> 安排面试
              </Link>
            </div>
            <div className="ios-preview-stats">
              {[
                ["6", "活跃候选人", "people"],
                ["2", "面试进行中", "calendar"],
                ["1", "Offer 沟通中", "briefcase"],
              ].map(([n, label, icon]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>
                    {n}
                    <i>
                      <IosIcon name={icon as "people"} />
                    </i>
                  </strong>
                  <small>示例招聘流程</small>
                </div>
              ))}
            </div>
            <div className="ios-preview-table">
              <div className="ios-section-heading">
                <h3>值得关注的候选人</h3>
                <Link href="/recruiter">
                  查看全部 <IosIcon name="chevron" size={14} />
                </Link>
              </div>
              {previewCandidates.slice(0, 3).map((row, i) => (
                <div className="ios-preview-row" key={row.id}>
                  <span className={"ios-avatar tone-" + i}>
                    {row.candidateName.slice(0, 1)}
                  </span>
                  <div>
                    <b>{row.candidateName}</b>
                    <small>{row.currentCompany}</small>
                  </div>
                  <span>{row.jobTitle}</span>
                  <span className={"ios-status " + row.status}>
                    {stageLabels[row.status]}
                  </span>
                  <IosIcon name="chevron" size={15} />
                </div>
              ))}
            </div>
          </div>
          <aside className="ios-preview-side">
            <span className="ios-overline">NEXT CONVERSATION</span>
            <div className="ios-calendar-tile">
              <span>面试邀约</span>
              <IosIcon name="calendar" size={34} />
            </div>
            <h3>
              下一场对话，
              <br />
              井井有条。
            </h3>
            <p>选择时间，飞云自动发送邀请。候选人确认后，进展即时同步。</p>
            <div className="ios-preview-confirm">
              <span className="ios-icon-tile green">
                <IosIcon name="check" size={18} />
              </span>
              <div>
                <b>邀请与确认，一步到位</b>
                <small>支持添加到系统日历</small>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section className="ios-benefits" id="thinking">
        <div className="ios-section-intro">
          <span className="ios-overline">LESS BUSYWORK. MORE CONNECTION.</span>
          <h2>
            招聘的每一步，
            <br />
            都可以更从容。
          </h2>
          <p>一个工作台，连接人才、日程与下一步行动。</p>
        </div>
        <div className="ios-feature-grid">
          {[
            [
              "people",
              "发现对的人",
              "从真实经历与公开作品理解人才，收藏、对比，让每一个选择更有依据。",
            ],
            [
              "mail",
              "让邀请自动抵达",
              "选好候选人和时间，自动生成专属邀请。发送状态可查，失败可重试。",
            ],
            [
              "calendar",
              "把下一步安排好",
              "候选人在线回复、添加日历。少一些来回沟通，多一些确定的进展。",
            ],
          ].map(([icon, title, desc], i) => (
            <article key={title}>
              <span
                className={"ios-icon-tile " + ["blue", "purple", "green"][i]}
              >
                <IosIcon name={icon as "people"} size={24} />
              </span>
              <span className="ios-feature-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="ios-search-section" id="search">
        <div className="ios-section-intro">
          <span className="ios-overline">FIND YOUR NEXT GREAT PERSON</span>
          <h2>说说你想找的人。</h2>
          <p>从一句需求开始，发现值得进一步了解的人才。</p>
        </div>
        <TalentPrompt />
      </section>
      <section className="ios-bottom-cta">
        <span className="ios-brand-mark">
          <IosIcon name="sparkle" size={28} />
        </span>
        <h2>
          下一次好相遇，
          <br />
          从这里开始。
        </h2>
        <Link href="/recruiter" className="ios-button">
          进入招聘工作台 <IosIcon name="arrow" size={18} />
        </Link>
      </section>
      <footer className="ios-footer">
        <b>飞云 FEIYUN</b>
        <span>让真实的能力，遇见合适的机会。</span>
        <Link href="/jobs">发现机会</Link>
        <Link href="/candidate">候选人中心</Link>
      </footer>
    </main>
  );
}
