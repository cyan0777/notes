const canvas = document.querySelector("#aurora");
const ctx = canvas.getContext("2d", { alpha: true });
const shell = document.querySelector(".hero-shell");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  width: 0,
  height: 0,
  pixelRatio: 1,
  time: 0,
  last: performance.now(),
  pointerX: 0.5,
  pointerY: 0.5,
  targetX: 0.5,
  targetY: 0.5,
};

const columns = Array.from({ length: 34 }, (_, index) => ({
  phase: Math.random() * Math.PI * 2,
  speed: 0.18 + Math.random() * 0.24,
  lift: 0.42 + Math.random() * 0.5,
  width: 0.88 + Math.random() * 0.76,
  strength: 0.58 + Math.random() * 0.5,
  lane: index / 33,
}));

const lightPeaks = [
  { center: 0.16, width: 0.13, phase: 0.2, speed: 0.31, drift: 0.045, strength: 0.58 },
  { center: 0.34, width: 0.18, phase: 2.1, speed: 0.23, drift: 0.06, strength: 0.5 },
  { center: 0.5, width: 0.22, phase: 4.3, speed: 0.19, drift: 0.075, strength: 0.62 },
  { center: 0.68, width: 0.16, phase: 1.4, speed: 0.27, drift: 0.055, strength: 0.52 },
  { center: 0.86, width: 0.12, phase: 3.5, speed: 0.34, drift: 0.04, strength: 0.56 },
];

function resize() {
  const rect = shell.getBoundingClientRect();
  state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  state.width = Math.max(1, Math.round(rect.width));
  state.height = Math.max(1, Math.round(rect.height));
  canvas.width = Math.round(state.width * state.pixelRatio);
  canvas.height = Math.round(state.height * state.pixelRatio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
}

function colorStop(gradient, offset, color) {
  gradient.addColorStop(Math.max(0, Math.min(1, offset)), color);
}

function organicLift(lane, time, phase) {
  const local =
    Math.sin(time * 0.42 + phase) * 0.18 +
    Math.sin(time * 0.27 + lane * Math.PI * 2.7 + phase * 0.7) * 0.14 +
    Math.sin(time * 0.19 - lane * Math.PI * 4.1 + phase * 1.2) * 0.1;

  const peakLift = lightPeaks.reduce((total, peak) => {
    const center = peak.center + Math.sin(time * peak.speed + peak.phase) * peak.drift;
    const distance = lane - center;
    const bell = Math.exp(-(distance * distance) / (2 * peak.width * peak.width));
    const pulse = 0.48 + Math.sin(time * (peak.speed * 1.7) + peak.phase * 1.9) * 0.22;
    return total + bell * peak.strength * pulse;
  }, 0);

  return Math.max(0, Math.min(1.35, 0.42 + local + peakLift));
}

function drawColumn(x, base, height, width, palette, alpha, time, phase) {
  const top = base - height;
  const gradient = ctx.createLinearGradient(x, top, x, base);
  colorStop(gradient, 0, palette.top);
  colorStop(gradient, 0.34, palette.midSoft(alpha));
  colorStop(gradient, 0.66, palette.mid(alpha));
  colorStop(gradient, 0.88, palette.low(alpha));
  colorStop(gradient, 1, palette.base(alpha));

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(24px)";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x - width * 0.5, top, width, height * 1.12, width * 0.2);
  ctx.fill();

  ctx.filter = "blur(3px)";
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = gradient;
  const stripeCount = Math.max(3, Math.floor(width / 12));
  for (let i = 0; i < stripeCount; i += 1) {
    const wave = Math.sin(time * 0.9 + phase + i * 1.6) * 1.8;
    const sx = x - width * 0.46 + (i / stripeCount) * width + wave;
    ctx.fillRect(sx, top + height * 0.08, Math.max(1.4, width * 0.055), height);
  }
  ctx.restore();
}

const palettes = [
  {
    top: "rgba(22, 78, 255, 0)",
    midSoft: (a) => `rgba(28, 92, 255, ${a * 0.22})`,
    mid: (a) => `rgba(64, 142, 255, ${a * 0.58})`,
    low: (a) => `rgba(150, 196, 255, ${a * 0.86})`,
    base: (a) => `rgba(255, 255, 255, ${a})`,
  },
  {
    top: "rgba(128, 58, 255, 0)",
    midSoft: (a) => `rgba(99, 70, 255, ${a * 0.21})`,
    mid: (a) => `rgba(132, 96, 255, ${a * 0.54})`,
    low: (a) => `rgba(185, 160, 255, ${a * 0.82})`,
    base: (a) => `rgba(255, 255, 255, ${a * 0.98})`,
  },
  {
    top: "rgba(110, 218, 255, 0)",
    midSoft: (a) => `rgba(70, 172, 255, ${a * 0.21})`,
    mid: (a) => `rgba(116, 200, 255, ${a * 0.56})`,
    low: (a) => `rgba(198, 231, 255, ${a * 0.82})`,
    base: (a) => `rgba(255, 255, 255, ${a * 0.98})`,
  },
];

function drawAurora(time) {
  const { width, height } = state;
  const bottom = height * 1.03;
  const horizon = height * 0.36;
  ctx.clearRect(0, 0, width, height);

  const glowX = width * (0.5 + Math.sin(time * 0.26) * 0.045);
  const glowY = height * (1.04 + Math.sin(time * 0.38) * 0.025);
  const baseGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, height, width * 0.78);
  baseGlow.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  baseGlow.addColorStop(0.18, "rgba(205, 234, 255, 0.68)");
  baseGlow.addColorStop(0.42, "rgba(74, 145, 255, 0.46)");
  baseGlow.addColorStop(0.66, "rgba(126, 84, 255, 0.32)");
  baseGlow.addColorStop(0.84, "rgba(34, 58, 158, 0.19)");
  baseGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = baseGlow;
  ctx.fillRect(0, height * 0.3, width, height * 0.7);

  columns.forEach((column, index) => {
    const laneShift =
      Math.sin(time * 0.18 + column.phase) * width * 0.014 +
      Math.sin(time * 0.09 + column.phase * 1.8) * width * 0.012;
    const x = column.lane * width + laneShift;
    const edgeEase = 0.82 + Math.sin(column.lane * Math.PI) * 0.18;
    const wave = Math.sin(time * column.speed + column.phase) * 0.5 + 0.5;
    const lift = organicLift(column.lane, time, column.phase);
    const heightScale = column.lift * (0.58 + lift * 0.56 + wave * 0.12) * edgeEase;
    const colHeight = Math.max(80, (bottom - horizon) * heightScale);
    const colWidth = (width / columns.length) * (1.45 + column.width);
    const palette = palettes[index % palettes.length];
    const pulse = 0.82 + lift * 0.22 + wave * 0.12;
    drawColumn(x, bottom, colHeight, colWidth, palette, column.strength * 1.16 * pulse, time, column.phase);
  });

  drawFadeMask();
}

function drawFadeMask() {
  const { width, height } = state;
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createLinearGradient(0, 0, 0, height);
  mask.addColorStop(0, "rgba(0, 0, 0, 0)");
  mask.addColorStop(0.26, "rgba(0, 0, 0, 0)");
  mask.addColorStop(0.48, "rgba(0, 0, 0, 0.5)");
  mask.addColorStop(0.62, "rgba(0, 0, 0, 0.86)");
  mask.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function animate(now) {
  const delta = Math.min(40, now - state.last);
  state.last = now;
  if (!reducedMotion) {
    state.time += delta * 0.001;
  }
  state.pointerX += (state.targetX - state.pointerX) * 0.06;
  state.pointerY += (state.targetY - state.pointerY) * 0.06;
  drawAurora(state.time);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  const rect = shell.getBoundingClientRect();
  state.targetX = (event.clientX - rect.left) / rect.width;
  state.targetY = (event.clientY - rect.top) / rect.height;
});

resize();
requestAnimationFrame(animate);
