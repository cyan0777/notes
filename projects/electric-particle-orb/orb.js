const canvas = document.querySelector("#orb");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

const morph = document.querySelector("#current");
const speed = document.querySelector("#speed");
const bloom = document.querySelector("#bloom");
const pause = document.querySelector("#pause");

const quality = {
  desktopParticles: 1180,
  mobileParticles: 680,
  desktopInitialParticles: 460,
  mobileInitialParticles: 240,
  desktopGrowBatch: 38,
  mobileGrowBatch: 24,
  desktopCaustics: 70,
  mobileCaustics: 44,
  maxDpr: 1.35,
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = {
  width: 0,
  height: 0,
  dpr: 1,
  running: !reducedMotion,
  time: 0,
  lastTime: performance.now(),
  lastPaint: 0,
  particles: [],
  impacts: [],
  caustics: [],
  targetParticles: 0,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.round(state.width * state.dpr);
  canvas.height = Math.round(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
}

function orbMetrics() {
  const mobile = state.width < 720;
  return {
    cx: state.width * (mobile ? 0.5 : 0.42),
    cy: state.height * (mobile ? 0.36 : 0.48),
    radius: Math.min(state.width, state.height) * (mobile ? 0.31 : 0.34),
  };
}

function makeParticle(spread = false) {
  const angle = Math.random() * Math.PI * 2;
  const depth = randomBetween(-1, 1);
  const sideBias = Math.pow(Math.random(), 2.2);
  const start = randomBetween(0.01, 0.16) * sideBias;
  const warm = Math.random();
  const life = randomBetween(0.92, 1.08);
  const radius = spread ? randomBetween(0.02, life * 0.98) : start;

  return {
    angle,
    radius,
    capture: randomBetween(0.9, 0.99),
    speed: randomBetween(0.34, 1.18) * (warm > 0.82 ? 1.42 : 1),
    drift: randomBetween(-0.42, 0.42),
    wobble: randomBetween(0.6, 2.1),
    depth,
    size: randomBetween(0.35, 1.18) * (warm > 0.92 ? 1.8 : 1),
    life,
    age: spread ? radius : randomBetween(0, 0.16),
    hue: randomBetween(210, 330),
    prism: Math.random(),
  };
}

function makeCaustic(index, total) {
  const lane = index / total;
  const jitter = randomBetween(-0.5, 0.5) / total;
  const angle = (lane + jitter) * Math.PI * 2;
  const longRibbon = Math.random() > 0.42;

  return {
    angle,
    start: randomBetween(0.08, 0.28),
    end: randomBetween(longRibbon ? 0.66 : 0.44, 0.95),
    bend: randomBetween(-1, 1),
    width: randomBetween(0.45, longRibbon ? 1.15 : 0.82),
    alpha: randomBetween(0.22, longRibbon ? 0.48 : 0.34),
    phase: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.28, 0.88),
    ripple: randomBetween(0.7, 1.9),
    hue: randomBetween(215, 286),
  };
}

function rebuildCaustics() {
  const count = state.width < 720 ? quality.mobileCaustics : quality.desktopCaustics;
  state.caustics = Array.from({ length: count }, (_, index) => makeCaustic(index, count));
}

function desiredParticleCount() {
  return state.width < 720 ? quality.mobileParticles : quality.desktopParticles;
}

function rebuildParticles() {
  state.targetParticles = desiredParticleCount();
  if (state.particles.length > state.targetParticles) {
    state.particles.splice(state.targetParticles);
  }
}

function seedInitialParticles() {
  state.targetParticles = desiredParticleCount();
  const firstPaintCount = Math.min(
    state.targetParticles,
    state.width < 720 ? quality.mobileInitialParticles : quality.desktopInitialParticles,
  );
  state.particles = Array.from({ length: firstPaintCount }, () => makeParticle(true));
}

function growParticlePool() {
  if (state.particles.length >= state.targetParticles) {
    return;
  }

  const missing = state.targetParticles - state.particles.length;
  const batch = Math.min(missing, state.width < 720 ? quality.mobileGrowBatch : quality.desktopGrowBatch);
  for (let i = 0; i < batch; i += 1) {
    state.particles.push(makeParticle(true));
  }
}

function drawGlow(cx, cy, radius, alpha) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.2, `rgba(248, 250, 255, ${alpha * 0.62})`);
  gradient.addColorStop(0.44, `rgba(218, 226, 255, ${alpha * 0.18})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawStretchedParticle(x, y, angle, length, width, alpha, hue, prism) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const colorA =
    prism > 0.82
      ? `hsla(${hue}, 72%, 82%, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;
  const colorB =
    prism > 0.72
      ? `hsla(${(hue + 64) % 360}, 70%, 78%, ${alpha * 0.28})`
      : `rgba(228, 234, 255, ${alpha * 0.26})`;

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(length, width));
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(0.42, colorB);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.scale(length, width);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMicroFleck(x, y, angle, length, width, alpha, hue, prism) {
  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;

  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(238, 246, 255, 0.58)";
  ctx.shadowBlur = width * 1.8;
  ctx.strokeStyle =
    prism > 0.7 ? `hsla(${hue}, 64%, 86%, ${alpha * 0.65})` : `rgba(248, 252, 255, ${alpha})`;
  ctx.lineWidth = Math.max(0.45, width);
  ctx.beginPath();
  ctx.moveTo(x - dx * 0.42, y - dy * 0.42);
  ctx.lineTo(x + dx, y + dy);
  ctx.stroke();
  ctx.restore();
}

function drawCaptureDot(x, y, tangent, width, alpha, hue, prism) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tangent);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(
    0.38,
    prism > 0.75 ? `hsla(${hue}, 62%, 84%, ${alpha * 0.42})` : `rgba(238, 244, 255, ${alpha * 0.38})`,
  );
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.scale(1.9, 0.72);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLiquidCaustics(cx, cy, radius, current, bloomAmount, alphaScale = 1) {
  const yScale = 0.88;
  const time = state.time;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const ribbon of state.caustics) {
    const pulse = 0.5 + 0.5 * Math.sin(time * ribbon.speed + ribbon.phase);
    const waveA = Math.sin(time * ribbon.ripple + ribbon.phase);
    const waveB = Math.sin(time * (ribbon.ripple * 0.62) + ribbon.phase * 1.7);
    const angle = ribbon.angle + waveA * 0.026 * (0.5 + current);
    const tangent = angle + Math.PI / 2;
    const start = ribbon.start + waveB * 0.018;
    const end = ribbon.end + pulse * 0.026;
    const x1 = cx + Math.cos(angle) * radius * start;
    const y1 = cy + Math.sin(angle) * radius * start * yScale;
    const x3 = cx + Math.cos(angle) * radius * end;
    const y3 = cy + Math.sin(angle) * radius * end * yScale;
    const mid = (start + end) * 0.5;
    const bend = radius * ribbon.bend * (0.045 + current * 0.035) * (0.35 + pulse);
    const x2 = cx + Math.cos(angle) * radius * mid + Math.cos(tangent) * bend;
    const y2 = cy + Math.sin(angle) * radius * mid * yScale + Math.sin(tangent) * bend * 0.68;
    const alpha = ribbon.alpha * alphaScale * (0.44 + pulse * 0.74) * (0.72 + bloomAmount * 0.34);
    const width = radius * (0.002 + ribbon.width * 0.0038) * (0.72 + current * 0.42);

    ctx.shadowColor = "rgba(238, 246, 255, 0.66)";
    ctx.shadowBlur = width * 6;
    ctx.strokeStyle = `rgba(226, 236, 255, ${alpha * 0.2})`;
    ctx.lineWidth = width * 3.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();

    ctx.shadowBlur = width * 2;
    ctx.strokeStyle = `hsla(${ribbon.hue + waveA * 22}, 72%, 84%, ${alpha * 0.27})`;
    ctx.lineWidth = width * 1.12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();

    if (pulse > 0.62) {
      const spotT = 0.48 + waveB * 0.18;
      const sx = (1 - spotT) * (1 - spotT) * x1 + 2 * (1 - spotT) * spotT * x2 + spotT * spotT * x3;
      const sy = (1 - spotT) * (1 - spotT) * y1 + 2 * (1 - spotT) * spotT * y2 + spotT * spotT * y3;
      drawStretchedParticle(
        sx,
        sy,
        angle + waveA * 0.08,
        width * (2.8 + pulse * 4.6),
        width * (0.72 + pulse * 1.1),
        alpha * 0.82,
        ribbon.hue,
        1,
      );
    }
  }

  const rippleRadius = radius * (0.22 + Math.sin(time * 1.2) * 0.012);
  const ripple = ctx.createRadialGradient(cx, cy, rippleRadius * 0.24, cx, cy, rippleRadius * 1.5);
  ripple.addColorStop(0, `rgba(255, 255, 255, ${0.1 + bloomAmount * 0.08})`);
  ripple.addColorStop(0.38, `rgba(232, 240, 255, ${0.07 + current * 0.04})`);
  ripple.addColorStop(0.64, `rgba(204, 220, 255, ${0.024 + current * 0.028})`);
  ripple.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = ripple;
  ctx.beginPath();
  ctx.arc(cx, cy, rippleRadius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAbsorptionChannel(x, y, ringX, ringY, angle, width, alpha, hue, prism, bend) {
  const midX = (x + ringX) * 0.5;
  const midY = (y + ringY) * 0.5;
  const tangent = angle + Math.PI / 2;
  const controlX = midX + Math.cos(tangent) * bend;
  const controlY = midY + Math.sin(tangent) * bend;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(245, 250, 255, 0.72)";
  ctx.shadowBlur = width * 3.2;

  ctx.strokeStyle = `rgba(225, 234, 255, ${alpha * 0.2})`;
  ctx.lineWidth = width * 3.4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(controlX, controlY, ringX, ringY);
  ctx.stroke();

  const chroma =
    prism > 0.68
      ? `hsla(${hue}, 64%, 82%, ${alpha * 0.2})`
      : `rgba(250, 252, 255, ${alpha * 0.18})`;
  ctx.shadowBlur = width * 1.8;
  ctx.strokeStyle = chroma;
  ctx.lineWidth = width * 1.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(controlX, controlY, ringX, ringY);
  ctx.stroke();

  ctx.shadowBlur = width;
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = width * 0.58;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(controlX, controlY, ringX, ringY);
  ctx.stroke();

  ctx.restore();
}

function addRingImpact(angle, depth, hue, energy) {
  state.impacts.push({
    angle,
    depth,
    hue,
    energy,
    age: 0,
    life: randomBetween(0.32, 0.68),
    drift: randomBetween(-0.16, 0.16),
    width: randomBetween(0.75, 1.55),
  });

  if (state.impacts.length > 70) {
    state.impacts.splice(0, state.impacts.length - 70);
  }
}

function drawOrbMask(cx, cy, radius) {
  const rim = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.03);
  rim.addColorStop(0, "rgba(255, 255, 255, 0)");
  rim.addColorStop(0.78, "rgba(255, 255, 255, 0.002)");
  rim.addColorStop(0.94, "rgba(255, 255, 255, 0.01)");
  rim.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawAbsorptionRing(cx, cy, radius, current, bloomAmount) {
  const ringRadius = radius * 0.92;
  const time = state.time;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";

  for (let layer = 0; layer < 3; layer += 1) {
    const count = layer === 0 ? 20 : 12;
    const lineWidth = radius * (0.0055 + layer * 0.0032);
    const alphaBase = (0.034 + bloomAmount * 0.028) * (1 - layer * 0.24);

    for (let i = 0; i < count; i += 1) {
      const jitter = Math.sin(i * 12.9898 + layer * 78.233) * 43758.5453;
      const seed = jitter - Math.floor(jitter);
      const phase =
        ((i + seed * 0.78) / count) * Math.PI * 2 +
        time * (0.34 + layer * 0.16 + seed * 0.22);
      const arc = 0.06 + seed * 0.15 + Math.sin(time * 1.3 + i) * 0.016 + current * 0.035;
      const pulse = 0.24 + 0.76 * Math.max(0, Math.sin(time * (1.2 + seed * 2.4) + i * 1.7));
      const hue = 245 + Math.sin(i * 2.4 + time) * 42;
      const r = ringRadius * (1 + Math.sin(time * 0.9 + i) * 0.008 + layer * 0.018);

      ctx.strokeStyle =
        pulse > 0.78
          ? `hsla(${hue}, 55%, 82%, ${alphaBase * (0.6 + pulse)})`
          : `rgba(255, 255, 255, ${alphaBase * pulse})`;
      ctx.lineWidth = lineWidth * (0.55 + pulse * 0.9);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, r, phase, phase + arc);
      ctx.stroke();
    }
  }

  const halo = ctx.createRadialGradient(0, 0, ringRadius * 0.78, 0, 0, ringRadius * 1.06);
  halo.addColorStop(0, "rgba(255, 255, 255, 0)");
  halo.addColorStop(0.58, `rgba(255, 255, 255, ${0.012 + bloomAmount * 0.014})`);
  halo.addColorStop(0.82, `rgba(230, 235, 255, ${0.034 + bloomAmount * 0.03})`);
  halo.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius * 1.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRingImpacts(cx, cy, radius, dt, current) {
  const ringRadius = radius * 0.92;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = state.impacts.length - 1; i >= 0; i -= 1) {
    const impact = state.impacts[i];
    impact.age += dt;
    const t = impact.age / impact.life;
    if (t >= 1) {
      state.impacts.splice(i, 1);
      continue;
    }

    const fade = Math.pow(1 - t, 1.85);
    const bloom = Math.sin(t * Math.PI);
    const angle = impact.angle + impact.drift * t;
    const x = cx + Math.cos(angle) * ringRadius;
    const y = cy + Math.sin(angle) * ringRadius * (0.89 + impact.depth * 0.035);
    const tangent = angle + Math.PI / 2;
    const width = radius * (0.007 + impact.energy * 0.024) * impact.width;
    const alpha = (0.18 + impact.energy * 0.58) * fade * (0.54 + current * 0.78);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(245, 250, 255, 0.64)";
    ctx.shadowBlur = width * 3.6;
    ctx.strokeStyle =
      impact.energy > 0.58
        ? `hsla(${impact.hue}, 58%, 84%, ${alpha * 0.2})`
        : `rgba(246, 250, 255, ${alpha * 0.16})`;
    ctx.lineWidth = width * (0.42 + bloom * 0.6);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius * (1 + bloom * 0.014), angle - bloom * 0.075, angle + bloom * 0.105);
    ctx.stroke();
    ctx.restore();

    drawCaptureDot(x, y, tangent, width, alpha, impact.hue, impact.energy);

    const inwardX = cx + Math.cos(angle) * ringRadius * (0.96 - bloom * 0.08);
    const inwardY = cy + Math.sin(angle) * ringRadius * (0.96 - bloom * 0.08) * (0.89 + impact.depth * 0.035);
    drawStretchedParticle(
      (x + inwardX) * 0.5,
      (y + inwardY) * 0.5,
      angle,
      radius * (0.028 + impact.energy * 0.07) * fade,
      radius * (0.004 + impact.energy * 0.01),
      alpha * 0.36,
      impact.hue + 30,
      1,
    );
  }

  ctx.restore();
}

function drawOuterSparkleBand(cx, cy, radius, current, bloomAmount) {
  const ringRadius = radius * 0.88;
  const time = state.time;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < state.caustics.length; i += 2) {
    const fleck = state.caustics[i];
    const pulse = Math.max(0, Math.sin(time * (0.9 + fleck.speed) + fleck.phase));
    if (pulse < 0.16) {
      continue;
    }

    const angle = fleck.angle + Math.sin(time * 0.6 + fleck.phase) * 0.018;
    const r = ringRadius * (0.94 + pulse * 0.07 + Math.sin(fleck.phase) * 0.02);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.88;
    const size = radius * (0.004 + fleck.width * 0.0045) * (0.7 + pulse);
    const alpha = (0.08 + pulse * 0.34) * (0.72 + current * 0.35 + bloomAmount * 0.18);

    drawStretchedParticle(
      x,
      y,
      angle + Math.PI / 2,
      size * (1.8 + pulse * 2.4),
      size * (0.58 + pulse * 0.5),
      alpha,
      fleck.hue,
      1,
    );
  }

  ctx.restore();
}

function updateParticle(particle, dt, current) {
  particle.age += dt * particle.speed * (0.52 + current * 0.95);
  particle.radius += dt * particle.speed * (0.3 + current * 0.62);
  particle.angle += particle.drift * dt * (0.18 + current * 0.18);

  if (particle.radius > particle.life || particle.age > particle.life * 1.2) {
    Object.assign(particle, makeParticle());
  }
}

function render(now) {
  const minFrameMs = state.running ? 1000 / 42 : 1000 / 12;
  if (now - state.lastPaint < minFrameMs) {
    requestAnimationFrame(render);
    return;
  }
  state.lastPaint = now;

  const rawDt = Math.min(34, now - state.lastTime) / 1000;
  state.lastTime = now;
  const dt = state.running ? rawDt * (Number(speed.value) / 72) : 0;
  state.time += dt;
  growParticlePool();

  const current = Number(morph.value) / 100;
  const bloomAmount = Number(bloom.value) / 100;
  const { cx, cy, radius } = orbMetrics();

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(2, 4, 11, ${0.2 - bloomAmount * 0.06})`;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.globalCompositeOperation = "lighter";
  drawGlow(cx, cy, radius * (0.46 + bloomAmount * 0.22), 0.11 + bloomAmount * 0.08);
  drawLiquidCaustics(cx, cy, radius, current, bloomAmount, 0.72);

  for (const particle of state.particles) {
    updateParticle(particle, dt, current);

    const progress = Math.min(1, particle.radius / particle.life);
    const shell = Math.sin(progress * Math.PI);
    const ringPull = Math.max(0, 1 - Math.abs(progress - particle.capture) / 0.18);
    const absorption = Math.pow(ringPull, 3);
    const captureProgress = Math.max(0, (progress - particle.capture) / (1 - particle.capture));
    const perspective = 0.74 + (particle.depth + 1) * 0.18;
    const wobble =
      Math.sin(state.time * particle.wobble + particle.prism * 10) * 0.025 * current +
      Math.sin(progress * Math.PI * 2 + particle.prism * 4) * 0.018;
    const refract =
      (Math.sin(progress * 15 + state.time * 1.35 + particle.prism * 9) * 0.024 +
        Math.sin(progress * 31 - state.time * 0.86 + particle.depth * 5) * 0.012) *
      (0.35 + current * 0.9) *
      Math.sin(progress * Math.PI);
    const displayAngle = particle.angle + refract;
    const targetRing = 0.94 / perspective;
    const radial = particle.radius + wobble;
    const capturedRadius = radial + (targetRing - radial) * absorption * 1.08;
    const r = radius * capturedRadius * perspective;
    const x = cx + Math.cos(displayAngle) * r;
    const y = cy + Math.sin(displayAngle) * r * (0.88 + particle.depth * 0.07);
    const ringX = cx + Math.cos(displayAngle) * radius * 0.92;
    const ringY = cy + Math.sin(displayAngle) * radius * 0.92 * (0.88 + particle.depth * 0.04);
    const fadeIn = Math.min(1, progress * 7);
    const fadeOut = Math.min(1, (1 - progress) * 5.8) * (1 - captureProgress * 0.46);
    const alpha =
      (0.055 + shell * 0.42 + absorption * 0.55) *
      fadeIn *
      fadeOut *
      (0.46 + perspective * 0.62);
    const elongation =
      (0.48 + progress * 1.9) * (0.42 + current * 0.58) * (1 - absorption * 0.44);
    const width = particle.size * (0.56 + shell * 0.72 + absorption * 1.72) * perspective;
    const length = particle.size * (0.78 + elongation) * perspective;

    drawStretchedParticle(
      x,
      y,
      displayAngle + refract * 0.8,
      length,
      width,
      alpha,
      particle.hue,
      particle.prism,
    );

    if (progress > 0.12 && particle.prism > 0.18) {
      drawMicroFleck(
        x + Math.cos(displayAngle + Math.PI / 2) * width * 0.9,
        y + Math.sin(displayAngle + Math.PI / 2) * width * 0.62,
        displayAngle + refract * 1.4,
        length * (1.8 + particle.prism * 2.4),
        width * (0.38 + shell * 0.34),
        alpha * (0.5 + shell * 0.52),
        particle.hue,
        particle.prism,
      );
    }

    if (progress > 0.72 && particle.prism > 0.78) {
      const bridge = Math.min(1, (progress - 0.7) / 0.24) * (0.7 + current * 0.95);
      const distanceToRing = Math.hypot(ringX - x, ringY - y);
      const bridgeAlpha = Math.min(0.5, (0.045 + bridge * 0.34) * fadeOut);
      if (distanceToRing > 3 && bridgeAlpha > 0.015) {
        drawAbsorptionChannel(
          x,
          y,
          ringX,
          ringY,
          displayAngle,
          width * (0.26 + bridge * 0.28),
          bridgeAlpha * 0.9,
          particle.hue + 18,
          1,
          Math.sin(state.time * 2.2 + particle.prism * 11) * radius * 0.014,
        );
      }

      drawCaptureDot(
        ringX,
        ringY,
        displayAngle + Math.PI / 2,
        radius * (0.01 + bridge * 0.04) * perspective,
        Math.min(0.72, (0.08 + bridge * 0.48) * fadeOut),
        particle.hue,
        particle.prism,
      );
    }

    if (absorption > 0.02 && particle.prism > 0.58) {
      const pullLength = Math.max(4, Math.hypot(ringX - x, ringY - y) * (0.86 + absorption * 0.32));
      drawAbsorptionChannel(
        x,
        y,
        ringX,
        ringY,
        displayAngle,
        Math.max(width * (0.52 + absorption * 0.62), pullLength * 0.018),
        Math.min(0.52, alpha * (0.18 + absorption * 1.34)),
        particle.hue + 24,
        1,
        Math.sin(state.time * 2.8 + particle.prism * 14) * radius * 0.018,
      );
      drawCaptureDot(
        ringX,
        ringY,
        displayAngle + Math.PI / 2,
        radius * (0.02 + absorption * 0.06) * perspective,
        Math.min(0.78, (0.14 + absorption * 0.72) * (0.68 + current * 0.78)),
        particle.hue,
        particle.prism,
      );
      if (absorption > 0.32 && Math.random() < (0.01 + current * 0.026)) {
        addRingImpact(displayAngle, particle.depth, particle.hue, absorption);
      }
    }

    if (progress < 0.45 && Math.random() < 0.02 + current * 0.035) {
      drawStretchedParticle(
        x,
        y,
        displayAngle + randomBetween(-0.08, 0.08),
        length * randomBetween(1.1, 1.9),
        width * 0.58,
        alpha * 0.18,
        particle.hue + 40,
        1,
      );
    }
  }

  drawLiquidCaustics(cx, cy, radius, current, bloomAmount, 0.18);
  drawAbsorptionRing(cx, cy, radius, current, bloomAmount);
  drawRingImpacts(cx, cy, radius, dt, current);
  drawOuterSparkleBand(cx, cy, radius, current, bloomAmount);
  drawGlow(cx, cy, radius * 0.32, 0.28 + bloomAmount * 0.2);
  drawGlow(cx, cy, radius * 0.2, 0.46 + bloomAmount * 0.22);
  drawGlow(cx, cy, radius * 0.088, 0.86);
  drawOrbMask(cx, cy, radius);

  requestAnimationFrame(render);
}

pause.addEventListener("click", () => {
  state.running = !state.running;
  pause.classList.toggle("is-paused", !state.running);
});

window.addEventListener("resize", () => {
  resize();
  rebuildParticles();
  rebuildCaustics();
});

resize();
rebuildCaustics();
seedInitialParticles();
ctx.fillStyle = "#02040b";
ctx.fillRect(0, 0, state.width, state.height);
{
  const { cx, cy, radius } = orbMetrics();
  ctx.globalCompositeOperation = "lighter";
  drawGlow(cx, cy, radius * 0.62, 0.16);
  drawGlow(cx, cy, radius * 0.14, 0.72);
  drawLiquidCaustics(cx, cy, radius, Number(morph.value) / 100, Number(bloom.value) / 100);
  drawAbsorptionRing(cx, cy, radius, Number(morph.value) / 100, Number(bloom.value) / 100);
}
requestAnimationFrame(render);
