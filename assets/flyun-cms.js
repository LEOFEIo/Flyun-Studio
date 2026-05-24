/* ==========================================================
 * FLYUN CMS · 飞云内容管理 + 多语言 + 主题 + Supabase 云同步
 * v3 · 2026-05
 *
 * 设计目标：
 *   - 公共访客  →  匿名读云端（博客 / 文案 / 图片 / 案例 / Letter / 招聘）
 *   - 工作室    →  Supabase 邮箱密码登录后写云端
 *   - 离线兜底  →  localStorage 缓存，断网可读
 *   - 兼容旧版  →  保留 v1 的所有同步 API（getPosts / getContent…）
 * ========================================================== */
(function (global) {
  'use strict';

  /* ===== Supabase 配置（前端可见，受 RLS 保护） ===== */
  const SUPABASE_URL = 'https://neppacfsixrjzpkvcgxy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz';
  const SUPABASE_UMD = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  /* ===== localStorage 缓存键 ===== */
  const KEYS = {
    content:  'flyun:content:v1',
    posts:    'flyun:posts:v1',
    cases:    'flyun:cases:v1',
    letters:  'flyun:letters:v1',
    jobs:     'flyun:jobs:v1',
    images:   'flyun:images:v1',
    settings: 'flyun:settings:v1',
    lang:     'flyun:lang',
    theme:    'flyun:theme',
    auth:     'flyun:admin:auth'
  };

  /* ============== 默认中英文字典 ============== */
  const DEFAULT_DICT = {
    zh: {
      'nav.about': '关于', 'nav.services': '业务', 'nav.xr': 'VR · AR',
      'nav.talent': '猎头', 'nav.cases': '案例', 'nav.lab': '实验室',
      'nav.letter': 'Letter', 'nav.blog': '博客', 'nav.pricing': '合作',
      'nav.cta': '建立合作', 'nav.admin': '后台',

      'hero.status': '2026 Q3 · 接受新合作 · XR / 空间 / 猎头',
      'hero.coord1': 'FLYUN 飞云工作室 · EST. 2026',
      'hero.coord2': '空间 · XR · 人才',
      'hero.title.row1.pre': '让', 'hero.title.row1.em': '空间', 'hero.title.row1.post': '开口，',
      'hero.title.row2.pre': '让', 'hero.title.row2.em': '像素', 'hero.title.row2.post': '有体温，',
      'hero.title.row3.pre': '让对的人', 'hero.title.row3.em': '在场', 'hero.title.row3.post': '。',
      'hero.manifesto':
        'FLYUN 飞云 是一间专注于「交互空间 × XR × 人才」的独立设计工作室。我们用 VR / AR / 空间计算 把数字交互的逻辑带进物理场域，用猎头与人才网络把对的人放进对的故事里 —— 让每一次靠近、每一次戴上头显、每一次面试，都成为一次被设计过的对话。',
      'hero.cta.primary': '看我们能做什么',
      'hero.cta.secondary': '猎头业务 →',

      'about.eyebrow': '01 · 主创 / FOUNDER',
      'about.title.html': '游走在<br/><em>屏幕</em>、<em>头显</em><br/>与<em>真人</em>之间。',
      'about.desc':
        '我是 Leo —— FLYUN 飞云的创始人 / 主创设计师。过去七年我在交互设计、品牌空间、XR 体验与人才业务之间游走，现在我把这些经验聚拢，做一件简单的事：让空间会回应人，让对的人在场。',

      'services.eyebrow': '02 · 业务 / WHAT WE DO',
      'services.title.html': '六种<br/>让<em>空间</em>与<em>人</em><br/>互相回应的方式。',
      'services.desc':
        'FLYUN 飞云的业务围绕「人 — 空间 — 数字」三角展开 —— 左手做交互空间与 VR/AR 体验，右手做人才网络与猎头服务。每条线都可以独立交付，也可以组合成完整的品牌空间 + 人才体系。',

      'xr.eyebrow': '02.5 · XR / VR · AR',
      'xr.title.html': '把<em>头显</em><br/>当作新的<em>大门</em>。',
      'xr.desc':
        'Apple Vision Pro 与 Meta Quest 的出现，让「空间」第一次可以被分发、被打开、被合并。FLYUN 把过去做品牌空间的方法，搬进了头显里 —— 不做炫技 demo，只做能被记住的空间叙事。',

      'talent.eyebrow': '02.8 · TALENT / 猎头人才',
      'talent.title.html': '把对的<em>人</em><br/>放进对的<em>故事</em>里。',
      'talent.desc':
        '飞云猎头是 FLYUN 的人才业务线 —— 我们不做大而全的招聘，只在自己懂的领域做深 —— 数字创意、XR / 空间计算、品牌与体验设计。飞云自研的 AI 寻访工作站让每一位顾问都像带着「外骨骼」工作。',

      'showcase.eyebrow': '03 · 案例与孵化 / CASES & CONCEPTS',
      'showcase.title.html': '精选<em>项目</em><br/>与孵化中的<em>概念</em>。',

      'process.eyebrow': '04 · 工作流 / HOW WE WORK',
      'process.title.html': '五步，<br/>一段被设计过<br/>的<em>空间对话</em>。',

      'pricing.eyebrow': '05 · 合作方式 / ENGAGEMENT',
      'pricing.title.html': '三种<br/><em>开始</em>合作的方式。',

      'roadmap.eyebrow': '06 · 路线图 / ROADMAP',
      'roadmap.title.html': '十八个月，<br/>从一张<em>桌</em><br/>到一间<em>工作室</em>。',

      'contact.eyebrow': '07 · 建立对话 / LET\'S TALK',
      'contact.title.html': '你有一个<br/><em>空间</em>、一副<em>头显</em><br/>或一个<em>岗位</em>，<br/>我们让它<em>发声</em>。',

      'footer.copyright': '© 2026 FLYUN STUDIO · 飞云工作室 · 保留全部权利',
      'footer.location': '武汉 · WUHAN · 服务全球',
      'footer.back': '↑ 回到顶部',

      'blog.title': '飞云博客',
      'blog.subtitle': '设计、XR、人才与一些研究生日记。',
      'blog.empty': '这里还很安静，第一篇文章正在路上。',
      'blog.read': '阅读全文',
      'blog.back': '← 返回博客',

      'lang.toggle': 'EN',
      'theme.toggle.light': '☼',
      'theme.toggle.dark':  '☾'
    },
    en: {
      'nav.about': 'About', 'nav.services': 'Services', 'nav.xr': 'VR · AR',
      'nav.talent': 'Talent', 'nav.cases': 'Cases', 'nav.lab': 'Lab',
      'nav.letter': 'Letter', 'nav.blog': 'Blog', 'nav.pricing': 'Engage',
      'nav.cta': 'Start a project', 'nav.admin': 'Admin',

      'hero.status': '2026 Q3 · Accepting new projects · XR / Spatial / Talent',
      'hero.coord1': 'FLYUN STUDIO · EST. 2026',
      'hero.coord2': 'SPATIAL · XR · TALENT',
      'hero.title.row1.pre': 'Make ', 'hero.title.row1.em': 'space', 'hero.title.row1.post': ' speak,',
      'hero.title.row2.pre': 'Make ', 'hero.title.row2.em': 'pixels', 'hero.title.row2.post': ' warm,',
      'hero.title.row3.pre': 'Put the right people ', 'hero.title.row3.em': 'on stage', 'hero.title.row3.post': '.',
      'hero.manifesto':
        'FLYUN is an independent studio at the intersection of spatial interaction, XR and talent. We translate digital logic into physical environments through VR / AR / spatial computing, and place the right people into the right stories through our talent network — every encounter, every headset session, every interview becomes a designed conversation.',
      'hero.cta.primary': 'See what we do',
      'hero.cta.secondary': 'Talent practice →',

      'about.eyebrow': '01 · FOUNDER',
      'about.title.html': 'Between <em>screens</em>,<br/><em>headsets</em><br/>and <em>real people</em>.',
      'about.desc':
        'I\'m Leo — founder and lead designer of FLYUN. I\'ve spent the past seven years moving between interaction design, brand space, XR experiences and talent. Now I bring all of that into one simple practice: let space respond to people, let the right people be there.',

      'services.eyebrow': '02 · WHAT WE DO',
      'services.title.html': 'Six ways<br/>for <em>space</em> and <em>people</em><br/>to talk back.',
      'services.desc':
        'FLYUN\'s practice spins around a triangle of people, space and the digital. We design immersive installations and XR experiences on one side, and run a focused headhunting practice on the other — each can ship alone, or combine into a full brand-and-talent system.',

      'xr.eyebrow': '02.5 · XR / VR · AR',
      'xr.title.html': 'Treat the <em>headset</em><br/>as a new <em>doorway</em>.',
      'xr.desc':
        'Apple Vision Pro and Meta Quest have made space distributable for the first time. FLYUN brings our brand-space craft into the headset — no flashy demos, only spatial stories worth remembering.',

      'talent.eyebrow': '02.8 · TALENT',
      'talent.title.html': 'Put the right <em>people</em><br/>into the right <em>stories</em>.',
      'talent.desc':
        'FLYUN Talent is our recruiting practice — narrow on purpose. We work only in fields we live in: digital creative, XR & spatial computing, brand and experience design. Our in-house AI search workstation gives every consultant an exoskeleton.',

      'showcase.eyebrow': '03 · CASES & CONCEPTS',
      'showcase.title.html': 'Selected <em>projects</em><br/>and <em>concepts</em> in the making.',

      'process.eyebrow': '04 · HOW WE WORK',
      'process.title.html': 'Five steps,<br/>one designed<br/><em>spatial conversation</em>.',

      'pricing.eyebrow': '05 · ENGAGEMENT',
      'pricing.title.html': 'Three ways<br/>to <em>begin</em> with us.',

      'roadmap.eyebrow': '06 · ROADMAP',
      'roadmap.title.html': 'Eighteen months,<br/>from a <em>desk</em><br/>to a <em>studio</em>.',

      'contact.eyebrow': '07 · LET\'S TALK',
      'contact.title.html': 'You have a <em>space</em>,<br/>a <em>headset</em><br/>or a <em>role</em> —<br/>we make it <em>speak</em>.',

      'footer.copyright': '© 2026 FLYUN STUDIO · All rights reserved',
      'footer.location': 'Wuhan · serving globally',
      'footer.back': '↑ Back to top',

      'blog.title': 'FLYUN Journal',
      'blog.subtitle': 'Notes on design, XR, talent and grad-school life.',
      'blog.empty': 'Quiet here for now. The first piece is on its way.',
      'blog.read': 'Read more',
      'blog.back': '← Back to journal',

      'lang.toggle': '中',
      'theme.toggle.light': '☼',
      'theme.toggle.dark':  '☾'
    }
  };

  /* ============== STORAGE HELPERS ============== */
  function safeRead(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function emit(name, detail){
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  /* ============== I18N ============== */
  function getLang() {
    const stored = localStorage.getItem(KEYS.lang);
    if (stored === 'zh' || stored === 'en') return stored;
    return (navigator.language || 'zh').toLowerCase().startsWith('en') ? 'en' : 'zh';
  }
  function setLang(lang) {
    localStorage.setItem(KEYS.lang, lang);
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    applyI18n();
    emit('flyun:langchange', { lang });
  }
  function t(key, lang) {
    const L = lang || getLang();
    const dict = DEFAULT_DICT[L] || DEFAULT_DICT.zh;
    const overrides = safeRead(KEYS.content, {});
    if (overrides[L] && overrides[L][key] != null && overrides[L][key] !== '') {
      return overrides[L][key];
    }
    return dict[key] != null ? dict[key] : key;
  }
  function applyI18n(root) {
    const scope = root || document;
    const lang = getLang();
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const mode = el.getAttribute('data-i18n-mode');
      const v = t(key, lang);
      if (mode === 'html' || /\.html$/.test(key)) el.innerHTML = v;
      else el.textContent = v;
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(',').forEach(p => {
        const [a, k] = p.split(':').map(s => s.trim());
        if (a && k) el.setAttribute(a, t(k, lang));
      });
    });
    scope.querySelectorAll('[data-lang-toggle]').forEach(el => {
      el.textContent = t('lang.toggle', lang);
    });
  }

  /* ============== THEME ============== */
  function getTheme() {
    const stored = localStorage.getItem(KEYS.theme);
    if (stored === 'light' || stored === 'dark') return stored;
    // 默认随系统，但首选 dark（与原品牌一致）
    if (matchMedia && matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }
  function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    localStorage.setItem(KEYS.theme, theme);
    applyTheme();
    emit('flyun:themechange', { theme });
  }
  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }
  function applyTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    // 更新切换按钮上的图标
    const lang = getLang();
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.textContent = theme === 'dark'
        ? t('theme.toggle.light', lang)
        : t('theme.toggle.dark', lang);
      btn.setAttribute('aria-label', theme === 'dark' ? 'switch to light' : 'switch to dark');
      btn.setAttribute('title', theme === 'dark' ? '切换到浅色' : '切换到深色');
    });
  }

  /* ===== Light theme stylesheet (injected once, all pages) ===== */
  function injectThemeStyles() {
    if (document.getElementById('flyun-theme-style')) return;
    const css = `
/* ===== FLYUN · Light theme overrides ===== */
html[data-theme="light"]{
  --bg:#F5F1E8;
  --bg-2:#EDE6D6;
  --surface:rgba(255,253,247,.78);
  --surface-2:rgba(255,253,247,.55);
  --border:rgba(10,9,8,.10);
  --border-strong:rgba(10,9,8,.22);
  --text:#0A0908;
  --text-dim:#5C544A;
  --text-mute:#8A7F70;
}
html[data-theme="light"] body{ background:var(--bg); color:var(--text); }
html[data-theme="light"] .noise{ opacity:.025; mix-blend-mode:multiply; }
html[data-theme="light"] .aura::before{ opacity:.10; }
html[data-theme="light"] .aura::after { opacity:.10; }
html[data-theme="light"] .grid-bg{
  background-image:
    linear-gradient(rgba(10,9,8,.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(10,9,8,.05) 1px,transparent 1px);
}
html[data-theme="light"] nav.scrolled{ background:rgba(245,241,232,.78); border-bottom-color:var(--border); }
html[data-theme="light"] .nav-mark{ background:var(--bg); }
html[data-theme="light"] .nav-links a:hover{ background:rgba(10,9,8,.04); }
html[data-theme="light"] .nav-mobile{ background:rgba(245,241,232,.96); }
html[data-theme="light"] .hero-title .stroke{ -webkit-text-stroke-color:var(--text); }
html[data-theme="light"] .skill,
html[data-theme="light"] .service,
html[data-theme="light"] .case,
html[data-theme="light"] .tier,
html[data-theme="light"] .channel,
html[data-theme="light"] .post-card,
html[data-theme="light"] .post-row,
html[data-theme="light"] .img-card,
html[data-theme="light"] .stat,
html[data-theme="light"] .card,
html[data-theme="light"] .filter-bar,
html[data-theme="light"] .writer,
html[data-theme="light"] .i18n-group,
html[data-theme="light"] .gate-box{
  background:var(--surface);
}
html[data-theme="light"] .case-canvas{
  background:linear-gradient(135deg,#fff,#f5f1e8) !important;
  filter:saturate(.85) brightness(1.02);
}
html[data-theme="light"] .case-info{
  background:linear-gradient(180deg,transparent,rgba(255,253,247,.92));
  color:var(--text);
}
html[data-theme="light"] .case-info .case-name,
html[data-theme="light"] .case-info .case-sub{ color:var(--text); }
html[data-theme="light"] .field input,
html[data-theme="light"] .field textarea,
html[data-theme="light"] .field select,
html[data-theme="light"] .body-textarea,
html[data-theme="light"] .title-input,
html[data-theme="light"] .meta-cell input,
html[data-theme="light"] .meta-cell select,
html[data-theme="light"] .excerpt-cell textarea,
html[data-theme="light"] .input{
  background:rgba(255,253,247,.55);
  color:var(--text);
  border-color:var(--border);
}
html[data-theme="light"] .field input::placeholder,
html[data-theme="light"] .field textarea::placeholder,
html[data-theme="light"] .body-textarea::placeholder,
html[data-theme="light"] .title-input::placeholder{ color:var(--text-mute); }
html[data-theme="light"] .toast{ background:rgba(255,253,247,.92); color:var(--text); }
html[data-theme="light"] .gate{ background:rgba(245,241,232,.86); }
html[data-theme="light"] .topbar{ background:rgba(245,241,232,.78); }
html[data-theme="light"] .sidebar{ background:rgba(255,253,247,.4); }
html[data-theme="light"] .tab-btn:hover{ background:rgba(10,9,8,.04); }
html[data-theme="light"] .tab-btn.active{ background:linear-gradient(90deg,rgba(255,77,46,.10),transparent); }
html[data-theme="light"] .nav-cta{ color:#fff; }
html[data-theme="light"] .btn-ghost{ color:var(--text); }
html[data-theme="light"] .lang-toggle,
html[data-theme="light"] .theme-toggle,
html[data-theme="light"] .nav-burger{ color:var(--text); }
html[data-theme="light"] footer{ color:var(--text-mute); }
html[data-theme="light"] .case-arrow{ background:rgba(255,253,247,.6); color:var(--text); }
html[data-theme="light"] ::selection{ background:var(--accent); color:#fff; }

/* ===== Theme toggle button (auto-injected) ===== */
.theme-toggle{
  width:42px;height:38px;border-radius:10px;
  background:transparent;border:1px solid var(--border-strong);
  color:var(--text);font-family:var(--mono),monospace;font-size:14px;font-weight:600;
  cursor:pointer;transition:.25s cubic-bezier(.22,.61,.36,1);
  display:inline-flex;align-items:center;justify-content:center;
  padding:0;line-height:1;
}
.theme-toggle:hover{ border-color:var(--accent); color:var(--accent); }
@media(hover:none){ .theme-toggle{ cursor:auto; } }

/* Smooth color transitions */
body, nav, .topbar, .card, .stat, .service, .tier, .case, .channel,
.skill, .post-card, .post-row, .img-card, .writer, .i18n-group, .gate-box{
  transition: background-color .35s ease, border-color .35s ease, color .35s ease;
}

/* When an admin-uploaded image fills a slot, fade decorative SVGs */
.about-portrait.has-cms-img .portrait-svg{ display:none; }
.case .case-canvas.has-cms-img{ filter: saturate(.95) brightness(.95); }
.case .case-canvas.has-cms-img + .case-svg{ opacity:.18; mix-blend-mode:screen; }
html[data-theme="light"] .case .case-canvas.has-cms-img + .case-svg{
  mix-blend-mode:multiply; opacity:.22;
}
`;
    const style = document.createElement('style');
    style.id = 'flyun-theme-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ============== CONTENT (i18n overrides) ============== */
  function getContent()           { return safeRead(KEYS.content, { zh: {}, en: {} }); }
  function setContent(obj)        { safeWrite(KEYS.content, obj || { zh: {}, en: {} }); applyI18n(); pushContent(obj).catch(()=>{}); }
  function patchContent(lang, key, value) {
    const c = getContent(); if (!c[lang]) c[lang] = {};
    c[lang][key] = value; setContent(c);
  }
  function resetContent()         { localStorage.removeItem(KEYS.content); applyI18n(); }

  /* ============== POSTS ============== */
  function getPosts()             { return safeRead(KEYS.posts, []); }
  function setPosts(arr)          { safeWrite(KEYS.posts, arr || []); emit('flyun:postschange'); }
  function upsertPost(post) {
    const posts = getPosts();
    const id = post.id || ('p_' + Date.now());
    const now = Date.now();
    const idx = posts.findIndex(p => p.id === id);
    const next = { ...post, id, updatedAt: now, createdAt: posts[idx]?.createdAt || now };
    if (idx >= 0) posts[idx] = next; else posts.unshift(next);
    setPosts(posts);
    pushPost(next).catch(()=>{});
    return posts;
  }
  function deletePost(id) {
    setPosts(getPosts().filter(p => p.id !== id));
    deletePostRemote(id).catch(()=>{});
  }

  /* ============== CASES / LETTERS / JOBS ============== */
  function getCases()             { return safeRead(KEYS.cases, []); }
  function setCases(arr)          { safeWrite(KEYS.cases, arr || []); emit('flyun:caseschange'); }
  function upsertCase(c) {
    const list = getCases();
    const id = c.id || ('c_' + Date.now());
    const now = Date.now();
    const idx = list.findIndex(x => x.id === id);
    const next = { ...c, id, updatedAt: now, createdAt: list[idx]?.createdAt || now };
    if (idx >= 0) list[idx] = next; else list.unshift(next);
    setCases(list); pushCase(next).catch(()=>{});
    return list;
  }
  function deleteCase(id) {
    setCases(getCases().filter(c => c.id !== id));
    deleteCaseRemote(id).catch(()=>{});
  }

  function getLetters()           { return safeRead(KEYS.letters, []); }
  function setLetters(arr)        { safeWrite(KEYS.letters, arr || []); emit('flyun:letterschange'); }
  function upsertLetter(l) {
    const list = getLetters();
    const id = l.id || ('l_' + Date.now());
    const now = Date.now();
    const idx = list.findIndex(x => x.id === id);
    const next = { ...l, id, updatedAt: now, createdAt: list[idx]?.createdAt || now };
    if (idx >= 0) list[idx] = next; else list.unshift(next);
    setLetters(list); pushLetter(next).catch(()=>{});
    return list;
  }
  function deleteLetter(id) {
    setLetters(getLetters().filter(l => l.id !== id));
    deleteLetterRemote(id).catch(()=>{});
  }

  function getJobs()              { return safeRead(KEYS.jobs, []); }
  function setJobs(arr)           { safeWrite(KEYS.jobs, arr || []); emit('flyun:jobschange'); }
  function upsertJob(j) {
    const list = getJobs();
    const id = j.id || ('j_' + Date.now());
    const now = Date.now();
    const idx = list.findIndex(x => x.id === id);
    const next = { ...j, id, updatedAt: now, createdAt: list[idx]?.createdAt || now };
    if (idx >= 0) list[idx] = next; else list.unshift(next);
    setJobs(list); pushJob(next).catch(()=>{});
    return list;
  }
  function deleteJob(id) {
    setJobs(getJobs().filter(j => j.id !== id));
    deleteJobRemote(id).catch(()=>{});
  }

  /* ============== IMAGES ============== */
  function getImages()            { return safeRead(KEYS.images, {}); }
  function setImages(obj)         { safeWrite(KEYS.images, obj || {}); applyImageBindings(); emit('flyun:imageschange'); }
  function setImage(key, url) {
    const imgs = getImages(); imgs[key] = url; setImages(imgs);
    pushImage(key, url).catch(()=>{});
  }
  function removeImage(key) {
    const imgs = getImages(); delete imgs[key]; setImages(imgs);
    deleteImageRemote(key).catch(()=>{});
  }

  /* Apply <... data-cms-img="key">: <img> uses src, others use background-image */
  function applyImageBindings(root) {
    const scope = root || document;
    const imgs = getImages();
    scope.querySelectorAll('[data-cms-img]').forEach(el => {
      const k = el.getAttribute('data-cms-img');
      const url = imgs[k];
      if (!url) return;
      if (el.tagName === 'IMG') {
        el.src = url;
      } else {
        el.style.backgroundImage = `url('${url.replace(/'/g, "\\'")}')`;
        el.style.backgroundSize = el.style.backgroundSize || 'cover';
        el.style.backgroundPosition = el.style.backgroundPosition || 'center';
        el.classList.add('has-cms-img');
      }
    });
  }

  /* ============== AUTH (本地密码门) ============== */
  function isAuthed() { return localStorage.getItem(KEYS.auth) === '1'; }
  function login(pwd) {
    const stored = localStorage.getItem('flyun:admin:pwd') || 'flyun2026';
    if (pwd === stored) { localStorage.setItem(KEYS.auth, '1'); return true; }
    return false;
  }
  function logout() { localStorage.removeItem(KEYS.auth); }
  function changePassword(newPwd) {
    if (!newPwd) return false;
    localStorage.setItem('flyun:admin:pwd', newPwd);
    return true;
  }

  /* ============== EXPORT / IMPORT ============== */
  function exportAll() {
    return {
      version: 3,
      exportedAt: new Date().toISOString(),
      content:  getContent(),
      posts:    getPosts(),
      cases:    getCases(),
      letters:  getLetters(),
      jobs:     getJobs(),
      images:   getImages(),
      settings: safeRead(KEYS.settings, {})
    };
  }
  function importAll(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.content) setContent(data.content);
    if (Array.isArray(data.posts))   setPosts(data.posts);
    if (Array.isArray(data.cases))   setCases(data.cases);
    if (Array.isArray(data.letters)) setLetters(data.letters);
    if (Array.isArray(data.jobs))    setJobs(data.jobs);
    if (data.images && typeof data.images === 'object') setImages(data.images);
    if (data.settings) safeWrite(KEYS.settings, data.settings);
    return true;
  }

  /* =====================================================
   * SUPABASE CLOUD
   * ===================================================== */
  let _client = null;
  let _loadingClient = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }
  async function client() {
    if (_client) return _client;
    if (_loadingClient) return _loadingClient;
    _loadingClient = (async () => {
      if (!global.supabase || !global.supabase.createClient) {
        await loadScript(SUPABASE_UMD);
      }
      _client = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'flyun:sb:auth',
          flowType: 'pkce'
        }
      });
      // 监听 session 变化以更新 UI
      _client.auth.onAuthStateChange((evt, session) => {
        emit('flyun:cloudauth', { event: evt, session: !!session });
      });
      return _client;
    })();
    return _loadingClient;
  }

  /* ----- Cloud auth ----- */
  async function cloudSignIn(email, password) {
    const c = await client();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    emit('flyun:cloudauth', { event: 'SIGNED_IN', session: !!data.session });
    return data;
  }
  async function cloudSignOut() {
    const c = await client();
    await c.auth.signOut();
    emit('flyun:cloudauth', { event: 'SIGNED_OUT', session: false });
  }
  async function cloudSession() {
    try {
      const c = await client();
      const { data } = await c.auth.getSession();
      return data.session || null;
    } catch (e) { return null; }
  }

  /* ----- Posts <-> DB row mapping ----- */
  function postToRow(p) {
    return {
      id: p.id,
      title_zh:   p.title?.zh   || '',
      title_en:   p.title?.en   || '',
      excerpt_zh: p.excerpt?.zh || '',
      excerpt_en: p.excerpt?.en || '',
      body_zh:    p.body?.zh    || '',
      body_en:    p.body?.en    || '',
      tags:       Array.isArray(p.tags) ? p.tags : [],
      cover:      p.cover  || null,
      status:     p.status || 'published',
      date:       p.date || new Date().toISOString().slice(0,10)
    };
  }
  function rowToPost(r) {
    return {
      id: r.id,
      title:   { zh: r.title_zh   || '', en: r.title_en   || '' },
      excerpt: { zh: r.excerpt_zh || '', en: r.excerpt_en || '' },
      body:    { zh: r.body_zh    || '', en: r.body_en    || '' },
      tags:    r.tags || [],
      cover:   r.cover || '',
      status:  r.status || 'published',
      date:    r.date || '',
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now()
    };
  }

  function caseToRow(c) {
    return {
      id: c.id,
      title_zh:    c.title?.zh    || '',
      title_en:    c.title?.en    || '',
      subtitle_zh: c.subtitle?.zh || '',
      subtitle_en: c.subtitle?.en || '',
      category:    c.category || 'immersive',
      year:        c.year || '',
      cover:       c.cover || null,
      link:        c.link  || null,
      position:    typeof c.position === 'number' ? c.position : 0,
      status:      c.status || 'published',
      meta:        c.meta || {}
    };
  }
  function rowToCase(r) {
    return {
      id: r.id,
      title:    { zh: r.title_zh    || '', en: r.title_en    || '' },
      subtitle: { zh: r.subtitle_zh || '', en: r.subtitle_en || '' },
      category: r.category || 'immersive',
      year:     r.year || '',
      cover:    r.cover || '',
      link:     r.link  || '',
      position: r.position || 0,
      status:   r.status || 'published',
      meta:     r.meta || {},
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now()
    };
  }

  function letterToRow(l) {
    return {
      id: l.id,
      issue:      l.issue || '',
      title_zh:   l.title?.zh   || '',
      title_en:   l.title?.en   || '',
      excerpt_zh: l.excerpt?.zh || '',
      excerpt_en: l.excerpt?.en || '',
      body_zh:    l.body?.zh    || '',
      body_en:    l.body?.en    || '',
      cover:      l.cover  || null,
      status:     l.status || 'published',
      date:       l.date || new Date().toISOString().slice(0,10)
    };
  }
  function rowToLetter(r) {
    return {
      id: r.id,
      issue:    r.issue || '',
      title:    { zh: r.title_zh   || '', en: r.title_en   || '' },
      excerpt:  { zh: r.excerpt_zh || '', en: r.excerpt_en || '' },
      body:     { zh: r.body_zh    || '', en: r.body_en    || '' },
      cover:    r.cover || '',
      status:   r.status || 'published',
      date:     r.date || '',
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now()
    };
  }

  function jobToRow(j) {
    return {
      id: j.id,
      title_zh:       j.title?.zh       || '',
      title_en:       j.title?.en       || '',
      team:           j.team     || '',
      location:       j.location || '',
      type:           j.type     || 'full-time',
      description_zh: j.description?.zh || '',
      description_en: j.description?.en || '',
      status:         j.status || 'open'
    };
  }
  function rowToJob(r) {
    return {
      id: r.id,
      title:       { zh: r.title_zh       || '', en: r.title_en       || '' },
      description: { zh: r.description_zh || '', en: r.description_en || '' },
      team:     r.team || '',
      location: r.location || '',
      type:     r.type || 'full-time',
      status:   r.status || 'open',
      createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
      updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now()
    };
  }

  /* ----- Cloud pull (public read, no auth needed) ----- */
  async function pullPosts() {
    try {
      const c = await client();
      const session = await cloudSession();
      let q = c.from('posts').select('*').order('date', { ascending: false });
      if (!session) q = q.eq('status', 'published');
      const { data, error } = await q;
      if (error) throw error;
      const posts = (data || []).map(rowToPost);
      safeWrite(KEYS.posts, posts);
      emit('flyun:postschange');
      return posts;
    } catch (e) { console.warn('[flyun] pullPosts failed', e.message); return null; }
  }
  async function pullCases() {
    try {
      const c = await client();
      const session = await cloudSession();
      let q = c.from('cases').select('*').order('position', { ascending: true });
      if (!session) q = q.eq('status', 'published');
      const { data, error } = await q;
      if (error) throw error;
      const cases = (data || []).map(rowToCase);
      safeWrite(KEYS.cases, cases);
      emit('flyun:caseschange');
      return cases;
    } catch (e) { console.warn('[flyun] pullCases failed', e.message); return null; }
  }
  async function pullLetters() {
    try {
      const c = await client();
      const session = await cloudSession();
      let q = c.from('letters').select('*').order('date', { ascending: false });
      if (!session) q = q.eq('status', 'published');
      const { data, error } = await q;
      if (error) throw error;
      const list = (data || []).map(rowToLetter);
      safeWrite(KEYS.letters, list);
      emit('flyun:letterschange');
      return list;
    } catch (e) { console.warn('[flyun] pullLetters failed', e.message); return null; }
  }
  async function pullJobs() {
    try {
      const c = await client();
      const session = await cloudSession();
      let q = c.from('jobs').select('*');
      if (!session) q = q.eq('status', 'open');
      const { data, error } = await q;
      if (error) throw error;
      const list = (data || []).map(rowToJob);
      safeWrite(KEYS.jobs, list);
      emit('flyun:jobschange');
      return list;
    } catch (e) { console.warn('[flyun] pullJobs failed', e.message); return null; }
  }
  async function pullContent() {
    try {
      const c = await client();
      const { data, error } = await c.from('site_content').select('*');
      if (error) throw error;
      const obj = { zh: {}, en: {} };
      (data || []).forEach(r => {
        if (!obj[r.lang]) obj[r.lang] = {};
        obj[r.lang][r.key] = r.value;
      });
      safeWrite(KEYS.content, obj);
      applyI18n();
      return obj;
    } catch (e) { console.warn('[flyun] pullContent failed', e.message); return null; }
  }
  async function pullImages() {
    try {
      const c = await client();
      const { data, error } = await c.from('site_images').select('*');
      if (error) throw error;
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.url; });
      safeWrite(KEYS.images, obj);
      applyImageBindings();
      emit('flyun:imageschange');
      return obj;
    } catch (e) { console.warn('[flyun] pullImages failed', e.message); return null; }
  }
  async function pullSettings() {
    try {
      const c = await client();
      const { data, error } = await c.from('site_settings').select('*');
      if (error) throw error;
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.value; });
      safeWrite(KEYS.settings, obj);
      return obj;
    } catch (e) { console.warn('[flyun] pullSettings failed', e.message); return null; }
  }

  async function pullAll() {
    const tasks = [pullPosts(), pullCases(), pullLetters(), pullJobs(), pullContent(), pullImages(), pullSettings()];
    const results = await Promise.allSettled(tasks);
    return results.map(r => r.status);
  }

  /* ----- Cloud push (auth required) ----- */
  async function ensureAuthed() {
    const s = await cloudSession();
    if (!s) throw new Error('Not signed in to cloud');
    return s;
  }
  async function pushPost(post) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { data, error } = await c.from('posts').upsert(postToRow(post)).select().single();
    if (error) throw error;
    return data;
  }
  async function deletePostRemote(id) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('posts').delete().eq('id', id);
    if (error) throw error;
  }
  async function pushCase(item) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { data, error } = await c.from('cases').upsert(caseToRow(item)).select().single();
    if (error) throw error;
    return data;
  }
  async function deleteCaseRemote(id) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('cases').delete().eq('id', id);
    if (error) throw error;
  }
  async function pushLetter(item) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { data, error } = await c.from('letters').upsert(letterToRow(item)).select().single();
    if (error) throw error;
    return data;
  }
  async function deleteLetterRemote(id) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('letters').delete().eq('id', id);
    if (error) throw error;
  }
  async function pushJob(item) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { data, error } = await c.from('jobs').upsert(jobToRow(item)).select().single();
    if (error) throw error;
    return data;
  }
  async function deleteJobRemote(id) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('jobs').delete().eq('id', id);
    if (error) throw error;
  }
  async function pushImage(key, url) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('site_images').upsert({ key, url });
    if (error) throw error;
  }
  async function deleteImageRemote(key) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const { error } = await c.from('site_images').delete().eq('key', key);
    if (error) throw error;
  }
  async function pushContent(content) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const data = content || getContent();
    const rows = [];
    ['zh','en'].forEach(lang => {
      Object.keys(data[lang] || {}).forEach(key => {
        const v = data[lang][key];
        if (v != null && v !== '') rows.push({ lang, key, value: v });
      });
    });
    // Wipe entries not in current overrides, then upsert
    const { data: existing } = await c.from('site_content').select('lang,key');
    const wantedKeys = new Set(rows.map(r => r.lang + '|' + r.key));
    const toDelete = (existing || []).filter(r => !wantedKeys.has(r.lang + '|' + r.key));
    if (toDelete.length) {
      // delete each (small set, fine to loop)
      for (const r of toDelete) {
        await c.from('site_content').delete().eq('lang', r.lang).eq('key', r.key);
      }
    }
    if (rows.length) {
      const { error } = await c.from('site_content').upsert(rows);
      if (error) throw error;
    }
  }
  async function pushSettings(settings) {
    const s = await cloudSession(); if (!s) return null;
    const c = await client();
    const data = settings || safeRead(KEYS.settings, {});
    const rows = Object.keys(data).map(key => ({ key, value: data[key] }));
    if (!rows.length) return;
    const { error } = await c.from('site_settings').upsert(rows);
    if (error) throw error;
  }

  /* ============== AUTO INIT ============== */
  function injectLangToggle() {
    document.querySelectorAll('[data-lang-mount]').forEach(host => {
      // 语言切换
      if (!host.querySelector('[data-lang-toggle]')) {
        const langBtn = document.createElement('button');
        langBtn.setAttribute('data-lang-toggle', '');
        langBtn.className = 'lang-toggle';
        langBtn.type = 'button';
        langBtn.textContent = t('lang.toggle');
        host.insertBefore(langBtn, host.firstChild);
      }
      // 主题切换
      if (!host.querySelector('[data-theme-toggle]')) {
        const themeBtn = document.createElement('button');
        themeBtn.setAttribute('data-theme-toggle', '');
        themeBtn.className = 'theme-toggle';
        themeBtn.type = 'button';
        host.insertBefore(themeBtn, host.firstChild);
      }
    });

    // 兜底：对于使用了独立 [data-lang-toggle] 而没有 [data-lang-mount] 的页面，
    // 在它前面注入一个主题切换按钮，保证全站统一。
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      const parent = btn.parentElement;
      if (!parent) return;
      if (parent.querySelector('[data-theme-toggle]')) return;
      if (parent.hasAttribute('data-lang-mount')) return; // 已被上面处理
      const themeBtn = document.createElement('button');
      themeBtn.setAttribute('data-theme-toggle', '');
      // 复用原按钮的 class，让外观与上下文一致
      themeBtn.className = btn.className || 'theme-toggle';
      themeBtn.type = 'button';
      themeBtn.style.cursor = 'pointer';
      parent.insertBefore(themeBtn, btn);
    });

    // 绑定事件
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      if (btn.__flyunBound) return; btn.__flyunBound = true;
      btn.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      if (btn.__flyunThemeBound) return; btn.__flyunThemeBound = true;
      btn.addEventListener('click', toggleTheme);
    });
  }

  function installStealthGate() {
    if (window.__flyunStealthInstalled) return;
    window.__flyunStealthInstalled = true;
    const here = (location.pathname || '').toLowerCase();
    if (here.endsWith('/admin.html') || here.endsWith('admin.html')) return;

    if (location.hash === '#studio' || location.hash === '#admin') {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      location.href = 'admin.html';
      return;
    }
    document.addEventListener('keydown', e => {
      const key = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && e.altKey && key === 'a') {
        e.preventDefault();
        location.href = 'admin.html';
      }
    });
    let buf = '';
    let bufTimer = null;
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const ae = document.activeElement;
      if (ae && /^(input|textarea|select)$/i.test(ae.tagName)) return;
      const k = (e.key || '');
      if (k.length !== 1) return;
      buf += k.toLowerCase();
      if (buf.length > 5) buf = buf.slice(-5);
      clearTimeout(bufTimer);
      bufTimer = setTimeout(() => { buf = ''; }, 1500);
      if (buf === 'flyun') { buf = ''; location.href = 'admin.html'; }
    });
  }

  function ready() {
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'zh-CN';
    injectThemeStyles();
    applyTheme();
    injectLangToggle();
    applyI18n();
    applyImageBindings();
    installStealthGate();

    // 公共页面：异步从云端拉取，让所有访客都能看到
    // 但 admin 页：只有在已登录云端时才拉取，避免空云端把本地草稿清掉
    const _here = (location.pathname || '').toLowerCase();
    const _isAdmin = _here.endsWith('/admin.html') || _here.endsWith('admin.html');
    if (_isAdmin) {
      cloudSession().then(session => {
        if (!session) return; // 本地优先，等用户在「系统」页登录云端后再 pull
        pullAll().then(() => { applyI18n(); applyImageBindings(); });
      });
    } else {
      pullAll().then(() => {
        applyI18n();
        applyImageBindings();
      });
    }

    // 跨标签页同步
    window.addEventListener('storage', e => {
      if (!e.key) return;
      if (e.key === KEYS.lang || e.key === KEYS.content) applyI18n();
      if (e.key === KEYS.theme) applyTheme();
      if (e.key === KEYS.images) { applyImageBindings(); emit('flyun:imageschange'); }
      if (e.key === KEYS.posts) emit('flyun:postschange');
      if (e.key === KEYS.cases) emit('flyun:caseschange');
      if (e.key === KEYS.letters) emit('flyun:letterschange');
      if (e.key === KEYS.jobs) emit('flyun:jobschange');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  /* ============== PUBLIC API ============== */
  global.FlyunCMS = {
    KEYS,
    DICT: DEFAULT_DICT,
    /* i18n */
    t, applyI18n, getLang, setLang,
    /* theme */
    getTheme, setTheme, toggleTheme,
    /* content */
    getContent, setContent, patchContent, resetContent,
    /* posts */
    getPosts, setPosts, upsertPost, deletePost,
    /* cases / letters / jobs */
    getCases, setCases, upsertCase, deleteCase,
    getLetters, setLetters, upsertLetter, deleteLetter,
    getJobs, setJobs, upsertJob, deleteJob,
    /* images */
    getImages, setImages, setImage, removeImage, applyImageBindings,
    /* auth (local) */
    isAuthed, login, logout, changePassword,
    /* import / export */
    exportAll, importAll,
    /* cloud */
    cloud: {
      url: SUPABASE_URL,
      client,
      signIn:  cloudSignIn,
      signOut: cloudSignOut,
      session: cloudSession,
      pullAll, pullPosts, pullCases, pullLetters, pullJobs, pullContent, pullImages, pullSettings,
      pushPost, pushCase, pushLetter, pushJob, pushImage, pushContent, pushSettings,
      deletePost: deletePostRemote,
      deleteCase: deleteCaseRemote,
      deleteLetter: deleteLetterRemote,
      deleteJob: deleteJobRemote,
      deleteImage: deleteImageRemote
    }
  };
})(window);
