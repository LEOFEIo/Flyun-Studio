(() => {
  const STORAGE = {
    session: "feiyun_portal_session_v2",
    profile: "feiyun_candidate_profile_v2",
    talents: "feiyun_recruiter_talents_v2",
  };

  const defaultApplications = [
    { company: "星环智能", role: "AI Infra 工程师", status: "技术面试", className: "interview", date: "08.02 · 14:00" },
    { company: "原点机器人", role: "具身智能算法工程师", status: "已推荐", className: "", date: "07.29" },
    { company: "流形科技", role: "多模态研究员", status: "Offer 评估", className: "offer", date: "07.25" },
  ];

  const defaultTalents = [
    { id: 1, name: "林知夏", email: "zhixia@example.com", role: "AI Infra 工程师", company: "Nebula AI", job: "AI Infra", stage: "interview", score: 96, city: "上海", source: "人才地图" },
    { id: 2, name: "陈嘉树", email: "jiashu@example.com", role: "多模态研究员", company: "OpenVision", job: "多模态", stage: "screen", score: 93, city: "北京", source: "智能搜索" },
    { id: 3, name: "周砚", email: "yan@example.com", role: "推理优化专家", company: "VectorLab", job: "AI Infra", stage: "sourcing", score: 91, city: "深圳", source: "社区推荐" },
    { id: 4, name: "许云澜", email: "yunlan@example.com", role: "AI 产品负责人", company: "Arc Studio", job: "AI 产品", stage: "offer", score: 95, city: "杭州", source: "人才社群" },
    { id: 5, name: "沈亦安", email: "yian@example.com", role: "具身智能算法工程师", company: "MotionX", job: "具身智能", stage: "interview", score: 89, city: "北京", source: "定向寻访" },
    { id: 6, name: "宋澄", email: "cheng@example.com", role: "编译器工程师", company: "SiliconFlow", job: "AI Infra", stage: "screen", score: 88, city: "上海", source: "智能搜索" },
    { id: 7, name: "顾南川", email: "nanchuan@example.com", role: "自动驾驶规划专家", company: "Autonomy", job: "自动驾驶", stage: "sourcing", score: 87, city: "广州", source: "人才地图" },
    { id: 8, name: "姜苒", email: "ran@example.com", role: "模型评测负责人", company: "EvalWorks", job: "多模态", stage: "offer", score: 92, city: "杭州", source: "社区推荐" },
  ];

  const stages = [
    { id: "sourcing", label: "人才发现" },
    { id: "screen", label: "沟通筛选" },
    { id: "interview", label: "面试进行" },
    { id: "offer", label: "Offer / 入职" },
  ];

  const icon = (name, size = "") => {
    const paths = {
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
      logout: '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
      edit: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 7.5 3 3"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      spark: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    };
    return `<svg class="icon ${size}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  };

  const safe = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const byId = (id) => document.getElementById(id);

  let toastTimer;
  const toast = (message) => {
    const element = byId("portal-toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove("show"), 2200);
  };

  const openModal = (id) => {
    const modal = byId(id);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const bindGlobalActions = () => {
    document.addEventListener("click", (event) => {
      const openButton = event.target.closest("[data-open-modal]");
      if (openButton) openModal(openButton.dataset.openModal);

      const closeButton = event.target.closest("[data-close-modal]");
      if (closeButton) closeModal(closeButton.closest(".modal-backdrop"));

      if (event.target.classList.contains("modal-backdrop")) closeModal(event.target);

      const logoutButton = event.target.closest("[data-logout]");
      if (logoutButton) {
        localStorage.removeItem(STORAGE.session);
        window.location.href = "login.html";
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(closeModal);
      }
    });
  };

  const switchLoginRole = (role) => {
    document.querySelectorAll(".role-tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.role === role);
      button.setAttribute("aria-selected", String(button.dataset.role === role));
    });
    byId("login-form").dataset.role = role;
    byId("candidate-fields").classList.toggle("hidden", role !== "candidate");
    byId("recruiter-fields").classList.toggle("hidden", role !== "recruiter");
    byId("login-submit").innerHTML =
      role === "candidate"
        ? `进入候选人中心 ${icon("arrow")}`
        : `进入招聘方后台 ${icon("arrow")}`;
    byId("login-hint").innerHTML =
      role === "candidate"
        ? "候选人演示无需注册，姓名与邮箱仅保存在当前浏览器。"
        : "招聘方后台仅在完整 Next.js 部署中开放，并需要通过环境变量配置管理员凭据。";
    byId("login-error").textContent = "";
  };

  const initLogin = () => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    switchLoginRole(requestedRole === "recruiter" ? "recruiter" : "candidate");

    document.querySelectorAll(".role-tab").forEach((button) => {
      button.addEventListener("click", () => switchLoginRole(button.dataset.role));
    });

    byId("login-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const role = event.currentTarget.dataset.role;
      const error = byId("login-error");
      error.textContent = "";

      if (role === "recruiter") {
        error.textContent = "静态版本不提供管理员登录，请部署 Next.js 版本后配置管理员环境变量。";
        return;
      }

      const name = byId("candidate-login-name").value.trim();
      const email = byId("candidate-login-email").value.trim();
      if (!name || !email || !email.includes("@")) {
        error.textContent = "请填写姓名与有效邮箱。";
        return;
      }
      const profile = read(STORAGE.profile, {});
      write(STORAGE.profile, {
        title: "AI / 科技人才",
        city: "上海",
        skills: "大模型，AI Infra，Python",
        summary: "关注 AI 原生团队与有真实技术挑战的机会。",
        ...profile,
        name,
        email,
      });
      write(STORAGE.session, { role: "candidate", name, email, signedInAt: Date.now() });
      window.location.href = "candidate.html";
    });
  };

  const requireSession = (role) => {
    const session = read(STORAGE.session, null);
    if (!session || session.role !== role) {
      window.location.replace(`login.html?role=${role === "recruiter" ? "recruiter" : "candidate"}`);
      return null;
    }
    return session;
  };

  const initials = (name) => {
    const chars = Array.from(String(name || "飞云").trim());
    return chars.slice(-2).join("").toUpperCase();
  };

  const profileText = (profile) =>
    [
      `姓名：${profile.name}`,
      `邮箱：${profile.email}`,
      `方向：${profile.title}`,
      `城市：${profile.city}`,
      `技能：${profile.skills}`,
      `职业摘要：${profile.summary}`,
    ].join("\n");

  const downloadText = (filename, content, type = "text/plain;charset=utf-8") => {
    const blob = new Blob(["\ufeff", content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const initCandidate = () => {
    const session = requireSession("candidate");
    if (!session) return;

    const profile = read(STORAGE.profile, {
      name: session.name,
      email: session.email,
      title: "AI / 科技人才",
      city: "上海",
      skills: "大模型，AI Infra，Python",
      summary: "关注 AI 原生团队与有真实技术挑战的机会。",
    });

    const renderProfile = () => {
      const current = read(STORAGE.profile, profile);
      document.querySelectorAll("[data-candidate-name]").forEach((element) => {
        element.textContent = current.name;
      });
      document.querySelectorAll("[data-candidate-email]").forEach((element) => {
        element.textContent = current.email;
      });
      document.querySelectorAll("[data-candidate-avatar]").forEach((element) => {
        element.textContent = initials(current.name);
      });
      byId("profile-title").textContent = current.title;
      byId("profile-city").textContent = current.city;
      byId("profile-skills").textContent = current.skills;
      byId("profile-summary").textContent = current.summary;

      byId("profile-name-input").value = current.name;
      byId("profile-email-input").value = current.email;
      byId("profile-title-input").value = current.title;
      byId("profile-city-input").value = current.city;
      byId("profile-skills-input").value = current.skills;
      byId("profile-summary-input").value = current.summary;
    };

    byId("candidate-pipeline").innerHTML = defaultApplications
      .map(
        (application, index) => `
          <article class="pipeline-row">
            <span class="pipeline-index">0${index + 1}</span>
            <div>
              <strong>${safe(application.role)}</strong>
              <small>${safe(application.company)} · 顾问持续跟进</small>
            </div>
            <div class="pipeline-status">
              <span class="status ${application.className}">${safe(application.status)}</span>
              <time>${safe(application.date)}</time>
            </div>
          </article>`,
      )
      .join("");

    byId("profile-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const updated = {
        name: byId("profile-name-input").value.trim(),
        email: byId("profile-email-input").value.trim(),
        title: byId("profile-title-input").value.trim(),
        city: byId("profile-city-input").value.trim(),
        skills: byId("profile-skills-input").value.trim(),
        summary: byId("profile-summary-input").value.trim(),
      };
      write(STORAGE.profile, updated);
      write(STORAGE.session, { ...session, name: updated.name, email: updated.email });
      renderProfile();
      closeModal(byId("profile-modal"));
      toast("候选人档案已保存");
    });

    byId("export-profile").addEventListener("click", () => {
      downloadText("飞云候选人档案.txt", profileText(read(STORAGE.profile, profile)));
      toast("档案已导出");
    });

    byId("advisor-action").addEventListener("click", () => {
      byId("advisor-copy").textContent =
        "已基于你的 AI Infra 与大模型经验生成定位：优先匹配推理优化、模型服务平台和基础设施核心岗。建议补充一个可量化的性能优化案例。";
      toast("AI 职业建议已更新");
    });

    renderProfile();
  };

  const getTalents = () => {
    const talents = read(STORAGE.talents, null);
    if (Array.isArray(talents) && talents.length) return talents;
    write(STORAGE.talents, defaultTalents);
    return [...defaultTalents];
  };

  const stageLabel = (stage) => stages.find((item) => item.id === stage)?.label || stage;

  const talentCard = (talent) => `
    <article class="talent-card">
      <div class="avatar">${safe(initials(talent.name))}</div>
      <strong>${safe(talent.name)}</strong>
      <p>${safe(talent.role)}</p>
      <small>${safe(talent.company)} · ${safe(talent.city)} · 匹配 ${safe(talent.score)}%</small>
      <footer>
        <select data-stage-select="${talent.id}" aria-label="修改 ${safe(talent.name)} 的招聘阶段">
          ${stages.map((stage) => `<option value="${stage.id}" ${stage.id === talent.stage ? "selected" : ""}>${stage.label}</option>`).join("")}
        </select>
        <button type="button" data-view-talent="${talent.id}" aria-label="查看 ${safe(talent.name)}">${icon("arrow", "icon-sm")}</button>
      </footer>
    </article>`;

  const initRecruiter = () => {
    const session = requireSession("recruiter");
    if (!session) return;

    let talents = getTalents();
    let query = "";
    let job = "all";

    const filteredTalents = () =>
      talents.filter((talent) => {
        const text = `${talent.name} ${talent.role} ${talent.company} ${talent.city} ${talent.job}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (job === "all" || talent.job === job);
      });

    const renderStats = () => {
      byId("talent-count").textContent = String(talents.length);
      byId("interview-count").textContent = String(talents.filter((talent) => talent.stage === "interview").length);
      byId("offer-count").textContent = String(talents.filter((talent) => talent.stage === "offer").length);
      const average = Math.round(talents.reduce((sum, talent) => sum + Number(talent.score), 0) / talents.length);
      byId("match-average").textContent = `${average}%`;
    };

    const render = () => {
      const current = filteredTalents();
      byId("kanban-board").innerHTML = stages
        .map((stage) => {
          const group = current.filter((talent) => talent.stage === stage.id);
          return `
            <section class="kanban-column">
              <header><strong>${stage.label}</strong><span>${group.length}</span></header>
              <div class="kanban-cards">
                ${group.length ? group.map(talentCard).join("") : '<div class="talent-card"><small>暂无匹配候选人</small></div>'}
              </div>
            </section>`;
        })
        .join("");

      byId("talent-table").innerHTML = current
        .map(
          (talent) => `
            <div class="table-row">
              <div class="table-person">
                <i>${safe(initials(talent.name))}</i>
                <b>${safe(talent.name)}</b>
                <small>${safe(talent.email)}</small>
              </div>
              <span>${safe(talent.role)} · ${safe(talent.company)}</span>
              <span>${safe(talent.job)}</span>
              <span>${safe(stageLabel(talent.stage))} · ${safe(talent.score)}%</span>
              <button type="button" data-view-talent="${talent.id}" aria-label="查看 ${safe(talent.name)}">${icon("arrow", "icon-sm")}</button>
            </div>`,
        )
        .join("");
      byId("result-count").textContent = `${current.length} 位人才`;
      renderStats();
    };

    const persistAndRender = () => {
      write(STORAGE.talents, talents);
      render();
    };

    byId("talent-search").addEventListener("input", (event) => {
      query = event.target.value.trim();
      render();
    });

    byId("job-filter").addEventListener("change", (event) => {
      job = event.target.value;
      render();
    });

    document.addEventListener("change", (event) => {
      const select = event.target.closest("[data-stage-select]");
      if (!select) return;
      const id = Number(select.dataset.stageSelect);
      talents = talents.map((talent) => (talent.id === id ? { ...talent, stage: select.value } : talent));
      persistAndRender();
      toast("候选人阶段已更新");
    });

    document.addEventListener("click", (event) => {
      const viewButton = event.target.closest("[data-view-talent]");
      if (!viewButton) return;
      const talent = talents.find((item) => item.id === Number(viewButton.dataset.viewTalent));
      if (!talent) return;
      byId("talent-modal-title").textContent = talent.name;
      byId("talent-modal-content").innerHTML = `
        <div class="profile-score">
          <div class="score-ring">${safe(talent.score)}</div>
          <div>
            <strong>${safe(talent.role)}</strong>
            <p>${safe(talent.company)} · ${safe(talent.city)} · ${safe(talent.email)}</p>
          </div>
        </div>
        <p>${safe(talent.name)} 与「${safe(talent.job)}」方向高度匹配。证据来自 ${safe(talent.source)}，建议下一步验证项目深度、协作方式与到岗预期。</p>`;
      openModal("talent-modal");
    });

    byId("add-talent-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const newTalent = {
        id: Date.now(),
        name: String(form.get("name")).trim(),
        email: String(form.get("email")).trim(),
        role: String(form.get("role")).trim(),
        company: String(form.get("company")).trim(),
        job: String(form.get("job")),
        stage: String(form.get("stage")),
        score: Math.min(100, Math.max(50, Number(form.get("score")) || 85)),
        city: String(form.get("city")).trim(),
        source: "手动录入",
      };
      talents = [newTalent, ...talents];
      event.currentTarget.reset();
      persistAndRender();
      closeModal(byId("add-talent-modal"));
      toast("候选人已加入人才池");
    });

    document.querySelectorAll("[data-export-csv]").forEach((button) => button.addEventListener("click", () => {
      const headers = ["姓名", "邮箱", "方向", "公司", "职位项目", "阶段", "匹配度", "城市", "来源"];
      const rows = talents.map((talent) => [
        talent.name,
        talent.email,
        talent.role,
        talent.company,
        talent.job,
        stageLabel(talent.stage),
        `${talent.score}%`,
        talent.city,
        talent.source,
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n");
      downloadText("飞云人才池.csv", csv, "text/csv;charset=utf-8");
      toast("人才池 CSV 已导出");
    }));

    byId("admin-name").textContent = session.name;
    render();
  };

  bindGlobalActions();
  const portal = document.body.dataset.portal;
  if (portal === "login") initLogin();
  if (portal === "candidate") initCandidate();
  if (portal === "recruiter") initRecruiter();
})();
