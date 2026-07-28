(() => {
  'use strict';

  const canvas = document.getElementById('signalCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const wrap = canvas.closest('.signal-canvas-wrap');
  const overlay = document.getElementById('signalOverlay');
  const overlayTitle = document.getElementById('signalOverlayTitle');
  const overlayCopy = document.getElementById('signalOverlayCopy');
  const startButton = document.getElementById('signalStart');
  const scoreElement = document.getElementById('signalScore');
  const clarityElement = document.getElementById('signalClarity');
  const timeElement = document.getElementById('signalTime');
  const progressElement = document.getElementById('signalProgress');
  const liveRegion = document.getElementById('signalLive');
  const missionItems = Array.from(document.querySelectorAll('[data-signal-mission]'));

  const missionNames = ['INTERACTION', 'XR', 'AI', 'TALENT', 'CULTURE'];
  const colors = ['#c8ff48', '#72e7ff', '#8b7bff', '#ff805f', '#f4f7f0'];
  const state = {
    mode: 'idle',
    width: 0,
    height: 0,
    dpr: 1,
    score: 0,
    clarity: 100,
    time: 45,
    mission: 0,
    startedAt: 0,
    lastFrame: 0,
    nextNoiseHitAt: 0,
    pointerActive: false,
    keys: new Set(),
    particles: [],
    nodes: [],
    hazards: [],
    trails: [],
    player: { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, r: 10 }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const random = (min, max) => min + Math.random() * (max - min);

  function resize() {
    const rect = wrap.getBoundingClientRect();
    state.width = Math.max(320, rect.width);
    state.height = Math.max(500, rect.height);
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    if (!state.player.x) {
      state.player.x = state.width * 0.5;
      state.player.y = state.height * 0.72;
      state.player.tx = state.player.x;
      state.player.ty = state.player.y;
    } else {
      state.player.x = clamp(state.player.x, 24, state.width - 24);
      state.player.y = clamp(state.player.y, 76, state.height - 24);
      state.player.tx = clamp(state.player.tx, 24, state.width - 24);
      state.player.ty = clamp(state.player.ty, 76, state.height - 24);
    }
    createField(false);
  }

  function createField(resetPlayer = true) {
    if (resetPlayer) {
      state.player.x = state.width * 0.5;
      state.player.y = state.height * 0.74;
      state.player.tx = state.player.x;
      state.player.ty = state.player.y;
      state.player.vx = 0;
      state.player.vy = 0;
    }

    const nodePositions = [
      [0.18, 0.26],
      [0.76, 0.18],
      [0.48, 0.42],
      [0.82, 0.66],
      [0.24, 0.72]
    ];
    state.nodes = missionNames.map((name, index) => ({
      name,
      x: state.width * nodePositions[index][0],
      y: state.height * nodePositions[index][1],
      r: 15,
      phase: random(0, Math.PI * 2),
      collected: index < state.mission,
      color: colors[index]
    }));

    state.hazards = Array.from({ length: state.width < 620 ? 4 : 7 }, (_, index) => ({
      x: random(60, state.width - 60),
      y: random(110, state.height - 50),
      r: random(13, 23),
      vx: random(-18, 18) || 10,
      vy: random(-14, 14) || -9,
      phase: index * 0.9
    }));

    state.particles = Array.from({ length: state.width < 620 ? 48 : 84 }, () => ({
      x: random(0, state.width),
      y: random(0, state.height),
      r: random(.5, 1.8),
      a: random(.12, .54),
      speed: random(3, 12)
    }));
    state.trails = [];
  }

  function resetGame() {
    state.mode = 'running';
    state.score = 0;
    state.clarity = 100;
    state.time = 45;
    state.mission = 0;
    state.startedAt = performance.now();
    state.lastFrame = state.startedAt;
    state.nextNoiseHitAt = 0;
    state.pointerActive = false;
    createField(true);
    updateHud();
    overlay.hidden = true;
    startButton.textContent = '重新开始 / Restart';
    canvas.focus();
    liveRegion.textContent = '游戏开始。寻找第一个信号节点 INTERACTION。';
  }

  function endGame(completed) {
    state.mode = completed ? 'complete' : 'failed';
    overlay.hidden = false;
    if (completed) {
      overlayTitle.textContent = '信号已连接 · SYSTEM ALIVE';
      overlayCopy.textContent = `你用 ${Math.round(45 - state.time)} 秒完成了 FLYUN 网络，最终得分 ${state.score}。每个好体验，都来自人与空间之间清晰的回应。`;
      startButton.textContent = '再构建一次 / Replay';
      liveRegion.textContent = '任务完成，所有信号节点已经连接。';
    } else {
      overlayTitle.textContent = '信号中断 · TRY AGAIN';
      overlayCopy.textContent = `本次建立了 ${state.mission} / ${missionNames.length} 个节点。避开红色噪声，按顺序连接信号可以获得更高分。`;
      startButton.textContent = '重新校准 / Retry';
      liveRegion.textContent = '游戏结束，可以重新开始。';
    }
  }

  function updateHud() {
    scoreElement.textContent = String(state.score).padStart(4, '0');
    clarityElement.textContent = `${Math.round(state.clarity)}%`;
    timeElement.textContent = `${Math.ceil(state.time)}s`;
    progressElement.style.width = `${(state.mission / missionNames.length) * 100}%`;
    missionItems.forEach((item, index) => {
      item.classList.toggle('done', index < state.mission);
      item.classList.toggle('active', index === state.mission && state.mode === 'running');
      const status = item.querySelector('small');
      if (status) status.textContent = index < state.mission ? 'LINKED' : index === state.mission ? 'TARGET' : 'WAIT';
    });
  }

  function setTargetFromPointer(event) {
    if (state.mode !== 'running') return;
    const rect = canvas.getBoundingClientRect();
    state.player.tx = clamp(event.clientX - rect.left, 22, rect.width - 22);
    state.player.ty = clamp(event.clientY - rect.top, 74, rect.height - 22);
    state.pointerActive = true;
  }

  canvas.addEventListener('pointerdown', event => {
    setTargetFromPointer(event);
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' || event.buttons) setTargetFromPointer(event);
  });
  canvas.addEventListener('pointerup', event => {
    canvas.releasePointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      state.keys.add(key);
      state.pointerActive = false;
    }
    if ((key === 'enter' || key === ' ') && state.mode !== 'running') {
      event.preventDefault();
      resetGame();
    }
  });
  canvas.addEventListener('keyup', event => state.keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('blur', () => state.keys.clear());
  startButton.addEventListener('click', resetGame);

  function update(delta, now) {
    if (state.mode !== 'running') return;

    const elapsed = (now - state.startedAt) / 1000;
    state.time = Math.max(0, 45 - elapsed);
    if (state.time <= 0 || state.clarity <= 0) {
      endGame(false);
      return;
    }

    const speed = 235;
    let dx = 0;
    let dy = 0;
    if (state.keys.has('arrowleft') || state.keys.has('a')) dx -= 1;
    if (state.keys.has('arrowright') || state.keys.has('d')) dx += 1;
    if (state.keys.has('arrowup') || state.keys.has('w')) dy -= 1;
    if (state.keys.has('arrowdown') || state.keys.has('s')) dy += 1;

    if (dx || dy) {
      const length = Math.hypot(dx, dy) || 1;
      state.player.vx += (dx / length) * speed * delta * 6;
      state.player.vy += (dy / length) * speed * delta * 6;
    } else if (state.pointerActive) {
      state.player.vx += (state.player.tx - state.player.x) * delta * 8;
      state.player.vy += (state.player.ty - state.player.y) * delta * 8;
    }

    const friction = Math.pow(.0007, delta);
    state.player.vx *= friction;
    state.player.vy *= friction;
    const velocity = Math.hypot(state.player.vx, state.player.vy);
    if (velocity > speed) {
      state.player.vx = state.player.vx / velocity * speed;
      state.player.vy = state.player.vy / velocity * speed;
    }
    state.player.x = clamp(state.player.x + state.player.vx * delta, 20, state.width - 20);
    state.player.y = clamp(state.player.y + state.player.vy * delta, 72, state.height - 20);

    if (state.trails.length === 0 || distance(state.player, state.trails[state.trails.length - 1]) > 4) {
      state.trails.push({ x: state.player.x, y: state.player.y, life: 1 });
    }
    state.trails.forEach(point => point.life -= delta * 1.2);
    state.trails = state.trails.filter(point => point.life > 0).slice(-44);

    state.particles.forEach(particle => {
      particle.y += particle.speed * delta;
      if (particle.y > state.height + 4) {
        particle.y = -4;
        particle.x = random(0, state.width);
      }
    });

    state.hazards.forEach(hazard => {
      hazard.x += hazard.vx * delta;
      hazard.y += hazard.vy * delta;
      if (hazard.x < 26 || hazard.x > state.width - 26) hazard.vx *= -1;
      if (hazard.y < 96 || hazard.y > state.height - 26) hazard.vy *= -1;
      if (distance(state.player, hazard) < state.player.r + hazard.r + 3 && now > state.nextNoiseHitAt) {
        state.clarity = Math.max(0, state.clarity - 18);
        state.score = Math.max(0, state.score - 90);
        state.nextNoiseHitAt = now + 950;
        state.player.vx += (state.player.x - hazard.x) * 5;
        state.player.vy += (state.player.y - hazard.y) * 5;
        liveRegion.textContent = '碰到噪声，清晰度下降。';
      }
    });

    const target = state.nodes[state.mission];
    if (target && distance(state.player, target) < state.player.r + target.r + 13) {
      target.collected = true;
      const speedBonus = Math.max(0, Math.ceil(state.time)) * 3;
      state.score += 280 + speedBonus + state.mission * 70;
      state.clarity = Math.min(100, state.clarity + 8);
      state.mission += 1;
      liveRegion.textContent = `${target.name} 节点已连接。${state.mission < missionNames.length ? `下一个节点 ${missionNames[state.mission]}。` : '所有节点已连接。'}`;
      updateHud();
      if (state.mission >= missionNames.length) {
        window.setTimeout(() => endGame(true), 260);
      }
    }
    updateHud();
  }

  function line(x1, y1, x2, y2, color, alpha = 1, width = 1) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawBackground(now) {
    ctx.fillStyle = '#070907';
    ctx.fillRect(0, 0, state.width, state.height);

    const gradient = ctx.createRadialGradient(
      state.player.x, state.player.y, 0,
      state.player.x, state.player.y, Math.max(state.width, state.height) * .5
    );
    gradient.addColorStop(0, 'rgba(200,255,72,.075)');
    gradient.addColorStop(.5, 'rgba(114,231,255,.025)');
    gradient.addColorStop(1, 'rgba(7,9,7,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.035)';
    const grid = 54;
    const xOffset = (now * .004) % grid;
    for (let x = -grid + xOffset; x < state.width + grid; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.height; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    state.particles.forEach(particle => {
      ctx.globalAlpha = particle.a;
      ctx.fillStyle = '#dce8dc';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawNetwork(now) {
    const activeNodes = state.nodes.slice(0, Math.min(state.mission + 1, state.nodes.length));
    activeNodes.forEach((node, index) => {
      if (index > 0) {
        const previous = state.nodes[index - 1];
        line(previous.x, previous.y, node.x, node.y, node.collected ? node.color : '#506050', node.collected ? .45 : .12);
      }
    });

    state.nodes.forEach((node, index) => {
      const active = index === state.mission && state.mode === 'running';
      const locked = index > state.mission;
      const pulse = 1 + Math.sin(now * .003 + node.phase) * .12;

      if (!locked) {
        ctx.globalAlpha = node.collected ? .13 : .08;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 3.7 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = locked ? .22 : 1;
      ctx.strokeStyle = locked ? '#657067' : node.color;
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = node.collected ? node.color : '#0a0d0b';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.collected ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = locked ? .25 : .78;
      ctx.fillStyle = '#f4f7f0';
      ctx.font = '500 10px JetBrains Mono, monospace';
      ctx.letterSpacing = '1px';
      ctx.fillText(node.name, node.x + 24, node.y + 4);
      ctx.globalAlpha = 1;
    });
  }

  function drawHazards(now) {
    state.hazards.forEach(hazard => {
      const pulse = 1 + Math.sin(now * .004 + hazard.phase) * .08;
      ctx.globalAlpha = .08;
      ctx.fillStyle = '#ff5f50';
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = .62;
      ctx.strokeStyle = '#ff6658';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      line(hazard.x - 5, hazard.y - 5, hazard.x + 5, hazard.y + 5, '#ff6658', .55);
      line(hazard.x + 5, hazard.y - 5, hazard.x - 5, hazard.y + 5, '#ff6658', .55);
      ctx.globalAlpha = 1;
    });
  }

  function drawPlayer(now) {
    if (state.trails.length > 1) {
      ctx.beginPath();
      state.trails.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      const trailGradient = ctx.createLinearGradient(
        state.trails[0].x, state.trails[0].y,
        state.player.x, state.player.y
      );
      trailGradient.addColorStop(0, 'rgba(114,231,255,0)');
      trailGradient.addColorStop(1, 'rgba(200,255,72,.64)');
      ctx.strokeStyle = trailGradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const pulse = 1 + Math.sin(now * .006) * .08;
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#c8ff48';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 32 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const halo = ctx.createRadialGradient(
      state.player.x, state.player.y, 0,
      state.player.x, state.player.y, 16
    );
    halo.addColorStop(0, '#f4f7f0');
    halo.addColorStop(.32, '#c8ff48');
    halo.addColorStop(1, 'rgba(200,255,72,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(now) {
    drawBackground(now);
    drawNetwork(now);
    drawHazards(now);
    drawPlayer(now);
  }

  function frame(now) {
    const delta = Math.min(.034, Math.max(0, (now - state.lastFrame) / 1000 || 0));
    state.lastFrame = now;
    update(delta, now);
    draw(now);
    requestAnimationFrame(frame);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  resize();
  updateHud();
  requestAnimationFrame(frame);
})();
