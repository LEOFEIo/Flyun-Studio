/* ==========================================================
 * FLYUN CMS · 飞云内容管理 + 多语言核心
 * 数据来源:  Supabase (在线，所有访客可见)
 * 兜底缓存:  localStorage (离线 / 数据库未就绪时)
 * ========================================================== */
(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    content: 'flyun:content:v1',     // i18n overrides cache
    posts: 'flyun:posts:v1',         // posts cache
    images: 'flyun:images:v1',       // images cache
    settings: 'flyun:settings:v1',   // site settings cache
    lang: 'flyun:lang',
    auth: 'flyun:admin:auth'         // legacy passphrase flag (compat)
  };

  /* ===== 默认中英文字典（页面共用键名） ===== */
  const DEFAULT_DICT = {
    zh: {
      'nav.about': '关于',
      'nav.services': '业务',
      'nav.xr': 'VR · AR',
      'nav.talent': '猎头',
      'nav.cases': '案例',
      'nav.lab': '实验室',
      'nav.letter': 'Letter',
      'nav.blog': '博客',
      'nav.pricing': '合作',
      'nav.cta': '建立合作',
      'nav.admin': '后台',

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

      'lang.toggle': 'EN'
    },
    en: {
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.xr': 'VR · AR',
      'nav.talent': 'Talent',
      'nav.cases': 'Cases',
      'nav.lab': 'Lab',
      'nav.letter': 'Letter',
      'nav.blog': 'Blog',
      'nav.pricing': 'Engage',
      'nav.cta': 'Start a project',
      'nav.admin': 'Admin',

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

      'lang.toggle': '中'
    }
  };

  /* ============== STORAGE ============== */
  function safeRead(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function safeWrite(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* ============== I18N ============== */
  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEYS.lang);
    if (stored === 'zh' || stored === 'en') return stored;
    return (navigator.language || 'zh').toLowerCase().startsWith('en') ? 'en' : 'zh';
  }
  function setLang(lang) {
    localStorage.setItem(STORAGE_KEYS.lang, lang);
    applyI18n();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.dispatchEvent(new CustomEvent('flyun:langchange', { detail: { lang } }));
  }
  function t(key, lang) {
    const L = lang || getLang();
    const dict = DEFAULT_DICT[L] || DEFAULT_DICT.zh;
    const overrides = safeRead(STORAGE_KEYS.content, {});
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
      const attrs = el.getAttribute('data-i18n-attr').split(',');
      attrs.forEach(p => {
        const [a, k] = p.split(':').map(s => s.trim());
        if (a && k) el.setAttribute(a, t(k, lang));
      });
    });
    scope.querySelectorAll('[data-lang-toggle]').forEach(el => {
      el.textContent = t('lang.toggle', lang);
    });
  }

  /* ============== CONTENT (admin overrides, sync to Supabase) ============== */
  function getContent() {
    return safeRead(STORAGE_KEYS.content, { zh: {}, en: {} });
  }
  function setContent(obj) {
    safeWrite(STORAGE_KEYS.content, obj);
    applyI18n();
  }
  function patchContent(lang, key, value) {
    const c = getContent();
    if (!c[lang]) c[lang] = {};
    c[lang][key] = value;
    setContent(c);
  }
  function resetContent() {
    localStorage.removeItem(STORAGE_KEYS.content);
    applyI18n();
  }

  /* ============== POSTS (admin local cache) ============== */
  function getPosts() {
    return safeRead(STORAGE_KEYS.posts, []);
  }
  function setPosts(arr) {
    safeWrite(STORAGE_KEYS.posts, arr);
  }
  function upsertPost(post) {
    const posts = getPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) posts[idx] = { ...posts[idx], ...post, updatedAt: Date.now() };
    else posts.unshift({ ...post, id: post.id || ('p_' + Date.now()), createdAt: Date.now(), updatedAt: Date.now() });
    setPosts(posts);
    return posts;
  }
  function deletePost(id) {
    setPosts(getPosts().filter(p => p.id !== id));
  }

  /* ============== IMAGES (cache) ============== */
  function getImages() {
    const v = safeRead(STORAGE_KEYS.images, {});
    // 兼容旧格式（直接 URL 字符串）和新格式（{url,label}）
    const out = {};
    Object.keys(v).forEach(k => {
      out[k] = typeof v[k] === 'string' ? { url: v[k], label: '' } : v[k];
    });
    return out;
  }
  function setImages(obj) {
    safeWrite(STORAGE_KEYS.images, obj);
    applyImages();
  }
  function imageUrl(key) {
    const imgs = getImages();
    return imgs[key]?.url || '';
  }
  function applyImages(root) {
    const scope = root || document;
    const imgs = getImages();
    // <img data-img="key">
    scope.querySelectorAll('img[data-img]').forEach(el => {
      const k = el.getAttribute('data-img');
      const url = imgs[k]?.url;
      if (url) el.src = url;
    });
    // background style: <div data-img-bg="key">
    scope.querySelectorAll('[data-img-bg]').forEach(el => {
      const k = el.getAttribute('data-img-bg');
      const url = imgs[k]?.url;
      if (url) el.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
    });
  }

  /* ============== SETTINGS ============== */
  function getSettings() {
    return safeRead(STORAGE_KEYS.settings, {});
  }
  function setSettings(obj) {
    safeWrite(STORAGE_KEYS.settings, obj);
  }

  /* ============== AUTH (legacy 通行证 / Supabase) ============== */
  function isAuthed() {
    if (window.FlyunSupabase && FlyunSupabase.getUser && FlyunSupabase.getUser()) return true;
    return localStorage.getItem(STORAGE_KEYS.auth) === '1';
  }
  function login(pwd) {
    const stored = localStorage.getItem('flyun:admin:pwd') || 'flyun2026';
    if (pwd === stored) {
      localStorage.setItem(STORAGE_KEYS.auth, '1');
      return true;
    }
    return false;
  }
  function logout() {
    localStorage.removeItem(STORAGE_KEYS.auth);
    if (window.FlyunSupabase && FlyunSupabase.signOut) {
      try { FlyunSupabase.signOut(); } catch (e) {}
    }
  }
  function changePassword(newPwd) {
    if (!newPwd) return false;
    localStorage.setItem('flyun:admin:pwd', newPwd);
    return true;
  }

  /* ============== EXPORT / IMPORT ============== */
  function exportAll() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      content: getContent(),
      posts: getPosts(),
      images: getImages(),
      settings: getSettings()
    };
  }
  function importAll(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.content) setContent(data.content);
    if (Array.isArray(data.posts)) setPosts(data.posts);
    if (data.images) setImages(data.images);
    if (data.settings) setSettings(data.settings);
    return true;
  }

  /* ============== SUPABASE BOOTSTRAP ============== */
  /* 从 Supabase 拉取最新内容并写入本地缓存，所有访客在第一次加载页面时拿到的都是数据库里的最新版本。 */
  async function bootstrapFromSupabase() {
    if (!window.FlyunSupabase) return false;
    try {
      await FlyunSupabase.ready();
      const [content, posts, images, settings] = await Promise.all([
        FlyunSupabase.listContent().catch(() => null),
        FlyunSupabase.listPosts({ includeDrafts: false }).catch(() => null),
        FlyunSupabase.listImages().catch(() => null),
        FlyunSupabase.listSettings().catch(() => null)
      ]);
      if (content) setContent(content);
      if (posts) setPosts(posts);
      if (images) setImages(images);
      if (settings) setSettings(settings);
      document.dispatchEvent(new CustomEvent('flyun:cms-synced', { detail: { posts, content, images, settings } }));
      return true;
    } catch (e) {
      console.warn('[FlyunCMS] Supabase 同步失败，使用本地缓存：', e);
      return false;
    }
  }

  /* ============== AUTO INIT ============== */
  function injectLangToggle() {
    document.querySelectorAll('[data-lang-mount]').forEach(host => {
      if (host.querySelector('[data-lang-toggle]')) return;
      const btn = document.createElement('button');
      btn.setAttribute('data-lang-toggle', '');
      btn.className = 'lang-toggle';
      btn.type = 'button';
      btn.textContent = t('lang.toggle');
      host.appendChild(btn);
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      if (btn.__flyunBound) return;
      btn.__flyunBound = true;
      btn.addEventListener('click', () => {
        setLang(getLang() === 'zh' ? 'en' : 'zh');
      });
    });
  }

  function init() {
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'zh-CN';
    const onReady = () => {
      injectLangToggle();
      applyI18n();
      applyImages();
      installStealthGate();
      // 异步拉取最新数据并刷新视图
      bootstrapFromSupabase().then((ok) => {
        if (ok) {
          applyI18n();
          applyImages();
          document.dispatchEvent(new Event('flyun:postschange'));
        }
      });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
    // 跨标签页同步
    window.addEventListener('storage', e => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.lang || e.key === STORAGE_KEYS.content) applyI18n();
      if (e.key === STORAGE_KEYS.images) applyImages();
      if (e.key === STORAGE_KEYS.posts) document.dispatchEvent(new Event('flyun:postschange'));
    });
  }

  /* ============== STEALTH ADMIN GATE ===============
   * 公开页面不暴露任何后台入口。主理人可用以下方式进入：
   *   1) Ctrl/Cmd + Alt + A
   *   2) 连续输入 "flyun"（1.5秒内）
   *   3) URL hash: #studio  或 #admin */
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
      if (buf === 'flyun') {
        buf = '';
        location.href = 'admin.html';
      }
    });
  }

  const FlyunCMS = {
    KEYS: STORAGE_KEYS,
    DICT: DEFAULT_DICT,
    t, applyI18n, applyImages,
    getLang, setLang,
    getContent, setContent, patchContent, resetContent,
    getPosts, setPosts, upsertPost, deletePost,
    getImages, setImages, imageUrl,
    getSettings, setSettings,
    isAuthed, login, logout, changePassword,
    exportAll, importAll,
    bootstrapFromSupabase
  };

  global.FlyunCMS = FlyunCMS;
  init();
})(window);
