(() => {
  'use strict';

  function mountSystemLayer() {
    const progress = document.createElement('div');
    progress.className = 'system-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const isHome = /(^|\/)index\.html$/.test(location.pathname) || location.pathname.endsWith('/');
    if (!isHome) {
      const playLink = document.createElement('a');
      playLink.className = 'system-play-pill';
      playLink.href = 'index.html#play';
      playLink.innerHTML = '<span>PLAY</span><strong>SIGNAL FIELD ↗</strong>';
      playLink.setAttribute('aria-label', '打开 FLYUN 信号场互动游戏');
      document.body.appendChild(playLink);
    }

    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      const ratio = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    };
    updateScroll();
    addEventListener('scroll', updateScroll, { passive: true });
    addEventListener('resize', updateScroll);

    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.querySelectorAll('.service,.case,.exp,.post-card,.tier,.channel,.skill').forEach(card => {
        card.classList.add('system-reactive');
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSystemLayer, { once: true });
  } else {
    mountSystemLayer();
  }
})();
