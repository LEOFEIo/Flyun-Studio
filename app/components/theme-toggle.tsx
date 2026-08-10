"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "zh" | "en";

const translations: Record<string, string> = {
  "从理解，到连接，": "From understanding, to connection,",
  "到结果。": "to real outcomes.",
  "像研究一个市场一样研究人才。飞云主动理解需求、搜索公开工作、": "Research talent with the rigor of market intelligence. Feiyun understands the brief, studies public work,",
  "验证能力证据，并推动每一次关键招聘抵达结果。": "validates evidence, and moves every critical hire toward an outcome.",
  "说出你的需求，": "Describe the talent you need,",
  "飞云去理解人才。": "Feiyun builds the insight.",
  "不再堆砌关键词。系统把一句真实需求拆解成能力、经历、潜力与近期信号。": "Go beyond keyword matching. A real brief becomes skills, experience, potential, and recent signals.",
  "把招聘目标，变成一套可执行的计划。": "Turn hiring goals into an executable plan.",
  "选择方向、人才难度、目标人数和招聘周期，实时生成建议漏斗与每周研究节奏。": "Choose a domain, seniority, headcount, and timeline to generate a live funnel and weekly research cadence.",
  "每一个判断，都能回到证据。": "Every judgment traces back to evidence.",
  "展开工作轨迹、交叉验证能力，再识别近期变化。系统不会把推断包装成事实。": "Review work history, cross-check capabilities, and identify recent change without presenting inference as fact.",
  "让人才研究成为可跟踪的任务流。": "Make talent research a trackable workflow.",
  "每一步都有状态、输入和输出，方便顾问与业务团队共同复核。": "Every step has a status, input, and output for shared review by consultants and hiring teams.",
  "人才档案，不止是一份静态简历。": "A talent profile is more than a static résumé.",
  "能力证据、近期信号和机会判断持续更新，同时让候选人掌控职业信息。": "Evidence, recent signals, and opportunity insights stay current while candidates control their data.",
  "聚焦最稀缺、最难判断的技术人才。": "Focus on the rarest, hardest-to-evaluate technical talent.",
  "让真正做过的事，被真正需要它的人看见。": "Let meaningful work be seen by the people who need it.",
  "候选人掌控自己的职业档案，团队获得有依据的人才判断。": "Candidates control their profile; teams gain evidence-backed talent judgment.",
  "人才、机会与行动，": "Talent, opportunities, and action,",
  "保持在同一条线上。": "kept on one clear line.",
  "管理职业档案、跟踪申请进度，并从真实能力与长期方向出发发现新机会。": "Manage your profile, track applications, and discover opportunities through real capabilities and long-term direction.",
  "你的下一步，保持清晰。": "Keep your next move clear.",
  "让真正做过的事，持续被看见。": "Keep your real work visible.",
  "补充技能、项目与期望信息，让顾问更准确地理解你的下一步。": "Add skills, projects, and expectations so your consultant can understand your next move accurately.",
  "招聘方后台仅向管理员开放。": "The recruiter console is available to administrators only.",
  "请使用管理员用户名登录，候选人账号可继续访问候选人中心。": "Sign in with the administrator account. Candidate accounts can continue to the candidate center.",
  "今天值得优先推进。": "Today's priorities.",
  "告诉我们，你现在在哪里。": "Tell us where you are today.",
  "这不是一份重复填写的简历，": "This is not another résumé form,",
  "而是帮助顾问理解你的职业阶段与下一步选择。": "but a way for your consultant to understand your career stage and next move.",
  "进入你的": "Enter your",
  "人才工作台。": "talent workspace.",
  "候选人可查看申请进度；管理员使用用户名与密码进入招聘方后台。": "Candidates can track applications; administrators can access the recruiter console with a username and password.",
  "演示管理员：用户名 admin。生产部署请通过环境变量更换账号和密码。": "Demo administrator: admin. Replace the credentials with environment variables before production deployment.",
  "去做值得被": "Do work worth",
  "记住的工作。": "remembering.",
  "面向大模型、AI Infra、机器人、自动驾驶和芯片领域的稀缺人才。": "Selected roles for rare talent across foundation models, AI infrastructure, robotics, autonomous driving, and chips.",
  "公司信息将在匹配确认后由顾问提供。": "Company details are shared by the consultant after match confirmation.",
  "从真实工作、公开证据与长期轨迹中理解稀缺 AI 人才，让每一个判断都能回到来源。": "Understand rare AI talent through real work, public evidence, and long-term trajectories.",
  "飞云人才智能产品展示": "Feiyun talent intelligence product preview",
  "飞云人才智能能力": "Feiyun talent intelligence capabilities",
  "自然语言人才搜索": "Natural-language talent search",
  "人才研究工作台": "Talent research workspace",
  "描述你真正需要的人。": "Describe who you truly need.",
  "输入一句话，搜索跨越公开作品与长期轨迹。": "Search public work and long-term trajectories with one sentence.",
  "你正在寻找怎样的人？": "Who are you looking for?",
  "例如：做过千卡训练，持续维护开源项目，最近关注推理效率的人": "Example: someone with large-scale training experience, active open-source work, and a recent focus on inference efficiency",
  "正在读取并验证人才信号": "Reading and validating talent signals",
  "为你找到的高相关人才": "Highly relevant talent found for you",
  "当前建议优先深入验证 ": "We recommend validating ",
  "，同时保留另一位作为互补样本。": " first while keeping the other as a complementary benchmark.",
  "先算清楚，再开始寻找。": "Plan the funnel before the search.",
  "建议每周完成 ": "Complete ",
  " 位人才研究，并在前 7 天完成首轮画像校准。": " talent reviews each week and calibrate the profile in the first seven days.",
  "可能适合你的机会": "Opportunities for you",
  "顾问正在整理本轮反馈与下一步安排。": "Your consultant is preparing feedback and next steps.",
  "还没有申请记录": "No applications yet",
  "从真正感兴趣的技术问题开始，而不是从职位名称开始。": "Start with the technical problems you care about, not a job title.",
  "你始终掌控职业信息": "You always control your career data",
  "完善档案可获得更准确推荐": "Complete your profile for better recommendations",
  "等待顾问或面试反馈": "Waiting for consultant or interview feedback",
  "根据当前技术方向筛选": "Selected for your current technical direction",
  "暂无申请数据，提交一份演示申请后这里会自动更新。": "No application data yet. Submit a demo application to update this view.",
  "没有符合当前筛选条件的申请": "No applications match the current filters",
  "选择一位候选人查看详情": "Select a candidate to view details",
  "申请意向已提交": "Application submitted",
  "提交即表示你同意顾问为本次机会查看以上信息。": "By submitting, you allow the consultant to review this information for this opportunity.",
  "补充真实职业信息，顾问将在工作台中同步后续进度。": "Add accurate career information and your consultant will update progress in the workspace.",
  "约 3 分钟 · 信息仅对你与顾问可见": "About 3 minutes · Visible only to you and your consultant",
  "产品": "Product",
  "开放机会": "Open roles",
  "候选人端": "Candidate",
  "候选人中心": "Candidate center",
  "招聘方后台": "Recruiter console",
  "顾问后台": "Consultant console",
  "个人工作台": "Personal workspace",
  "登录": "Sign in",
  "退出": "Sign out",
  "菜单": "Menu",
  "开始搜索": "Start search",
  "开始搜索人才": "Search talent",
  "浏览开放机会": "Browse roles",
  "查看精选机会": "View selected roles",
  "返回候选人中心": "Back to candidate center",
  "管理全部申请": "Manage all applications",
  "搜索人才": "Search talent",
  "查看完整数据": "View all data",
  "进入管理控制台": "Open admin console",
  "编辑飞云档案": "Edit Feiyun profile",
  "查看全部": "View all",
  "发现机会": "Discover roles",
  "继续浏览": "Keep browsing",
  "查看机会": "View roles",
  "创建飞云档案": "Create profile",
  "提交意向": "Apply now",
  "确认提交": "Submit application",
  "进入工作台": "Open workspace",
  "返回个人工作台": "Back to workspace",
  "浏览新机会": "Browse new roles",
  "人才搜索": "Talent search",
  "证据推理": "Evidence reasoning",
  "实时任务": "Live tasks",
  "人才档案": "Talent profiles",
  "重点方向": "Focus domains",
  "读取公开工作": "Read public work",
  "验证能力轨迹": "Validate capability trajectory",
  "生成人才判断": "Generate talent insight",
  "读取工作轨迹": "Read work history",
  "交叉验证能力": "Cross-check capabilities",
  "识别近期变化": "Identify recent change",
  "已完成": "Completed",
  "完成": "Complete",
  "运行中": "Running",
  "排队中": "Queued",
  "正在分析": "Analyzing",
  "等待上游任务": "Waiting on previous step",
  "待计算": "Pending",
  "待生成": "Pending",
  "刚刚更新": "Updated just now",
  "分析中": "Analyzing",
  "公开信号源": "Public signal sources",
  "判断可追溯": "Traceable insights",
  "重点技术领域": "Technical domains",
  "持续更新": "Continuous updates",
  "高相关人才": "High relevance",
  "匹配": "match",
  "人才网络在线": "Talent network online",
  "全网证据搜索": "Web-wide evidence search",
  "已收藏": "Saved",
  "收藏": "Save",
  "已选": "Selected",
  "对比": "Compare",
  "实时计算": "Live calculation",
  "招聘方向": "Hiring domain",
  "人才难度": "Talent difficulty",
  "标准人才": "Standard talent",
  "资深 / 专家": "Senior / Expert",
  "负责人 / 稀缺人才": "Leader / Rare talent",
  "招聘周期": "Hiring timeline",
  "计划置信度": "Plan confidence",
  "人才研究": "Talent research",
  "有效沟通": "Qualified conversations",
  "进入面试": "Interviews",
  "发出 Offer": "Offers",
  "目标入职": "Target hires",
  "复制行动计划": "Copy action plan",
  "已复制": "Copied",
  "下载 TXT": "Download TXT",
  "证据一致性": "Evidence consistency",
  "近期信号": "Recent signals",
  "智能推荐": "Smart recommendation",
  "查看全部机会": "View all roles",
  "方向": "Domain",
  "当前机会": "Open roles",
  "研究主题": "Research topic",
  "步骤": "Step",
  "研究任务": "Research task",
  "状态": "Status",
  "申请进度": "Application progress",
  "档案完成度": "Profile completion",
  "进行中申请": "Active applications",
  "推荐机会": "Recommended roles",
  "档案状态": "Profile status",
  "公开": "Public",
  "私密": "Private",
  "人才总数": "Total talent",
  "活跃流程": "Active processes",
  "面试阶段": "Interview stage",
  "招聘人才管道": "Hiring pipeline",
  "最近更新的人才": "Recently updated talent",
  "候选人": "Candidate",
  "目标职位": "Target role",
  "期望薪资": "Expected salary",
  "新人才": "New talent",
  "评估中": "Screening",
  "面试中": "Interview",
  "复核高匹配候选人": "Review high-match candidates",
  "安排面试反馈": "Coordinate interview feedback",
  "更新人才触达": "Refresh outreach",
  "全部申请": "All applications",
  "进行中": "In progress",
  "我的申请": "My applications",
  "我的飞云档案": "My Feiyun profile",
  "档案已安全保存": "Profile saved securely",
  "保存失败": "Save failed",
  "保存中…": "Saving…",
  "保存档案": "Save profile",
  "姓名": "Name",
  "联系电话": "Phone",
  "所在城市": "City",
  "当前公司": "Current company",
  "当前岗位": "Current role",
  "工作年限": "Years of experience",
  "当前薪资": "Current compensation",
  "当前职级": "Current level",
  "绩效与奖金": "Performance and bonus",
  "绩效奖金": "Performance bonus",
  "晋升情况": "Promotion history",
  "核心技能": "Core skills",
  "关于我": "About me",
  "允许飞云在匹配机会时展示这份档案": "Allow Feiyun to show this profile for opportunity matching",
  "用户名或邮箱": "Username or email",
  "管理员密码": "Administrator password",
  "候选人必填": "Required for candidates",
  "普通候选人无需填写": "Not required for candidates",
  "申请岗位": "Role",
  "求职动机": "Motivation",
  "流程状态": "Process status",
  "顾问备注": "Consultant notes",
  "保存更新": "Save updates",
  "导出 CSV": "Export CSV",
  "团队": "Team",
  "地点": "Location",
  "类型": "Type",
  "薪酬": "Compensation",
  "我们在寻找": "What we are looking for",
  "飞云如何帮助你": "How Feiyun helps",
  "对这个机会感兴趣": "Interested in this role",
  "大模型与多模态": "Foundation models & multimodal",
  "机器人与具身智能": "Robotics & embodied AI",
  "自动驾驶": "Autonomous driving",
  "芯片与体系结构": "Chips & architecture",
  "AI 产品与设计": "AI product & design",
  "多模态算法": "Multimodal algorithms",
  "具身智能": "Embodied AI",
  "分布式系统": "Distributed systems",
  "分布式训练": "Distributed training",
  "推理优化": "Inference optimization",
  "千卡训练": "Large-scale training",
  "个开放机会": " open roles",
  "项能力证据": " evidence items",
  "项证据": " evidence items",
  "个来源": " sources",
  "位已收藏": " saved",
  "选择 2 位进行对比": "select two to compare",
  "天前更新": " days ago",
  "暂无候选人": "No candidates",
  "待沟通": "To discuss",
  "公司待补充": "Company pending",
  "职级待补充": "Level pending",
  "未填写电话": "No phone provided",
  "面议": "Negotiable",
  "创建你的公开人才主页。": "Create your public talent profile.",
  "获得专属 `/u/用户名` 链接，展示真实工作、职业方向，并连接你的 GitHub。": "Get a personal `/u/username` link to show your work, direction, and GitHub.",
  "注册并创建主页": "Register and create profile",
  "当前方向": "Current focus",
  "一句话介绍": "Short introduction",
  "你正在做什么，以及希望解决什么问题": "What you are working on and the problems you want to solve",
  "已有账号？": "Already registered?",
  "返回登录": "Back to sign in",
  "还没有公开主页？": "No public profile yet?",
  "注册账号": "Register",
  "连接你的真实工作": "Connect your real work",
  "查看公开主页": "View public profile",
  "创建公开主页": "Create public profile",
  "已连接": "Connected",
  "个公开仓库": " public repositories",
  "位关注者": " followers",
  "打开 GitHub": "Open GitHub",
  "授权后同步公开头像、简介、仓库与语言，不保存访问令牌。": "Sync your public avatar, bio, repositories, and languages without storing the access token.",
  "使用 GitHub 连接": "Connect with GitHub",
  "或绑定公开用户名": "Or link a public username",
  "无需授权，直接读取 GitHub 已公开的信息。": "No authorization required; only public GitHub information is read.",
  "GitHub 用户名": "GitHub username",
  "同步中…": "Syncing…",
  "连接": "Connect",
  "公开人才主页": "Public talent profile",
  "分享主页": "Share profile",
  "链接已复制": "Link copied",
  "编辑主页": "Edit profile",
  "正在完善这份公开人才主页。": "This public talent profile is being completed.",
  "年经验": " years of experience",
  "正在补充技能": "Skills coming soon",
  "GitHub 公开仓库": "GitHub public repositories",
  "GitHub 关注者": "GitHub followers",
  "活跃技术语言": "Active languages",
  "最近的 GitHub 工作": "Recent GitHub work",
  "全部仓库": "All repositories",
  "查看这个公开项目及其最近更新。": "View this public project and its latest updates.",
  "GitHub 暂时无法读取": "GitHub is temporarily unavailable",
  "还没有连接 GitHub": "GitHub is not connected yet",
  "前往个人工作台连接 GitHub，公开项目会自动出现在这里。": "Connect GitHub from your workspace and public projects will appear here automatically.",
  "这位用户正在整理公开工作。": "This person is organizing their public work.",
  "创建你的公开主页": "Create your public profile",
  "我的主页": "My profile",
  "创建主页": "Create profile",
  "注册公开账号": "Register public account",
  "公开展示这份档案，并允许飞云用于机会匹配": "Show this profile publicly and allow Feiyun to use it for matching",
  "把人才需求编排为可推进、可复核、可导出的研究任务。": "Turn talent needs into research missions that can be advanced, reviewed, and exported.",
  "例如：做过推理平台从 0 到 1 的技术负责人": "Example: a technical lead who built an inference platform from zero to one",
  "把人才需求编排为可推进、可复核、可导出的研究任务": "Orchestrate talent needs into actionable, reviewable, exportable research missions",
  "试试更宽的研究方向，或清除当前筛选。": "Try a broader research domain or clear the current filters.",
  "切换状态或加入一个新的研究目标。": "Change the status filter or add a new research target.",
  "有真机量产经验的具身算法专家": "Embodied AI expert with production hardware experience",
  "世界模型与端到端驾驶负责人": "World-model and end-to-end driving lead",
  "千卡训练与推理优化负责人": "Large-scale training and inference optimization lead",
  "研究任务控制台": "Research mission control",
  "任务网络已同步": "Mission network synchronized",
  "任务完成率": "Mission completion",
  "新研究目标": "New research target",
  "研究方向": "Research domain",
  "加入队列": "Add to queue",
  "全部任务": "All missions",
  "已验证": "Verified",
  "导出任务报告": "Export mission report",
  "目标 / 方向": "Target / domain",
  "遥测": "Telemetry",
  "操作": "Actions",
  "个有效信号": " valid signals",
  "完成验证": "Complete review",
  "重新开启": "Reopen",
  "启动": "Launch",
  "归档": "Archive",
  "当前筛选下没有任务": "No missions match this filter",
  "最新事件": "Latest event",
  "最近研究": "Recent research",
  "清除对比": "Clear comparison",
  "导出当前收藏": "Export visible saved",
  "导出收藏": "Export saved",
  "等待研究任务": "Waiting for research mission",
  "正在连接公开信号源": "Connecting to public signal sources",
  "位候选人通过初步验证": " candidates passed initial validation",
  "已载入演示人才网络结果": "Demo talent-network results loaded",
  "网络暂不可用，已载入本地验证样本": "Network unavailable; local validated samples loaded",
  "职位探索器": "Role explorer",
  "只看已收藏": "Saved only",
  "搜索职位": "Search roles",
  "职位、方向、城市或关键词": "Role, domain, city, or keyword",
  "工作方式": "Work mode",
  "全部方式": "All modes",
  "支持远程": "Remote supported",
  "现场优先": "On-site first",
  "排序": "Sort",
  "最近更新": "Recently updated",
  "职位名称": "Role title",
  "个匹配机会": " matching roles",
  "已收藏任务": "Saved missions",
  "清除筛选": "Clear filters",
  "收藏职位": "Save role",
  "查看任务": "View mission",
  "没有符合条件的机会": "No roles match these filters",
  "重置职位雷达": "Reset role radar",
};

const translationPairs = Object.entries(translations).sort(
  ([left], [right]) => right.length - left.length,
);
let activeLanguage: Language = "zh";
const sourceText = new WeakMap<Text, string>();
const renderedText = new WeakMap<Text, string>();
const sourceAttributes = new WeakMap<Element, Map<string, string>>();
const renderedAttributes = new WeakMap<Element, Map<string, string>>();

function translate(value: string) {
  return translationPairs.reduce(
    (result, [zh, en]) => result.replaceAll(zh, en),
    value,
  );
}

function updateTextNode(node: Text, language: Language) {
  const current = node.data;
  const rendered = renderedText.get(node);
  if (!sourceText.has(node) || (rendered !== undefined && current !== rendered)) {
    sourceText.set(node, current);
  }
  const original = sourceText.get(node) ?? current;
  const next = language === "en" ? translate(original) : original;
  renderedText.set(node, next);
  if (current !== next) node.data = next;
}

function updateAttribute(element: Element, name: string, language: Language) {
  const current = element.getAttribute(name);
  if (current === null) return;
  const source = sourceAttributes.get(element) ?? new Map<string, string>();
  const rendered = renderedAttributes.get(element) ?? new Map<string, string>();
  if (!source.has(name) || (rendered.has(name) && current !== rendered.get(name))) {
    source.set(name, current);
    sourceAttributes.set(element, source);
  }
  const original = source.get(name) ?? current;
  const next = language === "en" ? translate(original) : original;
  rendered.set(name, next);
  renderedAttributes.set(element, rendered);
  if (current !== next) element.setAttribute(name, next);
}

function updateSubtree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    const text = root as Text;
    if (!text.parentElement?.closest(".site-preferences, script, style, noscript")) {
      updateTextNode(text, language);
    }
    return;
  }
  if (!(root instanceof Element || root instanceof Document)) return;
  if (
    root instanceof Element &&
    root.closest(".site-preferences, script, style, noscript")
  ) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!(node.parentElement?.closest(".site-preferences, script, style, noscript"))) {
      updateTextNode(node as Text, language);
    }
    node = walker.nextNode();
  }

  const elements = root instanceof Element ? [root, ...root.querySelectorAll("*")] : [...root.querySelectorAll("*")];
  elements.forEach((element) => {
    if (element.closest(".site-preferences, script, style, noscript")) return;
    ["placeholder", "aria-label", "title"].forEach((name) =>
      updateAttribute(element, name, language),
    );
  });
}

function setDocumentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function setDocumentLanguage(language: Language) {
  activeLanguage = language;
  document.documentElement.dataset.lang = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  updateSubtree(document.body, language);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("zh");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("feiyun-theme");
    const savedLanguage = window.localStorage.getItem("feiyun-language");
    const initialTheme: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const initialLanguage: Language = savedLanguage === "en" ? "en" : "zh";
    setDocumentTheme(initialTheme);
    setDocumentLanguage(initialLanguage);
    const frame = window.requestAnimationFrame(() => {
      setTheme(initialTheme);
      setLanguage(initialLanguage);
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          const target = mutation.target as Text;
          if (!target.parentElement?.closest(".site-preferences, script, style, noscript")) {
            updateTextNode(target, activeLanguage);
          }
        } else if (mutation.type === "attributes") {
          updateAttribute(mutation.target as Element, mutation.attributeName ?? "", activeLanguage);
        } else {
          mutation.addedNodes.forEach((node) => updateSubtree(node, activeLanguage));
        }
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "aria-label", "title"],
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  function chooseTheme(next: Theme) {
    setTheme(next);
    setDocumentTheme(next);
    window.localStorage.setItem("feiyun-theme", next);
    setOpen(false);
  }

  function chooseLanguage(next: Language) {
    setLanguage(next);
    setDocumentLanguage(next);
    window.localStorage.setItem("feiyun-language", next);
    setOpen(false);
  }

  return (
    <div className="site-preferences" data-open={open ? "true" : "false"} aria-label="显示偏好">
      <button
        className="preference-trigger"
        type="button"
        aria-label="打开显示偏好"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Aa
      </button>
      <div className="preferences-panel">
        <div className="preference-group" aria-label="语言切换">
          <button type="button" aria-label="中文" aria-pressed={language === "zh"} onClick={() => chooseLanguage("zh")}>中</button>
          <button type="button" aria-label="English" aria-pressed={language === "en"} onClick={() => chooseLanguage("en")}>EN</button>
        </div>
        <span aria-hidden="true" />
        <div className="preference-group" aria-label="界面主题">
          <button type="button" aria-label="浅色模式" title="浅色模式" aria-pressed={theme === "light"} onClick={() => chooseTheme("light")}>
            <span className="theme-swatch theme-swatch-light" aria-hidden="true" />
          </button>
          <button type="button" aria-label="深色模式" title="深色模式" aria-pressed={theme === "dark"} onClick={() => chooseTheme("dark")}>
            <span className="theme-swatch theme-swatch-dark" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
