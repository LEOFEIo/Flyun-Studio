(() => {
  'use strict';

  const copy = {
    zh: {
      skip: '跳到主要内容',
      'nav.system': '系统',
      'nav.capabilities': '能力',
      'nav.scenes': '场景',
      'nav.cases': '案例',
      'nav.insights': '动态',
      'nav.contact': '开始合作',
      'nav.menu': '打开菜单',
      announce: 'FLYUN · EXPERIENCE INTELLIGENCE 2026',
      'hero.kicker': 'FLYUN 是一家空间智能与人才体验工作室',
      'hero.title': '让空间理解人，<br><em>让智能真正发生。</em>',
      'hero.copy': '我们连接空间计算、交互设计、AI 与人才洞察，把复杂技术转化为能够被感知、参与和持续生长的真实体验。',
      'hero.primary': '探索体验系统',
      'hero.secondary': '查看项目案例',
      'hero.online': 'SYSTEM ONLINE',
      'hero.card1': '理解人的意图',
      'hero.card2': '响应空间状态',
      'hero.card3': '让体验持续进化',
      'hero.visual': '实时体验上下文可视化',
      'system.kicker': '不是单点技术，而是一套共同工作的体验系统',
      'system.title': '体验的上下文，<br><em>是智能发生的地方。</em>',
      'system.tab1': '体验上下文',
      'system.tab2': '空间智能体',
      'system.tab3': '人才智能',
      'system.tab4': '设计共创',
      'system.tab5': '文化叙事',
      'system.panel1.title': '把分散的行为、空间与内容信号，组织成可以被理解的体验上下文。',
      'system.panel1.copy': '建立从观察、建模到反馈的闭环，让每一次互动不再是孤立事件，而是下一次体验的有效输入。',
      'system.panel2.title': '让数字内容理解位置、动作与现场状态，在真实空间中自然回应。',
      'system.panel2.copy': '从 Web3D、VR/AR 到大型互动装置，我们将实时引擎、传感器与叙事体验连成一个系统。',
      'system.panel3.title': '把岗位、能力与组织语境放在一起，找到真正适配的人。',
      'system.panel3.copy': 'AI 辅助研究与人的专业判断共同工作，缩短信息差，同时保留关系中的温度与信任。',
      'system.panel4.title': '让策略、原型与生产在同一个反馈回路中快速收敛。',
      'system.panel4.copy': '跨越研究、视觉、产品与技术，以可运行原型替代抽象共识，让想法更早被体验。',
      'system.panel5.title': '把组织与品牌的文化，转译成可以进入、触碰与分享的体验。',
      'system.panel5.copy': '用叙事、空间与参与机制建立共同记忆，让文化从说明文字变成可感知的现场。',
      'system.more': '了解工作方式',
      'stack.label': 'CONNECTED STACK / 跨越这些工具与能力',
      'ability.kicker': '从一次性交付，走向可持续演化的体验能力',
      'ability.title': '专有。可感知。<br><em>为体验而生。</em>',
      'ability.one.title': '用户体验上下文',
      'ability.one.copy': '连接用户行为、空间状态、内容资产与业务目标，建立属于每个项目的上下文模型。',
      'ability.two.title': '端到端空间运行',
      'ability.two.copy': '从体验策略、实时原型到现场部署与后续运营，把想法做成稳定、可测量的真实系统。',
      'ability.three.title': '面向关系持续进化',
      'ability.three.copy': '让数据反馈、人的判断与 AI 协作共同进入迭代，使体验随用户和组织一起成长。',
      'scenes.title': '为真实场景，<br><em>创造下一种交互。</em>',
      'scenes.copy': '我们不预设媒介。每个项目从人、空间和关系出发，选择最合适的技术与表达。',
      'scenes.one': '虚拟博物馆与数字展陈',
      'scenes.one.copy': '让内容成为可以漫游、探索和共同发现的空间。',
      'scenes.two': '空间交互与 XR 产品',
      'scenes.two.copy': '以动作、位置和现场状态，构建更自然的响应关系。',
      'scenes.three': 'AI 人才研究与连接',
      'scenes.three.copy': '在能力、角色与文化之间，寻找真正长期的适配。',
      'scenes.four': '品牌体验与互动原型',
      'scenes.four.copy': '把抽象价值变成可进入、可分享、可持续运营的体验。',
      'play.title': '不要只看。<br><em>进入信号场。</em>',
      'play.copy': '移动光标或使用 WASD / 方向键，按顺序连接五个体验节点。避开红色噪声，在 45 秒内让系统上线。',
      'play.score': '得分 / SCORE',
      'play.clarity': '清晰度 / CLARITY',
      'play.time': '时间 / TIME',
      'play.mission': '连接序列 / SIGNAL PATH',
      'play.help': '桌面：移动鼠标 / WASD<br>触屏：按住并拖动',
      'play.overlay.title': '建立一条有意义的连接',
      'play.overlay.copy': '你是体验系统中的一束信号。连接五个节点、避开噪声，让分散的能力成为一个会回应的网络。',
      'play.start': '启动系统 / START',
      'insights.title': '来自现场的更新',
      'insights.all': '查看全部动态',
      'insights.one': '从展示到共创：下一代数字空间需要怎样的参与感？',
      'insights.one.copy': '一套关于空间叙事、实时反馈与用户自主性的项目方法。',
      'insights.two': 'AI 进入创意流程后，人的判断为什么更重要？',
      'insights.three': '一个能感知距离与节奏的网页界面实验',
      'final.kicker': '有一个值得被真正体验的想法？',
      'final.title': '一起让它<br><em>发生。</em>',
      'final.copy': '告诉我们你想改变的现场、关系或体验。我们会从一个清晰的问题开始。',
      'final.cta': 'HELLO@FLYUN.STUDIO',
      'footer.tagline': '体验智能 · 空间交互 · 人才连接',
      'footer.join': '加入我们',
      'footer.note': '以好奇心构建，持续在线。'
    },
    en: {
      skip: 'Skip to main content',
      'nav.system': 'System',
      'nav.capabilities': 'Capabilities',
      'nav.scenes': 'Scenes',
      'nav.cases': 'Cases',
      'nav.insights': 'Insights',
      'nav.contact': 'Start a project',
      'nav.menu': 'Open menu',
      announce: 'FLYUN · EXPERIENCE INTELLIGENCE 2026',
      'hero.kicker': 'FLYUN is a spatial intelligence and talent experience studio',
      'hero.title': 'Spaces that understand.<br><em>Intelligence you can feel.</em>',
      'hero.copy': 'We connect spatial computing, interaction design, AI and talent insight—turning complex technology into experiences people can sense, shape and grow with.',
      'hero.primary': 'Explore the system',
      'hero.secondary': 'View selected work',
      'hero.online': 'SYSTEM ONLINE',
      'hero.card1': 'Understand intent',
      'hero.card2': 'Respond to space',
      'hero.card3': 'Evolve the experience',
      'hero.visual': 'Live experience-context visualization',
      'system.kicker': 'Not a point solution, but an experience system that works as one',
      'system.title': 'Context is where<br><em>intelligence becomes real.</em>',
      'system.tab1': 'Experience Context',
      'system.tab2': 'Spatial Agent',
      'system.tab3': 'Talent Intelligence',
      'system.tab4': 'Design Co-creation',
      'system.tab5': 'Cultural Storytelling',
      'system.panel1.title': 'Organize fragmented behavior, space and content signals into context an experience can understand.',
      'system.panel1.copy': 'We close the loop from observation to modeling and feedback, so every interaction becomes useful input for what happens next.',
      'system.panel2.title': 'Help digital content understand position, movement and live conditions—and respond naturally in physical space.',
      'system.panel2.copy': 'From Web3D and VR/AR to large interactive installations, we connect real-time engines, sensors and narrative as one system.',
      'system.panel3.title': 'Put roles, capabilities and organizational context together to find people who truly fit.',
      'system.panel3.copy': 'AI-assisted research works with human judgment to reduce information gaps while preserving trust and warmth.',
      'system.panel4.title': 'Bring strategy, prototyping and production into one fast feedback loop.',
      'system.panel4.copy': 'Across research, visual design, product and technology, working prototypes replace abstract alignment so ideas can be felt earlier.',
      'system.panel5.title': 'Translate organizational and brand culture into experiences people can enter, touch and share.',
      'system.panel5.copy': 'Narrative, space and participation create shared memory—turning culture from copy into a place people can feel.',
      'system.more': 'How we work',
      'stack.label': 'CONNECTED STACK / TOOLS AND CAPABILITIES WE WORK ACROSS',
      'ability.kicker': 'From one-off delivery to an experience capability that keeps evolving',
      'ability.title': 'Proprietary. Perceptive.<br><em>Built for experience.</em>',
      'ability.one.title': 'Experience Context',
      'ability.one.copy': 'Connect behavior, spatial state, content assets and business goals in a context model made for each project.',
      'ability.two.title': 'End-to-end Spatial Runtime',
      'ability.two.copy': 'From experience strategy and live prototypes to deployment and operation, ideas become stable, measurable systems.',
      'ability.three.title': 'Evolving with Relationships',
      'ability.three.copy': 'Data feedback, human judgment and AI collaboration enter the same loop, helping experiences grow with people and organizations.',
      'scenes.title': 'For real-world contexts,<br><em>create the next interaction.</em>',
      'scenes.copy': 'We do not begin with a medium. Every project starts with people, place and relationships, then selects the right technology and expression.',
      'scenes.one': 'Virtual Museums & Digital Exhibitions',
      'scenes.one.copy': 'Turn content into a place people can wander, explore and discover together.',
      'scenes.two': 'Spatial Interaction & XR Products',
      'scenes.two.copy': 'Use movement, position and live conditions to create more natural responses.',
      'scenes.three': 'AI Talent Research & Connection',
      'scenes.three.copy': 'Find long-term fit across capability, role and culture.',
      'scenes.four': 'Brand Experience & Interactive Prototypes',
      'scenes.four.copy': 'Turn abstract value into an experience people can enter, share and sustain.',
      'play.title': 'Do not just look.<br><em>Enter the signal field.</em>',
      'play.copy': 'Move your pointer or use WASD / arrow keys to connect five nodes in sequence. Avoid red noise and bring the system online in 45 seconds.',
      'play.score': 'SCORE',
      'play.clarity': 'CLARITY',
      'play.time': 'TIME',
      'play.mission': 'SIGNAL PATH',
      'play.help': 'Desktop: pointer / WASD<br>Touch: hold and drag',
      'play.overlay.title': 'Build a connection that matters',
      'play.overlay.copy': 'You are a signal inside the experience system. Link five nodes, avoid noise and turn separate capabilities into a responsive network.',
      'play.start': 'START SYSTEM',
      'insights.title': 'Updates from the field',
      'insights.all': 'View all insights',
      'insights.one': 'From display to co-creation: what makes the next digital space participatory?',
      'insights.one.copy': 'A project method for spatial narrative, live feedback and user agency.',
      'insights.two': 'Why human judgment matters more when AI enters the creative process',
      'insights.three': 'A web interface experiment that senses distance and rhythm',
      'final.kicker': 'Have an idea that deserves to be truly experienced?',
      'final.title': 'Let us make it<br><em>happen.</em>',
      'final.copy': 'Tell us about the place, relationship or experience you want to change. We will begin with one clear question.',
      'final.cta': 'HELLO@FLYUN.STUDIO',
      'footer.tagline': 'Experience intelligence · Spatial interaction · Talent connection',
      'footer.join': 'Join us',
      'footer.note': 'Built with curiosity. Always evolving.'
    }
  };

  function currentLanguage() {
    if (window.FlyunCMS?.getLang) return window.FlyunCMS.getLang();
    return localStorage.getItem('flyun.lang') === 'en' ? 'en' : 'zh';
  }

  function applyCopy(lang = currentLanguage()) {
    const dictionary = copy[lang] || copy.zh;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-copy]').forEach(element => {
      const value = dictionary[element.dataset.copy];
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-copy-html]').forEach(element => {
      const value = dictionary[element.dataset.copyHtml];
      if (typeof value === 'string') element.innerHTML = value;
    });
    const menuButton = document.querySelector('[data-menu-button]');
    if (menuButton) menuButton.setAttribute('aria-label', dictionary['nav.menu']);
  }

  function setupNavigation() {
    const header = document.querySelector('[data-home-nav]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if (!header || !menuButton || !mobileMenu) return;

    const setMenu = open => {
      mobileMenu.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuButton.addEventListener('click', () => setMenu(mobileMenu.hidden));
    mobileMenu.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100) setMenu(false);
    });

    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function setupContextTabs() {
    const tabs = Array.from(document.querySelectorAll('[data-context-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-context-panel]'));
    if (!tabs.length || !panels.length) return;

    const activate = selected => {
      const target = selected.dataset.contextTab;
      tabs.forEach(tab => {
        const active = tab === selected;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => {
        const active = panel.dataset.contextPanel === target;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
  }

  function setupReveal() {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
      observer.observe(element);
    });
  }

  function setupHeroField() {
    const canvas = document.getElementById('heroField');
    const stage = document.querySelector('[data-hero-stage]');
    if (!canvas || !stage) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      points: [],
      pointer: { x: 0, y: 0, active: false },
      frame: 0
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const random = (min, max) => min + Math.random() * (max - min);

    function resize() {
      const bounds = stage.getBoundingClientRect();
      state.width = Math.max(320, bounds.width);
      state.height = Math.max(480, bounds.height);
      state.dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      const count = Math.max(28, Math.min(72, Math.round(state.width / 18)));
      state.points = Array.from({ length: count }, (_, index) => ({
        x: random(0, state.width),
        y: random(50, state.height - 50),
        vx: random(-0.12, 0.12),
        vy: random(-0.1, 0.1),
        r: index % 8 === 0 ? random(2.2, 3.4) : random(.7, 1.6),
        phase: random(0, Math.PI * 2)
      }));
      if (reduced) draw(0);
    }

    function palette() {
      const light = document.documentElement.dataset.theme === 'light';
      return light ? {
        line: 'rgba(20,38,25,.12)',
        dot: 'rgba(49,92,60,.50)',
        near: 'rgba(79,137,42,.40)'
      } : {
        line: 'rgba(211,244,220,.10)',
        dot: 'rgba(180,221,191,.42)',
        near: 'rgba(201,255,87,.38)'
      };
    }

    function draw(time) {
      const colors = palette();
      context.clearRect(0, 0, state.width, state.height);
      state.points.forEach(point => {
        if (!reduced) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.x < -10 || point.x > state.width + 10) point.vx *= -1;
          if (point.y < 30 || point.y > state.height - 30) point.vy *= -1;
        }
      });

      for (let a = 0; a < state.points.length; a += 1) {
        const first = state.points[a];
        for (let b = a + 1; b < state.points.length; b += 1) {
          const second = state.points[b];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance > 150) continue;
          context.strokeStyle = colors.line;
          context.globalAlpha = 1 - distance / 150;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
        const pointerDistance = Math.hypot(first.x - state.pointer.x, first.y - state.pointer.y);
        const nearPointer = state.pointer.active && pointerDistance < 170;
        if (nearPointer) {
          context.strokeStyle = colors.near;
          context.globalAlpha = 1 - pointerDistance / 170;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(state.pointer.x, state.pointer.y);
          context.stroke();
        }
        context.globalAlpha = .55 + Math.sin(time * .001 + first.phase) * .2;
        context.fillStyle = nearPointer ? colors.near : colors.dot;
        context.beginPath();
        context.arc(first.x, first.y, first.r, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (state.pointer.active) {
        const glow = context.createRadialGradient(state.pointer.x, state.pointer.y, 0, state.pointer.x, state.pointer.y, 90);
        glow.addColorStop(0, 'rgba(201,255,87,.13)');
        glow.addColorStop(1, 'rgba(201,255,87,0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(state.pointer.x, state.pointer.y, 90, 0, Math.PI * 2);
        context.fill();
      }
      if (!reduced) state.frame = requestAnimationFrame(draw);
    }

    stage.addEventListener('pointermove', event => {
      const bounds = stage.getBoundingClientRect();
      state.pointer.x = event.clientX - bounds.left;
      state.pointer.y = event.clientY - bounds.top;
      state.pointer.active = true;
    });
    stage.addEventListener('pointerleave', () => { state.pointer.active = false; });
    window.addEventListener('resize', resize);
    const themeObserver = new MutationObserver(() => {
      if (reduced) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    resize();
    if (!reduced) state.frame = requestAnimationFrame(draw);
  }

  function setupCardParallax() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.querySelectorAll('.fy-ability-card,.fy-insight').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.transform = `perspective(900px) rotateX(${-y * 2.2}deg) rotateY(${x * 2.2}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  function init() {
    applyCopy();
    setupNavigation();
    setupContextTabs();
    setupReveal();
    setupHeroField();
    setupCardParallax();
  }

  window.addEventListener('flyun:langchange', event => applyCopy(event.detail?.lang));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
