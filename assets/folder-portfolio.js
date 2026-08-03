(function () {
  'use strict';

  const store = window.FlyunStudioStore;
  if (!store) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const state = {
    lang: localStorage.getItem('flyun:lang') === 'en' ? 'en' : 'zh',
    theme: localStorage.getItem('flyun:portfolio:theme') === 'light' ? 'light' : 'dark',
    projects: store.readProjects().filter((item) => item.status === 'published'),
    profile: store.readProfile(),
    activeCollection: null,
    activeIndex: 0
  };

  const staticCollections = {
    practice: {
      title: 'Practice',
      titleZh: '实践',
      label: 'METHOD / TOOLS',
      items: [
        { title: 'AI Product', titleZh: 'AI 产品与 Agent', category: 'METHOD', body: '把业务问题拆成可验证的产品假设，再用原型、数据和真实反馈不断缩小不确定性。', bodyEn: 'Turning business problems into testable product hypotheses, then shrinking uncertainty with prototypes, data and real feedback.', role: 'Product strategy · UX · Agent workflow', tags: ['AI Product', 'Agent', 'Vibe Coding'] },
        { title: 'Spatial UX', titleZh: '空间交互', category: 'METHOD', body: '让空间不只被观看，也能够被理解、探索和回应。', bodyEn: 'Making space something people can understand, explore and interact with—not only look at.', role: 'Interaction · Unity · XR', tags: ['Unity', 'XR', 'Spatial UX'] },
        { title: 'Data Stories', titleZh: '数据叙事', category: 'METHOD', body: '用信息架构、可视化和节奏，把复杂的关系变成清晰的判断。', bodyEn: 'Using information architecture, visualization and rhythm to turn complex relationships into clear decisions.', role: 'Information design · Systems', tags: ['Data', 'Dashboard', 'Storytelling'] },
        { title: 'Build Small', titleZh: '先做一个能跑的版本', category: 'PRINCIPLE', body: '设计不是停在文件里的图。能跑、能测、能被使用，才是下一轮判断的开始。', bodyEn: 'Design should not stop as a file. A running, testable, usable prototype is where the next decision begins.', role: 'Prototype · Front-end · Iteration', tags: ['HTML', 'CSS', 'JavaScript'] }
      ]
    },
    notes: {
      title: 'Notes',
      titleZh: '笔记',
      label: 'RESEARCH / WRITING',
      items: [
        { title: 'Virtual Space & UX', titleZh: '虚拟空间交互设计', category: 'THESIS / 2026', body: '硕士论文：基于用户体验下的虚拟空间交互设计——以江汉大学校史馆为例。', bodyEn: 'Master thesis: user-experience-led interaction design for virtual space, using the JHUN history museum as a case study.', role: 'Research · UX · Virtual museum', tags: ['Research', 'Museum', 'UX'] },
        { title: 'AI as a Design Partner', titleZh: 'AI 作为设计伙伴', category: 'ESSAY / 2026', body: 'AI 不只是生成工具，也可以成为研究、拆解、推演和验证过程中的协作者。', bodyEn: 'AI is not only a generation tool. It can collaborate in research, decomposition, exploration and validation.', role: 'AIGC · Design process', tags: ['AIGC', 'Design', 'Workflow'] },
        { title: 'The Work Between', titleZh: '发生在中间的工作', category: 'NOTE / ONGOING', body: '视觉设计、产品思维、工程实现与招聘情报之间，存在一片很有意思的中间地带。', bodyEn: 'There is an interesting middle ground between visual design, product thinking, engineering and talent intelligence.', role: 'Reflection · Career · Systems', tags: ['Notes', 'Career', 'Systems'] }
      ]
    },
    elsewhere: {
      title: 'Elsewhere',
      titleZh: '其他入口',
      label: 'LINKS / NEXT',
      items: [
        { title: 'GitHub', titleZh: 'GitHub', category: 'CODE / OPEN SOURCE', body: '网站、实验、数据工具和一些还在生长中的代码。', bodyEn: 'Websites, experiments, data tools and code that is still growing.', role: 'LEOFEIo', tags: ['github.com/LEOFEIo'], link: 'https://github.com/LEOFEIo' },
        { title: 'Studio Admin', titleZh: '作品后台', category: 'CMS / PRIVATE', body: '管理首页的作品、简介、双语内容和项目排序。', bodyEn: 'Manage projects, profile content, bilingual copy and ordering from the studio CMS.', role: 'Portfolio CMS', tags: ['Content', 'Supabase'], link: 'admin.html' },
        { title: 'Say hello', titleZh: '聊聊下一步', category: 'CONTACT / OPEN', body: '如果你也在做 AI 产品、空间体验、人才科技或其他有生命力的事情，欢迎联系。', bodyEn: 'If you are building something alive in AI products, spatial experiences, talent tech or beyond, say hello.', role: 'Open to a good conversation', tags: ['Email', 'Collaboration'] }
      ]
    }
  };

  const accentPalette = [
    ['#17361f', '#c5ff4a'], ['#14294d', '#bcd0ff'], ['#3c2f0f', '#f6d776'], ['#431d2a', '#ffb8c3'], ['#30204e', '#dfc7ff'], ['#103a34', '#a6ffe8']
  ];

  function choose(project, key) {
    return state.lang === 'en' ? (project[key + '_en'] || project[key + '_zh'] || project[key]) : (project[key + '_zh'] || project[key + '_en'] || project[key]);
  }

  function getCollection(slug) {
    if (slug === 'work') {
      return { slug, title: 'Selected Work', titleZh: '精选作品', label: 'AI / XR / PRODUCT', items: state.projects };
    }
    return { slug, ...staticCollections[slug] };
  }

  function collectionItems(slug) {
    return getCollection(slug).items || [];
  }

  function setTheme() {
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem('flyun:portfolio:theme', state.theme);
    const button = $('#themeToggle');
    if (button) button.textContent = state.theme === 'dark' ? '●' : '☼';
  }

  function setLanguage() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
    $$('[data-zh][data-en]').forEach((node) => { node.textContent = state.lang === 'en' ? node.dataset.en : node.dataset.zh; });
    const toggle = $('#langToggle');
    if (toggle) toggle.textContent = state.lang === 'en' ? '中' : 'EN';
    localStorage.setItem('flyun:lang', state.lang);
    renderProfile();
    renderFolders();
    if (state.activeCollection) renderStage();
  }

  function renderProfile() {
    const profile = state.profile || {};
    const fields = {
      name: state.lang === 'en' ? profile.nameEn : profile.nameZh,
      role: state.lang === 'en' ? profile.roleEn : profile.roleZh,
      intro: state.lang === 'en' ? profile.introEn : profile.introZh,
      availability: state.lang === 'en' ? profile.availabilityEn : profile.availabilityZh,
      email: profile.email
    };
    Object.entries(fields).forEach(([key, value]) => {
      $$(`[data-profile="${key}"]`).forEach((node) => {
        node.textContent = value || '';
        if (key === 'email' && node instanceof HTMLAnchorElement) node.href = `mailto:${value || ''}`;
      });
    });
    $$('[data-profile-link="github"]').forEach((node) => {
      node.href = profile.githubUrl || '#';
      node.hidden = !profile.githubUrl;
    });
  }

  function cardStyle(index, total) {
    const left = [24, 52, 76, 39, 67, 19][index % 6];
    const top = [5, 11, 3, 9, 14, 16][index % 6];
    const width = total > 4 ? [24, 29, 23, 28, 25, 26][index % 6] : [27, 33, 28, 31][index % 4];
    const tilt = [-7, 4, -3, 6, -5, 2][index % 6];
    return `left:${left}%;top:${top}%;width:${width}%;--tilt:${tilt}deg`;
  }

  function palette(index) {
    const [bg, ink] = accentPalette[index % accentPalette.length];
    return `--card-bg:${bg};--card-ink:${ink}`;
  }

  function labelFor(item) {
    if (item.title_zh) return choose(item, 'title');
    return state.lang === 'en' ? item.title : item.titleZh;
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function safeLink(value) {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '';
    } catch (error) {
      return '';
    }
  }

  function makeCard(item, index, total, mode) {
    const card = document.createElement(mode === 'stage' ? 'button' : 'span');
    card.className = mode === 'stage' ? `stage-card${index === state.activeIndex ? ' is-active' : ''}` : 'folder-card';
    if (mode === 'stage') {
      card.type = 'button';
      card.setAttribute('aria-label', labelFor(item));
      card.addEventListener('click', () => { state.activeIndex = index; renderStage(); });
    }
    card.style.cssText = mode === 'stage' ? `--rotate:${[-5, 3, -2, 5, -4, 2][index % 6]}deg` : cardStyle(index, total);
    if (mode === 'stage') card.style.setProperty('--scale', index === state.activeIndex ? '1' : '.72');
    const surface = document.createElement('span');
    surface.className = mode === 'stage' ? 'stage-card__surface' : 'folder-card__art';
    surface.style.cssText = palette(index);
    if (item.cover) {
      const image = document.createElement('img');
      image.className = mode === 'stage' ? 'stage-card__image' : 'folder-card__image';
      image.src = item.cover;
      image.alt = '';
      image.loading = 'lazy';
      surface.append(image);
    }
    const info = document.createElement('span');
    info.className = mode === 'stage' ? 'stage-card__info' : 'folder-card__label';
    const small = document.createElement('small');
    small.textContent = item.category || 'PROJECT';
    const strong = document.createElement('strong');
    strong.textContent = labelFor(item);
    info.append(small, strong);
    surface.append(info);
    card.append(surface);
    return card;
  }

  function renderFolders() {
    $$('.folder').forEach((folder) => {
      const host = $('.folder-items', folder);
      if (!host) return;
      host.replaceChildren();
      const items = collectionItems(folder.dataset.collection);
      const visible = items.slice(0, 6);
      visible.forEach((item, index) => host.append(makeCard(item, index, visible.length, 'folder')));
    });
    const count = $('#collectionCount');
    if (count) count.textContent = state.lang === 'en' ? `${state.projects.length} projects` : `${state.projects.length} 个项目`;
  }

  function renderStage() {
    if (!state.activeCollection) return;
    const collection = getCollection(state.activeCollection);
    const items = collection.items || [];
    if (!items.length) return;
    state.activeIndex = Math.max(0, Math.min(state.activeIndex, items.length - 1));
    const stage = $('#collectionStage');
    $('#stageTitle').textContent = state.lang === 'en' ? collection.title : (collection.titleZh || collection.title);
    $('#stageMeta').textContent = state.lang === 'en' ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : `${items.length} 个条目`;
    const rail = $('#stageRail');
    rail.replaceChildren();
    items.forEach((item, index) => {
      const card = makeCard(item, index, items.length, 'stage');
      const distance = index - state.activeIndex;
      card.style.setProperty('--x', `${distance * 45}px`);
      card.style.setProperty('--opacity', String(Math.max(.25, 1 - Math.abs(distance) * .18)));
      rail.append(card);
    });
    $('#stageCounter').textContent = `${String(state.activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    renderStageDetail(items[state.activeIndex], state.activeIndex, items.length);
    stage.hidden = false;
    stage.classList.add('is-open');
  }

  function renderStageDetail(item, index, total) {
    const title = labelFor(item);
    const body = item.title_zh ? choose(item, 'subtitle') : (state.lang === 'en' ? item.bodyEn : item.body);
    const role = item.title_zh ? ((item.meta && item.meta.role) || (state.lang === 'en' ? 'Independent project' : '独立项目')) : item.role;
    const tags = item.title_zh ? ((item.meta && item.meta.tools) || []) : (item.tags || []);
    const category = item.category || 'PROJECT';
    const link = item.link && item.link !== '#' ? safeLink(item.link) : '';
    const detail = $('#stageDetail');
    detail.innerHTML = `<span class="stage-detail__index">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span><span class="stage-detail__category">${escapeHTML(category)}${item.year ? ` · ${escapeHTML(item.year)}` : ''}</span><h2>${escapeHTML(title)}</h2><p>${escapeHTML(body || '')}</p><div class="stage-detail__role"><small>${state.lang === 'en' ? 'ROLE / CONTRIBUTION' : '角色 / 贡献'}</small><strong>${escapeHTML(role || '')}</strong></div><div class="stage-tags">${tags.slice(0, 6).map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}</div>${link ? `<a class="stage-detail__link" href="${escapeHTML(link)}" target="_blank" rel="noreferrer">${state.lang === 'en' ? 'Open project ↗' : '打开项目 ↗'}</a>` : ''}`;
  }

  function openCollection(slug) {
    const items = collectionItems(slug);
    if (!items.length) return;
    state.activeCollection = slug;
    state.activeIndex = 0;
    document.body.classList.add('stage-open');
    renderStage();
    $('#stageClose').focus();
  }

  function closeCollection() {
    const stage = $('#collectionStage');
    stage.classList.remove('is-open');
    stage.hidden = true;
    state.activeCollection = null;
    document.body.classList.remove('stage-open');
  }

  function moveStage(direction) {
    if (!state.activeCollection) return;
    const items = collectionItems(state.activeCollection);
    state.activeIndex = Math.max(0, Math.min(items.length - 1, state.activeIndex + direction));
    renderStage();
  }

  function init() {
    setTheme();
    setLanguage();
    renderProfile();
    $$('.folder').forEach((folder) => folder.addEventListener('click', () => openCollection(folder.dataset.collection)));
    $('#langToggle').addEventListener('click', () => { state.lang = state.lang === 'en' ? 'zh' : 'en'; setLanguage(); });
    $('#themeToggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; setTheme(); });
    $('#stageClose').addEventListener('click', closeCollection);
    $('#stagePrev').addEventListener('click', () => moveStage(-1));
    $('#stageNext').addEventListener('click', () => moveStage(1));
    $('#collectionStage').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeCollection(); });
    $('#mobileMenuToggle').addEventListener('click', () => {
      const menu = $('#mobileMenu');
      const open = menu.hidden;
      menu.hidden = !open;
      $('#mobileMenuToggle').setAttribute('aria-expanded', String(open));
    });
    $$('#mobileMenu a').forEach((link) => link.addEventListener('click', () => { $('#mobileMenu').hidden = true; }));
    document.addEventListener('keydown', (event) => {
      if (!state.activeCollection) return;
      if (event.key === 'Escape') closeCollection();
      if (event.key === 'ArrowLeft') moveStage(-1);
      if (event.key === 'ArrowRight') moveStage(1);
    });
    document.addEventListener('flyun:projects-changed', (event) => {
      state.projects = event.detail.projects.filter((item) => item.status === 'published');
      renderFolders();
      if (state.activeCollection === 'work') renderStage();
    });
    document.addEventListener('flyun:profile-changed', (event) => { state.profile = event.detail.profile; renderProfile(); });
    store.listProjects({ preferCloud: true }).then((projects) => {
      if (Array.isArray(projects) && projects.length) {
        state.projects = projects.filter((item) => item.status === 'published');
        renderFolders();
      }
    }).catch(() => {});
    store.pullProfile().then((profile) => { if (profile) { state.profile = profile; renderProfile(); } }).catch(() => {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
