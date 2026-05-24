/* ==========================================================
 * FLYUN THEME · 深色 / 浅色 主题切换
 * 通过在 <html> 上设置 data-theme="dark|light" 触发 CSS 变量切换
 * 偏好保存在 localStorage:flyun:theme
 * 支持: 自动跟随系统 / 手动锁定
 * ========================================================== */
(function (global) {
  'use strict';

  const KEY = 'flyun:theme';
  const VALID = ['dark', 'light'];

  function systemTheme() {
    try {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) { return 'dark'; }
  }
  function read() {
    const v = localStorage.getItem(KEY);
    return VALID.includes(v) ? v : null;
  }
  function effective() {
    return read() || systemTheme();
  }
  function apply(theme) {
    const t = VALID.includes(theme) ? theme : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('flyun-light', t === 'light');
    document.documentElement.classList.toggle('flyun-dark', t === 'dark');
    // 让 supports for color-scheme 表单控件
    document.documentElement.style.colorScheme = t;
    document.dispatchEvent(new CustomEvent('flyun:theme-change', { detail: { theme: t } }));
  }
  function set(theme) {
    if (!VALID.includes(theme)) return;
    localStorage.setItem(KEY, theme);
    apply(theme);
  }
  function clear() {
    localStorage.removeItem(KEY);
    apply(systemTheme());
  }
  function toggle() {
    set(effective() === 'dark' ? 'light' : 'dark');
  }

  /* ===== 自动注入主题切换按钮 =====
   * 在 HTML 任何 [data-theme-mount] 元素中渲染按钮
   * 也可以手动放 <button data-theme-toggle></button> */
  function svgIcon(theme) {
    if (theme === 'light') {
      // 太阳
      return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>';
    }
    // 月亮
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
  function refreshButtons() {
    const t = effective();
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.innerHTML = svgIcon(t);
      btn.setAttribute('aria-label', t === 'dark' ? '切换浅色 · Light' : '切换深色 · Dark');
      btn.setAttribute('title', t === 'dark' ? '浅色 / Light' : '深色 / Dark');
    });
  }
  function injectButtons() {
    document.querySelectorAll('[data-theme-mount]').forEach((host) => {
      if (host.querySelector('[data-theme-toggle]')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-theme-toggle', '');
      btn.className = 'theme-toggle';
      host.appendChild(btn);
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      if (btn.__flyunThemeBound) return;
      btn.__flyunThemeBound = true;
      btn.classList.add('theme-toggle');
      btn.addEventListener('click', toggle);
    });
    refreshButtons();
  }

  /* ===== 全局浅色主题 CSS（让所有页面都能直接生效） ===== */
  function injectStyles() {
    if (document.getElementById('flyun-theme-css')) return;
    const css = document.createElement('style');
    css.id = 'flyun-theme-css';
    css.textContent = `
/* === FLYUN LIGHT THEME (overrides existing :root vars on dark-styled pages) === */
:root[data-theme="light"]{
  --bg:#FAF6EE;
  --bg-2:#F2EBDB;
  --paper:#FFFDF7;
  --surface:rgba(255,253,247,.78);
  --surface-2:rgba(247,240,224,.85);
  --border:rgba(40,34,28,.10);
  --border-strong:rgba(40,34,28,.22);
  --text:#1A1410;
  --text-dim:#5A5045;
  --text-mute:#8A7E6E;
  --accent:#D93A14;
  --accent-2:#5BA32D;
  --accent-warm:#C58A3A;
  color-scheme: light;
}
:root[data-theme="light"] body{
  background:var(--bg);
  color:var(--text);
}
:root[data-theme="light"] nav,
:root[data-theme="light"] nav.scrolled{
  background:rgba(250,246,238,.78) !important;
}
:root[data-theme="light"] .topbar{
  background:rgba(250,246,238,.85) !important;
}
:root[data-theme="light"] .aura{ opacity:.6; }
:root[data-theme="light"] .aura::before,
:root[data-theme="light"] .aura::after{ opacity:.10 !important; }
:root[data-theme="light"] .grid-bg{
  background-image:
    linear-gradient(rgba(40,34,28,.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(40,34,28,.04) 1px,transparent 1px) !important;
}
:root[data-theme="light"] .noise{ opacity:.025 !important; mix-blend-mode:multiply !important; }
:root[data-theme="light"] .nav-mark,
:root[data-theme="light"] .brand-mark{
  background:#fff;
}
:root[data-theme="light"] .stroke{
  -webkit-text-stroke-color:var(--text) !important;
}
:root[data-theme="light"] .case-canvas,
:root[data-theme="light"] .case-bg-1,
:root[data-theme="light"] .case-bg-2,
:root[data-theme="light"] .case-bg-3,
:root[data-theme="light"] .case-bg-4,
:root[data-theme="light"] .case-bg-5,
:root[data-theme="light"] .case-bg-6,
:root[data-theme="light"] .bg-warm,
:root[data-theme="light"] .bg-cool,
:root[data-theme="light"] .bg-amber,
:root[data-theme="light"] .bg-fire,
:root[data-theme="light"] .bg-lime,
:root[data-theme="light"] .bg-mix{
  filter:invert(1) hue-rotate(180deg) brightness(.95);
}
:root[data-theme="light"] .case-svg,
:root[data-theme="light"] .portrait-svg{ filter:invert(0.9) hue-rotate(180deg); }
:root[data-theme="light"] .case-info{
  background:linear-gradient(180deg,transparent,rgba(255,253,247,.92)) !important;
}
:root[data-theme="light"] .post-cover.placeholder::after{
  background:radial-gradient(circle at 30% 40%,rgba(217,58,20,.30),transparent 60%),radial-gradient(circle at 80% 70%,rgba(197,138,58,.25),transparent 60%) !important;
}
:root[data-theme="light"] #boot{ background:var(--bg) !important; }
:root[data-theme="light"] .input,
:root[data-theme="light"] .field input,
:root[data-theme="light"] .field textarea,
:root[data-theme="light"] .field select,
:root[data-theme="light"] .body-textarea,
:root[data-theme="light"] .title-input{
  background:rgba(255,253,247,.7) !important;
}
:root[data-theme="light"] ::selection{ background:var(--accent); color:#fff; }

/* === Theme toggle button === */
.theme-toggle{
  width:42px;height:38px;border-radius:10px;
  background:transparent;border:1px solid var(--border-strong);
  color:var(--text);
  display:inline-flex;align-items:center;justify-content:center;
  cursor:pointer;transition:.25s var(--ease, ease);
  font-family:var(--mono, monospace);font-size:12px;font-weight:600;
  padding:0;
}
.theme-toggle:hover{ border-color:var(--accent); color:var(--accent); }
.theme-toggle svg{ display:block; }
:root[data-theme="light"] .theme-toggle{ background:rgba(255,253,247,.7); }

/* === Smooth transitions when switching theme === */
html, body, nav, .topbar, .card, .service, .tier, .case, .channel, .stat,
.post-card, .case, .filter-bar, .writer, .img-card, .post-row, .i18n-group{
  transition: background-color .35s ease, color .35s ease, border-color .35s ease;
}
`;
    document.head.appendChild(css);
  }

  /* ===== 启动 ===== */
  function init() {
    apply(effective());
    injectStyles();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { injectButtons(); });
    } else {
      injectButtons();
    }
    // 跟随系统变化（仅当没有显式偏好时）
    try {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        if (!read()) apply(systemTheme());
      });
    } catch (e) {}
    // 跨标签页同步
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) apply(effective());
    });
    document.addEventListener('flyun:theme-change', refreshButtons);
  }

  global.FlyunTheme = { read, effective, apply, set, clear, toggle, refresh: refreshButtons };
  init();
})(window);
