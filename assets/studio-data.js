(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://neppacfsixrjzpkvcgxy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  const KEYS = {
    projects: 'flyun:cases:v1',
    profile: 'flyun:portfolio:profile:v1',
    access: 'flyun:studio:access',
    theme: 'flyun:portfolio:theme',
    lang: 'flyun:lang'
  };

  const DEFAULT_PROFILE = {
    nameZh: '许云飞',
    nameEn: 'Leo Xu',
    roleZh: '交互设计师 · AI 产品实践者',
    roleEn: 'Interaction Designer · AI Product Builder',
    introZh: '我在 AI、产品、Unity 与虚拟空间之间工作，把复杂系统变成可理解、可进入、可持续迭代的体验。',
    introEn: 'I work across AI, product, Unity and spatial experiences—turning complex systems into interfaces people can understand, enter and evolve.',
    location: 'Wuhan / Beijing · China',
    email: 'hello@flyun.studio',
    availabilityZh: '开放 AI 产品、交互设计与 XR 方向合作',
    availabilityEn: 'Open to AI product, interaction and XR collaborations',
    resumeUrl: '',
    githubUrl: 'https://github.com/LEOFEIo'
  };

  const DEFAULT_PROJECTS = [
    {
      id: 'jhun-virtual-museum',
      title_zh: '江汉大学虚拟校史馆',
      title_en: 'JHUN Virtual History Museum',
      subtitle_zh: '基于用户体验的虚拟空间交互设计，将校史叙事、数字人导览与沉浸式展陈组织成可探索的空间系统。',
      subtitle_en: 'A user-centered virtual museum combining institutional storytelling, guided interaction and immersive exhibition design.',
      category: 'XR / Spatial UX',
      year: '2026',
      cover: '',
      link: '#',
      position: 0,
      status: 'published',
      meta: {
        featured: true,
        role: 'UX Research · Spatial Design · Unity',
        tools: ['Unity', 'Figma', 'Blender', 'User Research'],
        accent: 'cobalt',
        index: '01'
      }
    },
    {
      id: 'ai-career-os',
      title_zh: 'AI Career OS',
      title_en: 'AI Career OS',
      subtitle_zh: '面向职业成长与招聘协作的 AI 产品实验，覆盖岗位理解、人才匹配、简历优化和 Agent 工作流。',
      subtitle_en: 'An AI product experiment for career growth and recruiting workflows, from role intelligence to talent matching.',
      category: 'AI Product',
      year: '2026',
      cover: '',
      link: '#',
      position: 1,
      status: 'published',
      meta: {
        featured: true,
        role: 'Product Strategy · UX · Vibe Coding',
        tools: ['AI Agent', 'Product Design', 'Data', 'Prototype'],
        accent: 'lime',
        index: '02'
      }
    },
    {
      id: 'flyun-talent-mapping',
      title_zh: '飞云人才地图',
      title_en: 'FLYUN Talent Mapping',
      subtitle_zh: '将候选人、岗位、公司与技术方向连接成可视化情报系统，服务高端人才寻访与招聘决策。',
      subtitle_en: 'A visual intelligence system connecting candidates, roles, companies and technology domains for executive search.',
      category: 'Talent Intelligence',
      year: '2026',
      cover: '',
      link: '#',
      position: 2,
      status: 'published',
      meta: {
        featured: false,
        role: 'Product · Data Visualization · Recruiting',
        tools: ['Talent Mapping', 'Dashboard', 'AI Search'],
        accent: 'orange',
        index: '03'
      }
    },
    {
      id: 'unity-ar-demo',
      title_zh: 'Unity AR 交互实验',
      title_en: 'Unity AR Interaction Demo',
      subtitle_zh: '围绕图像识别、空间触发、视频引导与交互反馈搭建的 AR 场景原型。',
      subtitle_en: 'An AR prototype built around image tracking, spatial triggers, guided video and responsive interactions.',
      category: 'Unity / AR',
      year: '2025',
      cover: '',
      link: '#',
      position: 3,
      status: 'published',
      meta: {
        featured: false,
        role: 'Unity Development · Interaction',
        tools: ['Unity', 'C#', 'AR', 'Raycast'],
        accent: 'violet',
        index: '04'
      }
    },
    {
      id: 'paper-reader-lab',
      title_zh: 'Paper Reader Lab Pro',
      title_en: 'Paper Reader Lab Pro',
      subtitle_zh: '面向论文阅读、知识提取、引用识别与研究笔记生成的 AI 学术工作台。',
      subtitle_en: 'An AI research workspace for paper reading, knowledge extraction, citation analysis and structured notes.',
      category: 'AI Tool',
      year: '2026',
      cover: '',
      link: '#',
      position: 4,
      status: 'published',
      meta: {
        featured: false,
        role: 'Product Design · Front-end Prototype',
        tools: ['Document AI', 'Knowledge Graph', 'UX'],
        accent: 'cyan',
        index: '05'
      }
    },
    {
      id: 'flyun-studio-system',
      title_zh: 'FLYUN Studio 网站系统',
      title_en: 'FLYUN Studio Web System',
      subtitle_zh: '一套可由后台持续维护的个人作品系统，融合编辑型视觉、动态作品墙与云端内容管理。',
      subtitle_en: 'A maintainable portfolio system combining editorial visuals, dynamic project presentation and cloud content management.',
      category: 'Web / System',
      year: '2026',
      cover: '',
      link: '#',
      position: 5,
      status: 'published',
      meta: {
        featured: false,
        role: 'Creative Direction · Front-end · CMS',
        tools: ['HTML', 'CSS', 'JavaScript', 'Supabase'],
        accent: 'rose',
        index: '06'
      }
    }
  ];

  let clientPromise = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeRead(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('[FLYUN] Unable to read local data.', error);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('[FLYUN] Unable to save local data.', error);
      return false;
    }
  }

  function slugify(input) {
    const base = String(input || 'project')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${base || 'project'}-${Date.now().toString(36)}`;
  }

  function normalizeMeta(meta) {
    const value = meta && typeof meta === 'object' ? meta : {};
    return {
      featured: Boolean(value.featured),
      role: String(value.role || ''),
      tools: Array.isArray(value.tools)
        ? value.tools.filter(Boolean).map(String)
        : String(value.tools || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
      accent: String(value.accent || 'lime'),
      index: String(value.index || ''),
      ...value
    };
  }

  function normalizeProject(project, index = 0) {
    const item = project && typeof project === 'object' ? project : {};
    const titleZh = item.title_zh || item.title || item.titleZh || '未命名项目';
    const titleEn = item.title_en || item.titleEn || titleZh;
    const subtitleZh = item.subtitle_zh || item.summary || item.subtitleZh || '';
    const subtitleEn = item.subtitle_en || item.subtitleEn || subtitleZh;
    return {
      id: String(item.id || slugify(titleEn || titleZh)),
      title_zh: String(titleZh),
      title_en: String(titleEn),
      subtitle_zh: String(subtitleZh),
      subtitle_en: String(subtitleEn),
      category: String(item.category || 'Selected Work'),
      year: String(item.year || new Date().getFullYear()),
      cover: String(item.cover || item.cover_url || ''),
      link: String(item.link || '#'),
      position: Number.isFinite(Number(item.position)) ? Number(item.position) : index,
      status: item.status === 'draft' ? 'draft' : 'published',
      meta: normalizeMeta(item.meta || {
        featured: item.featured,
        role: item.role,
        tools: item.tech || item.tags,
        accent: item.accent
      })
    };
  }

  function sortProjects(items) {
    return items
      .map(normalizeProject)
      .sort((a, b) => a.position - b.position || a.year.localeCompare(b.year) * -1);
  }

  function readProjects() {
    const stored = safeRead(KEYS.projects, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      const seeded = clone(DEFAULT_PROJECTS);
      safeWrite(KEYS.projects, seeded);
      return seeded;
    }
    return sortProjects(stored);
  }

  function writeProjects(items) {
    const normalized = sortProjects(items).map((item, index) => ({ ...item, position: index }));
    safeWrite(KEYS.projects, normalized);
    document.dispatchEvent(new CustomEvent('flyun:projects-changed', { detail: { projects: normalized } }));
    return normalized;
  }

  function readProfile() {
    return { ...DEFAULT_PROFILE, ...safeRead(KEYS.profile, {}) };
  }

  function writeProfile(profile) {
    const next = { ...DEFAULT_PROFILE, ...(profile || {}) };
    safeWrite(KEYS.profile, next);
    document.dispatchEvent(new CustomEvent('flyun:profile-changed', { detail: { profile: next } }));
    return next;
  }

  function ensureSupabase() {
    if (global.supabase && typeof global.supabase.createClient === 'function') {
      return Promise.resolve(global.supabase);
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-flyun-supabase]');
      if (existing) {
        existing.addEventListener('load', () => resolve(global.supabase), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = SUPABASE_CDN;
      script.async = true;
      script.dataset.flyunSupabase = 'true';
      script.onload = () => resolve(global.supabase);
      script.onerror = () => reject(new Error('Supabase SDK failed to load.'));
      document.head.appendChild(script);
    });
  }

  async function getClient() {
    if (!clientPromise) {
      clientPromise = ensureSupabase().then((sdk) => {
        if (!sdk || typeof sdk.createClient !== 'function') {
          throw new Error('Supabase SDK is unavailable.');
        }
        return sdk.createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
      });
    }
    return clientPromise;
  }

  async function getSession() {
    try {
      const client = await getClient();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session || null;
    } catch (error) {
      return null;
    }
  }

  async function signIn(email, password) {
    const client = await getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session || null;
  }

  async function signOut() {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function pullProjects(options = {}) {
    const includeDraft = Boolean(options.includeDraft);
    const client = await getClient();
    let query = client.from('cases').select('*').order('position', { ascending: true });
    if (!includeDraft) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;
    const normalized = sortProjects(Array.isArray(data) ? data : []);
    if (normalized.length) writeProjects(normalized);
    return normalized;
  }

  async function listProjects(options = {}) {
    const includeDraft = Boolean(options.includeDraft);
    const preferCloud = options.preferCloud !== false;
    let projects = readProjects();

    if (preferCloud && navigator.onLine) {
      try {
        const cloud = await pullProjects({ includeDraft });
        if (cloud.length) projects = cloud;
      } catch (error) {
        console.info('[FLYUN] Cloud projects unavailable; using local cache.', error.message);
      }
    }

    return sortProjects(projects).filter((item) => includeDraft || item.status === 'published');
  }

  async function saveProject(project, options = {}) {
    const current = readProjects();
    const normalized = normalizeProject(project, current.length);
    const index = current.findIndex((item) => item.id === normalized.id);
    if (index >= 0) current[index] = normalized;
    else current.push(normalized);
    writeProjects(current);

    if (options.cloud !== false) {
      const session = await getSession();
      if (session) {
        const client = await getClient();
        const { error } = await client.from('cases').upsert(normalized, { onConflict: 'id' });
        if (error) throw error;
      }
    }
    return normalized;
  }

  async function removeProject(id, options = {}) {
    writeProjects(readProjects().filter((item) => item.id !== id));
    if (options.cloud !== false) {
      const session = await getSession();
      if (session) {
        const client = await getClient();
        const { error } = await client.from('cases').delete().eq('id', id);
        if (error) throw error;
      }
    }
  }

  async function replaceProjects(items, options = {}) {
    const normalized = writeProjects(items);
    if (options.cloud !== false) {
      const session = await getSession();
      if (session) {
        const client = await getClient();
        const { error } = await client.from('cases').upsert(normalized, { onConflict: 'id' });
        if (error) throw error;
      }
    }
    return normalized;
  }

  async function pullProfile() {
    const client = await getClient();
    const { data, error } = await client
      .from('site_settings')
      .select('value')
      .eq('key', 'portfolio_profile')
      .maybeSingle();
    if (error) throw error;
    if (data && data.value) return writeProfile(data.value);
    return readProfile();
  }

  async function saveProfile(profile, options = {}) {
    const next = writeProfile(profile);
    if (options.cloud !== false) {
      const session = await getSession();
      if (session) {
        const client = await getClient();
        const { error } = await client
          .from('site_settings')
          .upsert({ key: 'portfolio_profile', value: next }, { onConflict: 'key' });
        if (error) throw error;
      }
    }
    return next;
  }

  function exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: readProfile(),
      projects: readProjects()
    };
  }

  function importData(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid backup file.');
    if (payload.profile) writeProfile(payload.profile);
    if (Array.isArray(payload.projects)) writeProjects(payload.projects);
    return exportData();
  }

  global.FlyunStudioStore = {
    KEYS,
    defaults: {
      projects: clone(DEFAULT_PROJECTS),
      profile: clone(DEFAULT_PROFILE)
    },
    slugify,
    normalizeProject,
    listProjects,
    readProjects,
    replaceProjects,
    saveProject,
    removeProject,
    pullProjects,
    readProfile,
    saveProfile,
    pullProfile,
    getSession,
    signIn,
    signOut,
    exportData,
    importData
  };
})(window);
