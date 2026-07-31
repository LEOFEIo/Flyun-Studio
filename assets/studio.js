(function () {
  'use strict';

  const store = window.FlyunStudioStore;
  if (!store) return;

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const state = {
    lang: localStorage.getItem('flyun:lang') === 'en' ? 'en' : 'zh',
    filter: 'all',
    projects: [],
    profile: store.readProfile()
  };

  function text(project, zhKey, enKey) {
    return state.lang === 'en' ? (project[enKey] || project[zhKey]) : (project[zhKey] || project[enKey]);
  }

  function setLanguage() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
    document.body.dataset.lang = state.lang;
    qa('[data-zh][data-en]').forEach((node) => {
      node.textContent = state.lang === 'en' ? node.dataset.en : node.dataset.zh;
    });
    qa('[data-zh-html][data-en-html]').forEach((node) => {
      const template = state.lang === 'en' ? node.dataset.enHtml : node.dataset.zhHtml;
      node.replaceChildren();
      node.append(document.createRange().createContextualFragment(template));
    });
    const toggle = q('#langToggle');
    if (toggle) toggle.textContent = state.lang === 'en' ? '中' : 'EN';
    localStorage.setItem('flyun:lang', state.lang);
    renderProfile();
    renderFilters();
    renderProjects();
  }

  function renderProfile() {
    const profile = state.profile;
    const fields = {
      name: state.lang === 'en' ? profile.nameEn : profile.nameZh,
      role: state.lang === 'en' ? profile.roleEn : profile.roleZh,
      intro: state.lang === 'en' ? profile.introEn : profile.introZh,
      availability: state.lang === 'en' ? profile.availabilityEn : profile.availabilityZh,
      location: profile.location,
      email: profile.email
    };
    Object.entries(fields).forEach(([key, value]) => {
      qa(`[data-profile="${key}"]`).forEach((node) => {
        node.textContent = value || '';
        if (key === 'email' && node instanceof HTMLAnchorElement) node.href = `mailto:${value}`;
      });
    });
    const github = q('[data-profile-link="github"]');
    if (github) {
      github.href = profile.githubUrl || '#';
      github.hidden = !profile.githubUrl;
    }
    const resume = q('[data-profile-link="resume"]');
    if (resume) {
      resume.href = profile.resumeUrl || '#';
      resume.hidden = !profile.resumeUrl;
    }
  }

  function make(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }

  function renderFilters() {
    const host = q('#projectFilters');
    if (!host) return;
    host.replaceChildren();
    const categories = ['all', ...new Set(state.projects.map((item) => item.category).filter(Boolean))];
    categories.forEach((category) => {
      const label = category === 'all' ? (state.lang === 'en' ? 'All work' : '全部作品') : category;
      const button = make('button', `filter-chip${state.filter === category ? ' is-active' : ''}`, label);
      button.type = 'button';
      button.addEventListener('click', () => {
        state.filter = category;
        renderFilters();
        renderProjects();
      });
      host.append(button);
    });
  }

  function createCard(project, index) {
    const meta = project.meta || {};
    const card = make('article', `project-card${meta.featured ? ' project-card--featured' : ''}`);
    card.tabIndex = 0;
    card.role = 'button';
    card.dataset.projectId = project.id;
    card.dataset.accent = meta.accent || ['lime', 'cobalt', 'orange', 'violet', 'cyan', 'rose'][index % 6];
    card.setAttribute('aria-label', text(project, 'title_zh', 'title_en'));
    if (project.cover) card.style.setProperty('--project-cover', `url("${project.cover}")`);

    const media = make('div', 'project-card__media');
    media.append(make('div', 'project-card__image'));
    const signal = make('div', 'project-card__signal');
    signal.append(make('i'), make('i'), make('i'));
    media.append(signal, make('span', 'project-card__number', meta.index || String(index + 1).padStart(2, '0')), make('span', 'project-card__open', '↗'));

    const body = make('div', 'project-card__body');
    const info = make('div', 'project-card__meta');
    info.append(make('span', '', project.category), make('span', '', project.year));
    body.append(info, make('h3', '', text(project, 'title_zh', 'title_en')), make('p', '', text(project, 'subtitle_zh', 'subtitle_en')));
    const tools = make('div', 'project-card__tools');
    (Array.isArray(meta.tools) ? meta.tools.slice(0, 4) : []).forEach((tool) => tools.append(make('span', '', tool)));
    body.append(tools);
    card.append(media, body);

    const open = () => openProject(project);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--rx', `${-y * 5}deg`);
      card.style.setProperty('--ry', `${x * 7}deg`);
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
    return card;
  }

  function renderProjects() {
    const host = q('#projectGrid');
    if (!host) return;
    host.replaceChildren();
    const visible = state.filter === 'all' ? state.projects : state.projects.filter((item) => item.category === state.filter);
    if (!visible.length) host.append(make('div', 'empty-state', state.lang === 'en' ? 'No projects in this category yet.' : '这个分类暂时还没有作品。'));
    visible.forEach((project, index) => host.append(createCard(project, index)));
    const count = q('#projectCount');
    if (count) count.textContent = String(state.projects.length).padStart(2, '0');
  }

  function openProject(project) {
    const dialog = q('#projectDialog');
    const meta = project.meta || {};
    q('#dialogIndex').textContent = meta.index || 'PROJECT';
    q('#dialogCategory').textContent = `${project.category} · ${project.year}`;
    q('#dialogTitle').textContent = text(project, 'title_zh', 'title_en');
    q('#dialogSummary').textContent = text(project, 'subtitle_zh', 'subtitle_en');
    q('#dialogRole').textContent = meta.role || (state.lang === 'en' ? 'Independent project' : '独立项目');
    const toolHost = q('#dialogTools');
    toolHost.replaceChildren();
    (Array.isArray(meta.tools) ? meta.tools : []).forEach((tool) => toolHost.append(make('span', '', tool)));
    const link = q('#dialogLink');
    link.href = project.link || '#';
    link.hidden = !project.link || project.link === '#';
    link.textContent = state.lang === 'en' ? 'Open project ↗' : '打开项目 ↗';
    const visual = q('#dialogVisual');
    visual.dataset.accent = meta.accent || 'lime';
    visual.style.backgroundImage = project.cover ? `url("${project.cover}")` : '';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  function closeProject() {
    const dialog = q('#projectDialog');
    if (dialog && dialog.open) dialog.close();
    document.body.classList.remove('dialog-open');
  }

  function setupTheme() {
    if (localStorage.getItem('flyun:portfolio:theme') === 'light') document.documentElement.dataset.theme = 'light';
    const button = q('#themeToggle');
    const update = () => { if (button) button.textContent = document.documentElement.dataset.theme === 'light' ? '●' : '○'; };
    button?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('flyun:portfolio:theme', next);
      update();
    });
    update();
  }

  function setupNavigation() {
    const header = q('.site-header');
    const menu = q('#mobileMenu');
    const menuButton = q('#menuToggle');
    menuButton?.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });
    qa('a', menu).forEach((link) => link.addEventListener('click', () => menu.classList.remove('is-open')));
    q('#langToggle')?.addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'zh' : 'en';
      setLanguage();
    });
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', String(max > 0 ? window.scrollY / max : 0));
      header?.classList.toggle('is-scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  function setupCommands() {
    const dialog = q('#commandPalette');
    const input = q('#commandInput');
    const actions = [
      ['查看作品', 'View work', '#work'],
      ['关于我', 'About me', '#about'],
      ['联系我', 'Contact', '#contact'],
      ['进入作品后台', 'Open studio admin', 'admin.html']
    ];
    const draw = () => {
      const term = (input.value || '').trim().toLowerCase();
      const host = q('#commandList');
      host.replaceChildren();
      actions.filter((item) => `${item[0]} ${item[1]}`.toLowerCase().includes(term)).forEach((item) => {
        const button = make('button');
        button.type = 'button';
        button.append(make('span', '', state.lang === 'en' ? item[1] : item[0]), make('kbd', '', '↵'));
        button.addEventListener('click', () => {
          dialog.close();
          if (item[2].startsWith('#')) q(item[2])?.scrollIntoView({ behavior: 'smooth' });
          else location.assign(item[2]);
        });
        host.append(button);
      });
    };
    const open = () => {
      input.value = '';
      draw();
      dialog.showModal();
      requestAnimationFrame(() => input.focus());
    };
    q('#commandButton')?.addEventListener('click', open);
    q('#commandClose')?.addEventListener('click', () => dialog.close());
    input?.addEventListener('input', draw);
    window.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        dialog.open ? dialog.close() : open();
      }
      if (event.key === 'Escape') closeProject();
    });
  }

  function setupMotion() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    qa('[data-reveal]').forEach((node) => observer.observe(node));

    if (!matchMedia('(pointer: coarse)').matches) {
      qa('[data-magnetic]').forEach((node) => {
        node.addEventListener('pointermove', (event) => {
          const rect = node.getBoundingClientRect();
          node.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.12}px, ${(event.clientY - rect.top - rect.height / 2) * 0.12}px)`;
        });
        node.addEventListener('pointerleave', () => { node.style.transform = ''; });
      });
      const dot = q('.cursor-dot');
      const ring = q('.cursor-ring');
      let tx = -100, ty = -100, rx = -100, ry = -100;
      addEventListener('pointermove', (event) => {
        tx = event.clientX;
        ty = event.clientY;
        dot.style.transform = `translate(${tx}px,${ty}px)`;
      });
      addEventListener('pointerover', (event) => ring.classList.toggle('is-active', Boolean(event.target.closest('a,button,[role="button"],input'))));
      const follow = () => {
        rx += (tx - rx) * .16;
        ry += (ty - ry) * .16;
        ring.style.transform = `translate(${rx}px,${ry}px)`;
        requestAnimationFrame(follow);
      };
      follow();
    }
  }

  function setupSignal() {
    const canvas = q('#signalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pointer = { x: 0, y: 0, active: false };
    let width = 0, height = 0, points = [], time = 0;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(8, Math.floor(width / 74));
      const rows = Math.max(8, Math.floor(height / 74));
      points = [];
      for (let y = 0; y <= rows; y += 1) {
        for (let x = 0; x <= cols; x += 1) {
          points.push({ ox: x / cols * width, oy: y / rows * height, x: x / cols * width, y: y / rows * height, phase: Math.random() * 6.28 });
        }
      }
    }
    function draw() {
      time += .012;
      ctx.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.theme === 'light';
      points.forEach((point) => {
        let x = point.ox + Math.cos(time + point.phase) * 4;
        let y = point.oy + Math.sin(time * 1.2 + point.phase) * 4;
        if (pointer.active) {
          const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy), radius = Math.min(width, height) * .32;
          if (distance > 0 && distance < radius) {
            const force = (1 - distance / radius) * 36;
            x += dx / distance * force;
            y += dy / distance * force;
          }
        }
        point.x += (x - point.x) * .08;
        point.y += (y - point.y) * .08;
      });
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i], b = points[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 92) {
            ctx.strokeStyle = light ? `rgba(15,18,16,${(1-distance/92)*.18})` : `rgba(239,242,235,${(1-distance/92)*.15})`;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      points.forEach((point, index) => {
        ctx.fillStyle = index % 11 === 0 ? (light ? '#1a4cff' : '#c2ff4a') : (light ? 'rgba(15,18,16,.35)' : 'rgba(239,242,235,.35)');
        ctx.beginPath();
        ctx.arc(point.x,point.y,index%11===0?2.2:1.1,0,6.28);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  async function load() {
    state.projects = store.readProjects().filter((item) => item.status === 'published');
    renderFilters();
    renderProjects();
    renderProfile();
    const [projects, profile] = await Promise.all([
      store.listProjects({ preferCloud: true }).catch(() => state.projects),
      store.pullProfile().catch(() => state.profile)
    ]);
    state.projects = projects;
    state.profile = profile;
    renderFilters();
    renderProjects();
    renderProfile();
  }

  function init() {
    setupTheme();
    setupNavigation();
    setupCommands();
    setupMotion();
    setupSignal();
    q('#dialogClose')?.addEventListener('click', closeProject);
    q('#projectDialog')?.addEventListener('click', (event) => { if (event.target === event.currentTarget) closeProject(); });
    setLanguage();
    load();
  }

  document.addEventListener('flyun:projects-changed', (event) => {
    state.projects = event.detail.projects.filter((item) => item.status === 'published');
    renderFilters();
    renderProjects();
  });
  document.addEventListener('flyun:profile-changed', (event) => {
    state.profile = event.detail.profile;
    renderProfile();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
