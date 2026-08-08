import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "./chatgpt-auth";
import { ProductHeader } from "./components/product-header";
import { HiringPlanner } from "./components/hiring-planner";
import { TalentPrompt } from "./components/talent-prompt";
import { PageMotion } from "./components/page-motion";

export const dynamic = "force-dynamic";

const taskRows = [
  {
    number: "01",
    title: "读取公开工作",
    meta: "12 个来源",
    state: "已完成",
    stateClass: "complete",
    details: [
      ["GitHub 贡献记录", "1,284 commits"],
      ["论文与技术分享", "17 项"],
    ],
  },
  {
    number: "02",
    title: "验证能力轨迹",
    meta: "正在分析",
    state: "运行中",
    stateClass: "running",
    details: [
      ["训练恢复主题一致性", "92%"],
      ["推理优化项目关联", "8 项证据"],
    ],
  },
  {
    number: "03",
    title: "生成人才判断",
    meta: "等待上游任务",
    state: "排队中",
    stateClass: "queued",
    details: [
      ["岗位适配度", "待计算"],
      ["顾问推荐理由", "待生成"],
    ],
  },
];

const domains = [
  ["大模型与多模态", "18 个开放机会", "Foundation models"],
  ["AI Infra", "12 个开放机会", "Training & inference"],
  ["机器人与具身智能", "9 个开放机会", "Embodied intelligence"],
  ["自动驾驶", "7 个开放机会", "Autonomous systems"],
  ["芯片与体系结构", "6 个开放机会", "Compute architecture"],
  ["AI 产品与设计", "5 个开放机会", "AI-native products"],
];

const metrics = [
  ["500+", "公开信号源"],
  ["94%", "判断可追溯"],
  ["6", "重点技术领域"],
  ["7×24", "持续更新"],
];

export default async function Home() {
  const user = await getChatGPTUser();
  const workspaceHref = user
    ? "/workspace"
    : chatGPTSignInPath("/workspace");

  return (
    <main className="product-page landing-page">
      <PageMotion />
      <div className="meta-promo">
        <span>Recruiting intelligence, in action · 飞云人才智能</span>
        <Link href="/jobs">查看精选机会 →</Link>
      </div>
      <ProductHeader user={user} active="product" />

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="section-kicker">AI 人才智能 · TALENT INTELLIGENCE</p>
          <h1>
            从理解，到连接，
            <span>到结果。</span>
          </h1>
          <p>
            像研究一个市场一样研究人才。飞云主动理解需求、搜索公开工作、
            验证能力证据，并推动每一次关键招聘抵达结果。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#search">
              开始搜索人才
            </a>
            <Link className="secondary-button" href="/jobs">
              浏览开放机会
            </Link>
          </div>
        </div>

        <div className="meta-hero-visual" aria-label="飞云人才智能产品展示">
          <div className="talent-orbit" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="orbit-avatar orbit-a">林</span>
            <span className="orbit-avatar orbit-b">周</span>
            <span className="orbit-avatar orbit-c">许</span>
          </div>
          <article className="featured-talent-card">
            <header>
              <span>高相关人才</span>
              <b>94% 匹配</b>
            </header>
            <div className="featured-profile">
              <span className="featured-avatar">陈</span>
              <div>
                <h2>陈墨</h2>
                <p>AI Infra · 分布式系统</p>
              </div>
            </div>
            <div className="featured-skills">
              <span>千卡训练</span>
              <span>推理优化</span>
              <span>KV Cache</span>
            </div>
            <footer>
              <span>16 项能力证据</span>
              <span>刚刚更新</span>
            </footer>
          </article>
          <div className="signal-ribbon">
            <span>
              <i className="live-dot" />
              人才网络在线
            </span>
            <b>500+ sources connected</b>
          </div>
        </div>
      </section>

      <div className="tezign-ticker" aria-label="飞云人才智能能力">
        <div>
          <span>Natural-language search ✦</span>
          <span>Evidence verification ✦</span>
          <span>Talent graph ✦</span>
          <span>Personal outreach ✦</span>
          <span>Natural-language search ✦</span>
          <span>Evidence verification ✦</span>
          <span>Talent graph ✦</span>
          <span>Personal outreach ✦</span>
        </div>
      </div>

      <section className="showcase-section" id="search">
        <header className="meta-section-intro">
          <span className="section-kicker">自然语言人才搜索</span>
          <h2>说出你的需求，<br />飞云去理解人才。</h2>
          <p>
            不再堆砌关键词。系统把一句真实需求拆解成能力、经历、潜力与近期信号。
          </p>
        </header>
        <div className="showcase-frame">
          <div className="showcase-chrome">
            <div className="showcase-title">
              <span className="brand-pulse" />
              <b>飞云 Search</b>
              <small>人才研究工作台</small>
            </div>
            <div className="showcase-status">
              <span>Index synced</span>
              <span>500+ sources</span>
            </div>
          </div>
          <div className="showcase-grid">
            <aside className="showcase-sidebar">
              <span>Workspace</span>
              <b className="active">人才搜索</b>
              <b>证据推理</b>
              <b>人才档案</b>
              <b>开放机会</b>
              <small>Research graph · Online</small>
            </aside>
            <div className="showcase-main">
              <div className="showcase-copy">
                <span className="section-kicker">现在开始</span>
                <h2>描述你真正需要的人。</h2>
                <p>输入一句话，搜索跨越公开作品与长期轨迹。</p>
              </div>
              <TalentPrompt />
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip" aria-label="产品指标">
        {metrics.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="apple-planner-section" id="planner">
        <header className="apple-tile-heading">
          <p className="section-kicker">Recruiting plan</p>
          <h2>把招聘目标，变成一套可执行的计划。</h2>
          <p>选择方向、人才难度、目标人数和招聘周期，实时生成建议漏斗与每周研究节奏。</p>
        </header>
        <HiringPlanner />
      </section>

      <section className="landing-section" id="thinking">
        <header className="landing-heading">
          <div>
            <p className="section-kicker">01 / Evidence reasoning</p>
            <h2>每一个判断，都能回到证据。</h2>
          </div>
          <p>
            展开工作轨迹、交叉验证能力，再识别近期变化。系统不会把推断包装成事实。
          </p>
        </header>

        <div className="evidence-layout">
          <article className="ui-card reasoning-card">
            <div className="panel-label">
              <span className="sparkle">✦</span>
              <div>
                <b>AI Infra 负责人画像</b>
                <small>16 项证据 · 思考 4.8 秒</small>
              </div>
              <span className="status-chip status-interview">分析中</span>
            </div>
            <div className="reasoning-body">
              <article>
                <span>01</span>
                <div>
                  <b>读取工作轨迹</b>
                  <p>连续 38 个月保持开源贡献，主题集中于训练恢复与调度。</p>
                </div>
                <em>完成</em>
              </article>
              <article>
                <span>02</span>
                <div>
                  <b>交叉验证能力</b>
                  <p>代码、演讲与项目经历共同指向千卡训练及推理效率。</p>
                </div>
                <em>完成</em>
              </article>
              <article>
                <span>03</span>
                <div>
                  <b>识别近期变化</b>
                  <p>最近的公开信号转向异构推理调度与 KV Cache。</p>
                </div>
                <em className="is-running">运行中</em>
              </article>
            </div>
          </article>

          <div className="evidence-side">
            <article className="ui-card evidence-stat">
              <span>证据一致性</span>
              <strong>92%</strong>
              <div className="completion-track">
                <i style={{ width: "92%" }} />
              </div>
              <small>代码、论文与公开演讲相互印证</small>
            </article>
            <article className="ui-card evidence-stat">
              <span>近期信号</span>
              <strong>KV Cache</strong>
              <div className="signal-bars" aria-hidden="true">
                {[28, 40, 35, 52, 64, 58, 74, 86, 96].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <small>过去 90 天工作主题变化显著</small>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section" id="tasks">
        <header className="landing-heading">
          <div>
            <p className="section-kicker">02 / Observable workflow</p>
            <h2>让人才研究成为可跟踪的任务流。</h2>
          </div>
          <p>每一步都有状态、输入和输出，方便顾问与业务团队共同复核。</p>
        </header>

        <div className="ui-card task-card">
          <div className="task-table-head">
            <span>步骤</span>
            <span>研究任务</span>
            <span>状态</span>
          </div>
          {taskRows.map((task) => (
            <details className="task-row" key={task.number}>
              <summary>
                <span className="task-number">{task.number}</span>
                <span className="task-title">
                  <b>{task.title}</b>
                  <small>{task.meta}</small>
                </span>
                <span className={`task-state ${task.stateClass}`}>
                  {task.state}
                </span>
                <i>⌄</i>
              </summary>
              <div className="task-details">
                {task.details.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-section" id="profiles">
        <header className="landing-heading">
          <div>
            <p className="section-kicker">03 / Living profile</p>
            <h2>人才档案，不止是一份静态简历。</h2>
          </div>
          <p>能力证据、近期信号和机会判断持续更新，同时让候选人掌控职业信息。</p>
        </header>

        <div className="profile-console">
          <article className="ui-card profile-primary">
            <div className="profile-console-top">
              <span className="candidate-avatar">陈</span>
              <span className="confidence-ring">94</span>
            </div>
            <div>
              <span className="verified-pill">✓ VERIFIED PROFILE</span>
              <h3>陈墨</h3>
              <p>AI Infra · Distributed Systems</p>
            </div>
            <div className="profile-sources">
              <span>16 项证据</span>
              <span>9 个来源</span>
              <span>7 天前更新</span>
            </div>
          </article>
          <div className="profile-side">
            <article className="ui-card insight-card">
              <span>近期信号</span>
              <h3>异构推理调度</h3>
              <p>公开工作由训练恢复逐步转向高并发推理效率。</p>
              <div className="insight-tags">
                <span>vLLM</span>
                <span>KV Cache</span>
                <span>Scheduling</span>
              </div>
            </article>
            <article className="ui-card recommendation-card">
              <span>智能推荐</span>
              <p>
                与 <code>AI Infra 平台负责人</code> 的核心要求高度一致。
              </p>
              <div>
                <Link href="/jobs">查看机会</Link>
                <a href={workspaceHref}>保存人才</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section" id="domains">
        <header className="landing-heading">
          <div>
            <p className="section-kicker">04 / Focus domains</p>
            <h2>聚焦最稀缺、最难判断的技术人才。</h2>
          </div>
          <Link className="text-link" href="/jobs">
            查看全部机会 ↗
          </Link>
        </header>

        <div className="ui-card domain-table">
          <div className="domain-head">
            <span>方向</span>
            <span>当前机会</span>
            <span>研究主题</span>
            <span />
          </div>
          {domains.map(([name, count, label]) => (
            <Link href="/jobs" key={name}>
              <strong>{name}</strong>
              <span>{count}</span>
              <code>{label}</code>
              <i>↗</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-section final-section" id="about">
        <div className="ui-card final-card">
          <div>
            <span className="section-kicker">FOR TALENT / FOR TEAMS</span>
            <h2>让真正做过的事，被真正需要它的人看见。</h2>
          </div>
          <div>
            <p>候选人掌控自己的职业档案，团队获得有依据的人才判断。</p>
            <div className="closing-actions">
              <Link className="primary-button" href="/jobs">
                浏览开放机会
              </Link>
              <a className="secondary-button" href={workspaceHref}>
                创建飞云档案
              </a>
            </div>
          </div>
        </div>
        <footer className="canvas-footer">
          <span>© 2026 FEIYUN</span>
          <span>AI TALENT INTELLIGENCE</span>
        </footer>
      </section>
    </main>
  );
}
