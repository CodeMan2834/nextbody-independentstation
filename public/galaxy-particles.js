/**
 * Galaxy starfield v8 — nebula + spiral arms + sparse meteors & distant drifters.
 * Global: window.createGalaxyField(canvas, opts)
 */
(function () {
  'use strict';

  function createGalaxyField(canvas, opts) {
    opts = opts || {};
    const mobile = window.innerWidth < 768;
    const cfg = {
      dustCount: opts.dustCount != null ? opts.dustCount : (mobile ? 1100 : 3400),
      armCount: opts.armCount != null ? opts.armCount : (mobile ? 800 : 2800),
      arms: opts.arms != null ? opts.arms : 5,
      rotationSpeed: opts.rotationSpeed != null ? opts.rotationSpeed : 0.00072,
      nebulaSpeed: opts.nebulaSpeed != null ? opts.nebulaSpeed : 0.0002,
      colors: opts.colors || ['#ffffff', '#d0e4ff', '#9ec5ff', '#6eb5ff', '#0066ff'],
      coreGlow: opts.coreGlow || 'rgba(100,160,255,0.42)',
      nebulaA: opts.nebulaA || 'rgba(40,80,160,0.22)',
      nebulaB: opts.nebulaB || 'rgba(20,0,60,0.14)',
      nebulaOuter: opts.nebulaOuter || 'rgba(3,5,16,0.94)',
      mouseInfluence: opts.mouseInfluence != null ? opts.mouseInfluence : 0.05,
      meteorMax: opts.meteorMax != null ? opts.meteorMax : (mobile ? 1 : 2),
      meteorMinGap: opts.meteorMinGap != null ? opts.meteorMinGap : 2800,
      meteorMaxGap: opts.meteorMaxGap != null ? opts.meteorMaxGap : 7500,
      drifterCount: opts.drifterCount != null ? opts.drifterCount : (mobile ? 1 : 3),
    };

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, cx = 0, cy = 0, dpr = 1;
    let angle = 0;
    let nebulaAngle = 0;
    let mx = 0.5, my = 0.5;
    let raf = 0;
    let running = true;
    let scrollBlend = 0;
    let scale = 800;
    let lastTime = 0;
    let nextMeteorAt = 0;

    canvas.dataset.galaxyVersion = '8';

    const dust = [];
    for (let i = 0; i < cfg.dustCount; i++) {
      dust.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 0.7 + 0.25,
        alpha: Math.random() * 0.4 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        twSpeed: 0.5 + Math.random() * 2.2,
        color: Math.random() > 0.65 ? cfg.colors[1] : '#ffffff',
      });
    }

    const arms = [];
    for (let i = 0; i < cfg.armCount; i++) {
      const arm = i % cfg.arms;
      const t = Math.random() * Math.PI * 9;
      const radius = 0.04 + Math.pow(Math.random(), 0.7) * 0.96;
      const spread = (Math.random() - 0.5) * 0.07;
      const depth = Math.random();
      arms.push({
        arm,
        t,
        radius,
        spread,
        depth,
        size: Math.random() * 0.55 + 0.18,
        alpha: (0.25 + Math.random() * 0.55) * (0.45 + radius * 0.55),
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        twinkle: Math.random() * Math.PI * 2,
        bright: Math.random() > 0.9,
      });
    }

    const meteors = [];
    const drifters = [];

    function initDrifters() {
      drifters.length = 0;
      for (let i = 0; i < cfg.drifterCount; i++) {
        const edge = Math.random();
        drifters.push({
          x: edge > 0.5 ? Math.random() * w : (Math.random() > 0.5 ? -scale * 0.08 : w + scale * 0.08),
          y: Math.random() * h * 0.75 + h * 0.08,
          vx: (Math.random() - 0.5) * 0.06,
          vy: 0.015 + Math.random() * 0.035,
          size: 1.4 + Math.random() * 1.2,
          alpha: 0.05 + Math.random() * 0.07,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.4 + Math.random() * 0.5,
        });
      }
    }

    function scheduleMeteor(fromNow) {
      nextMeteorAt = fromNow + cfg.meteorMinGap + Math.random() * (cfg.meteorMaxGap - cfg.meteorMinGap);
    }

    function spawnMeteor() {
      // Top-left → bottom-right, always crosses the visible viewport
      const speed = 14 + Math.random() * 10;
      const angle = (Math.PI / 180) * (34 + Math.random() * 22);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let x, y;

      if (Math.random() > 0.4) {
        x = Math.random() * w * 0.92;
        y = -(24 + Math.random() * 90);
      } else {
        x = -(24 + Math.random() * 100);
        y = Math.random() * h * 0.42;
      }

      meteors.push({
        x,
        y,
        vx,
        vy,
        tail: 110 + Math.random() * 100,
        width: 1.1 + Math.random() * 0.9,
        life: 1,
        fade: 0.0028 + Math.random() * 0.002,
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      scale = Math.min(w, h);
      initDrifters();
    }

    function drawStar(x, y, sz, alpha, color, glow) {
      const a = alpha * (1 - scrollBlend * 0.7);
      if (a <= 0.02) return;

      ctx.globalCompositeOperation = 'lighter';
      if (glow) {
        ctx.globalAlpha = a * 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, sz * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(sz, 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawNebula() {
      const fade = 1 - scrollBlend * 0.4;
      ctx.globalAlpha = fade;
      ctx.fillStyle = cfg.nebulaOuter;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(nebulaAngle);
      ctx.globalCompositeOperation = 'screen';

      const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.55);
      g1.addColorStop(0, cfg.coreGlow);
      g1.addColorStop(0.2, cfg.nebulaA);
      g1.addColorStop(0.55, 'rgba(0,20,50,0.06)');
      g1.addColorStop(1, 'transparent');
      ctx.globalAlpha = fade * 0.85;
      ctx.fillStyle = g1;
      ctx.fillRect(-scale * 0.6, -scale * 0.6, scale * 1.2, scale * 1.2);

      ctx.rotate(0.9);
      const g2 = ctx.createRadialGradient(scale * 0.08, 0, 0, 0, 0, scale * 0.45);
      g2.addColorStop(0, cfg.nebulaB);
      g2.addColorStop(0.45, 'transparent');
      ctx.globalAlpha = fade * 0.65;
      ctx.fillStyle = g2;
      ctx.fillRect(-scale * 0.5, -scale * 0.5, scale, scale);

      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      const edge = ctx.createRadialGradient(cx, cy, scale * 0.28, cx, cy, scale * 0.98);
      edge.addColorStop(0, 'transparent');
      edge.addColorStop(0.78, 'transparent');
      edge.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.globalAlpha = fade;
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    function drawDust() {
      for (let i = 0; i < dust.length; i++) {
        const p = dust[i];
        const tw = 0.55 + Math.sin(p.twinkle + angle * p.twSpeed) * 0.45;
        drawStar(p.x * w, p.y * h, p.size, p.alpha * tw, p.color, false);
      }
    }

    function drawArms(rot) {
      for (let i = 0; i < arms.length; i++) {
        const p = arms[i];
        const armAngle = (p.arm / cfg.arms) * Math.PI * 2;
        const theta = p.t + armAngle + rot;
        const r = p.radius * scale * 0.5;
        const x = cx + Math.cos(theta) * r + p.spread * w;
        const y = cy + Math.sin(theta) * r * 0.36 + p.spread * h * 0.75;
        const tw = 0.58 + Math.sin(p.twinkle + angle * 2.2) * 0.42;
        const depthFade = 0.5 + p.depth * 0.5;
        drawStar(x, y, p.size, p.alpha * tw * depthFade, p.color, p.bright);
      }
    }

    function drawDrifters() {
      const fade = 1 - scrollBlend * 0.55;
      if (fade <= 0.05) return;

      for (let i = 0; i < drifters.length; i++) {
        const d = drifters[i];
        const pulse = 0.75 + Math.sin(d.pulse) * 0.25;
        const a = d.alpha * pulse * fade;
        if (a <= 0.01) continue;

        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.28;
        ctx.fillStyle = 'rgba(160,195,255,0.35)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = 'rgba(220,235,255,0.75)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }

    function updateDrifters(dt) {
      for (let i = 0; i < drifters.length; i++) {
        const d = drifters[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.pulse += d.pulseSpeed * 0.016 * dt;
        if (d.x < -scale * 0.12) d.x = w + scale * 0.08;
        if (d.x > w + scale * 0.12) d.x = -scale * 0.08;
        if (d.y > h + scale * 0.1) d.y = -scale * 0.06;
      }
    }

    function drawMeteors(dt) {
      const fade = 1 - scrollBlend * 0.35;
      if (fade <= 0.05) return;

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const spd = Math.hypot(m.vx, m.vy) || 1;
        const nx = m.vx / spd;
        const ny = m.vy / spd;
        const tailX = m.x - nx * m.tail;
        const tailY = m.y - ny * m.tail;
        const headAlpha = 0.62 * m.life * fade;

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineWidth = m.width;
        const streak = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        streak.addColorStop(0, 'rgba(160,200,255,0)');
        streak.addColorStop(0.45, 'rgba(200,225,255,' + (headAlpha * 0.35) + ')');
        streak.addColorStop(0.82, 'rgba(235,245,255,' + (headAlpha * 0.72) + ')');
        streak.addColorStop(1, 'rgba(255,255,255,' + Math.min(headAlpha * 1.05, 0.85) + ')');
        ctx.strokeStyle = streak;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.globalAlpha = Math.min(headAlpha * 0.85, 0.75);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.life -= m.fade * dt;
        if (
          m.life <= 0 ||
          m.x < -200 || m.x > w + 200 ||
          m.y < -200 || m.y > h + 200
        ) {
          meteors.splice(i, 1);
        }
      }
    }

    function frame(now) {
      if (!running) return;
      if (document.hidden) {
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 16.667, 2.5);
      lastTime = now;

      ctx.clearRect(0, 0, w, h);
      drawNebula();

      const parallaxX = (mx - 0.5) * cfg.mouseInfluence * w;
      const parallaxY = (my - 0.5) * cfg.mouseInfluence * h;
      ctx.save();
      ctx.translate(parallaxX, parallaxY);
      ctx.translate(cx, cy);
      ctx.scale(1 + scrollBlend * 0.25, 1 + scrollBlend * 0.25);
      ctx.translate(-cx, -cy);

      drawDust();
      drawArms(angle);
      updateDrifters(dt);
      drawDrifters();
      angle += cfg.rotationSpeed * dt;
      nebulaAngle += cfg.nebulaSpeed * dt;
      ctx.restore();

      if (meteors.length < cfg.meteorMax && now >= nextMeteorAt) {
        spawnMeteor();
        scheduleMeteor(now);
      }
      drawMeteors(dt);

      raf = requestAnimationFrame(frame);
    }

    function start() {
      resize();
      scheduleMeteor(performance.now() + 900 + Math.random() * 1400);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        drawNebula();
        drawDust();
        drawArms(0);
        return;
      }
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    });

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);

    return {
      setScrollBlend: function (v) { scrollBlend = Math.max(0, Math.min(1, v)); },
      destroy: function () {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
      },
    };
  }

  window.createGalaxyField = createGalaxyField;
})();
