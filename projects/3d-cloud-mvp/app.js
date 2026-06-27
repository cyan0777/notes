import * as THREE from "./vendor/three.module.js";

const host = document.getElementById("canvas-host");
const input = document.getElementById("text-input");
const clearButton = document.getElementById("clear-button");
const randomButton = document.getElementById("random-button");
const statusEl = document.getElementById("status");

const controls = {
  density: document.getElementById("density"),
  puffSize: document.getElementById("puff-size"),
  cloudScale: document.getElementById("cloud-scale"),
  depth: document.getElementById("depth"),
  contrast: document.getElementById("contrast"),
  softness: document.getElementById("softness"),
  dissolve: document.getElementById("dissolve"),
  sun: document.getElementById("sun"),
};

const state = {
  density: Number(controls.density.value),
  puffSize: Number(controls.puffSize.value),
  cloudScale: Number(controls.cloudScale.value),
  depth: Number(controls.depth.value),
  contrast: Number(controls.contrast.value),
  softness: Number(controls.softness.value),
  dissolve: Number(controls.dissolve.value),
  sun: Number(controls.sun.value),
  seed: 7,
  pointer: new THREE.Vector2(-999, -999),
  pointerWorld: new THREE.Vector3(),
  pointerActive: false,
  targetRotX: 0,
  targetRotY: 0,
  rotX: 0,
  rotY: 0,
};

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(host.clientWidth, host.clientHeight);
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
camera.position.set(0, 0, 18);

const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

const raycaster = new THREE.Raycaster();
const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const clock = new THREE.Clock();

let geometry;
let points;
let basePositions = [];
let runtime = [];
let arrays = {};
let generationHandle = 0;

const vertexShader = `
  attribute float aSize;
  attribute float aSeed;
  attribute float aOpacity;
  attribute float aDissolve;
  attribute float aDepth;
  varying float vSeed;
  varying float vOpacity;
  varying float vDissolve;
  varying float vDepth;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uPuffScale;
  uniform float uDepthScale;

  void main() {
    vSeed = aSeed;
    vOpacity = aOpacity;
    vDissolve = aDissolve;
    vDepth = aDepth;
    vec3 p = position;
    p.z *= uDepthScale;
    p.x += sin(uTime * 0.35 + aSeed * 9.7) * 0.025;
    p.y += cos(uTime * 0.28 + aSeed * 7.1) * 0.025;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPuffScale * uPixelRatio * (170.0 / max(5.0, -mvPosition.z));
  }
`;

const fragmentShader = `
  precision highp float;
  varying float vSeed;
  varying float vOpacity;
  varying float vDissolve;
  varying float vDepth;
  uniform float uTime;
  uniform float uSoftness;
  uniform float uDissolvePower;
  uniform float uSun;
  uniform float uContrast;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    float n1 = noise(uv * 4.4 + vSeed * 18.0 + uTime * 0.12);
    float n2 = noise(uv * 9.0 - vSeed * 8.0 - uTime * 0.08);
    float edge = 0.78 + (n1 - 0.5) * 0.24 + (n2 - 0.5) * 0.1;
    float alpha = 1.0 - smoothstep(edge - uSoftness, edge + uSoftness, r);
    alpha = pow(alpha, 0.92);
    float dissolveMask = noise(uv * 6.5 + vSeed * 22.0 + uTime * 0.2);
    float dissolve = smoothstep(vDissolve * uDissolvePower - 0.18, vDissolve * uDissolvePower + 0.28, dissolveMask);
    alpha *= mix(1.0, dissolve, vDissolve);
    alpha *= vOpacity;
    if (alpha < 0.01) discard;

    vec3 puffNormal = normalize(vec3(uv.x * 0.78, -uv.y * 0.78, sqrt(max(0.04, 1.0 - r * r))));
    vec3 lightDir = normalize(vec3(-0.55, 0.72 + uSun * 0.35, 0.9));
    float lambert = clamp(dot(puffNormal, lightDir) * 0.82 + 0.24 + uSun * 0.18, 0.0, 1.0);
    float selfShadow = smoothstep(-0.25, 0.95, uv.y) * 0.36;
    float edgeShade = smoothstep(0.2, 0.95, r) * 0.22;
    float depthShade = vDepth * 0.28;

    vec3 highlight = vec3(1.0, 1.0, 0.98);
    vec3 mid = vec3(0.9, 0.96, 1.0);
    vec3 shade = vec3(0.38, 0.52, 0.72);
    vec3 color = mix(shade, mid, lambert);
    color = mix(color, highlight, smoothstep(0.58, 1.0, lambert) * 0.72);
    color = mix(color, shade, clamp(selfShadow + edgeShade + depthShade, 0.0, 0.78));
    color = (color - 0.5) * uContrast + 0.5;
    gl_FragColor = vec4(color, alpha);
  }
`;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uPuffScale: { value: state.puffSize },
    uDepthScale: { value: state.depth },
    uContrast: { value: state.contrast },
    uSoftness: { value: state.softness },
    uDissolvePower: { value: state.dissolve },
    uSun: { value: state.sun },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.NormalBlending,
});

function random(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function textSamples(text) {
  const canvas = document.createElement("canvas");
  const width = 900;
  const height = 260;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 166px Arial, Helvetica, sans-serif";
  const metrics = ctx.measureText(text);
  const scale = Math.min(1, (width * 0.86) / Math.max(1, metrics.width));
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.fillText(text, 0, 10);
  ctx.restore();

  const image = ctx.getImageData(0, 0, width, height).data;
  const step = Math.max(3, Math.round(7 / state.density));
  const samples = [];

  for (let y = 8; y < height - 8; y += step) {
    for (let x = 8; x < width - 8; x += step) {
      const a = image[(y * width + x) * 4 + 3];
      if (a > 70 && random(x * 31 + y * 131 + state.seed) > 0.12) {
        const nx = (x / width - 0.5) * 9.8;
        const ny = -(y / height - 0.5) * 4.4;
        samples.push({ x: nx, y: ny, alpha: a / 255 });
      }
    }
  }

  return samples;
}

function makeCloud(text) {
  generationHandle += 1;
  const localHandle = generationHandle;
  const clean = text.trim() || "CLOUD";
  const samples = textSamples(clean);
  const count = Math.min(12000, Math.ceil(samples.length * 1.9));
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const opacities = new Float32Array(count);
  const dissolves = new Float32Array(count);
  const depths = new Float32Array(count);

  basePositions = [];
  runtime = [];

  for (let i = 0; i < count; i += 1) {
    const sample = samples[i % samples.length] || { x: 0, y: 0, alpha: 1 };
    const s = state.seed * 10000 + i * 97;
    const angle = random(s + 1) * Math.PI * 2;
    const spread = Math.sqrt(random(s + 2)) * 0.075;
    const z = (random(s + 3) - 0.5) * 2.35;
    const x = sample.x + Math.cos(angle) * spread;
    const y = sample.y + Math.sin(angle) * spread;
    const size = (0.68 + random(s + 4) * 0.82) * (0.78 + sample.alpha * 0.3);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    sizes[i] = size;
    seeds[i] = random(s + 5);
    opacities[i] = 0;
    dissolves[i] = 0.18;
    depths[i] = Math.max(0, Math.min(1, (z + 1.175) / 2.35));

    basePositions.push(new THREE.Vector3(x, y, z));
    runtime.push({
      opacity: 0,
      targetOpacity: 0.94 + random(s + 6) * 0.06,
      dissolve: 0.18,
      driftX: 0,
      driftY: 0,
      bornDelay: random(s + 7) * 0.8,
    });
  }

  if (points) {
    cloudGroup.remove(points);
    geometry.dispose();
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("aDissolve", new THREE.BufferAttribute(dissolves, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));

  arrays = { positions, opacities, dissolves };
  points = new THREE.Points(geometry, material);
  cloudGroup.add(points);
  statusEl.textContent = `${count.toLocaleString()} puffs. Move cursor through the cloud.`;

  window.setTimeout(() => {
    if (localHandle === generationHandle) statusEl.textContent = "Type to reshape. Move cursor through the cloud.";
  }, 1800);
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  state.pointerActive = true;
  state.targetRotY = state.pointer.x * 0.22;
  state.targetRotX = -state.pointer.y * 0.09;
}

function clearPointer() {
  state.pointer.set(-999, -999);
  state.pointerActive = false;
  state.targetRotX = 0;
  state.targetRotY = 0;
}

function updateCloud(delta) {
  if (!points || !geometry) return;

  if (state.pointerActive) {
    raycaster.setFromCamera(state.pointer, camera);
    raycaster.ray.intersectPlane(pointerPlane, state.pointerWorld);
  }

  const hoverRadius = 1.35;
  const pos = arrays.positions;
  const opa = arrays.opacities;
  const dis = arrays.dissolves;

  for (let i = 0; i < runtime.length; i += 1) {
    const r = runtime[i];
    const base = basePositions[i];

    if (r.bornDelay > 0) {
      r.bornDelay -= delta;
    }

    if (state.pointerActive) {
      const dx = base.x + r.driftX - state.pointerWorld.x;
      const dy = base.y + r.driftY - state.pointerWorld.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hoverRadius) {
        const force = 1 - dist / hoverRadius;
        r.targetOpacity = Math.min(r.targetOpacity, 0.1 + (1 - force) * 0.35);
        r.dissolve = Math.min(1, r.dissolve + delta * (1.8 + force * 5.5));
        const safe = dist || 1;
        r.driftX += (dx / safe) * force * delta * 1.5;
        r.driftY += (dy / safe) * force * delta * 1.5;
      } else {
        r.targetOpacity = Math.min(1, r.targetOpacity + delta * 0.35);
        r.dissolve = Math.max(0, r.dissolve - delta * 0.22);
      }
    } else {
      r.targetOpacity = Math.min(1, r.targetOpacity + delta * 0.4);
      r.dissolve = Math.max(0, r.dissolve - delta * 0.26);
    }

    const fadeSpeed = r.bornDelay > 0 ? 0 : 3.4;
    r.opacity += (r.targetOpacity - r.opacity) * Math.min(1, delta * fadeSpeed);
    r.driftX *= 1 - Math.min(0.05, delta * 0.55);
    r.driftY *= 1 - Math.min(0.05, delta * 0.55);

    pos[i * 3] = base.x + r.driftX;
    pos[i * 3 + 1] = base.y + r.driftY;
    opa[i] = r.opacity;
    dis[i] = r.dissolve;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.aOpacity.needsUpdate = true;
  geometry.attributes.aDissolve.needsUpdate = true;
}

function animate() {
  const delta = Math.min(0.05, clock.getDelta());
  material.uniforms.uTime.value = clock.elapsedTime;
  state.rotX += (state.targetRotX - state.rotX) * Math.min(1, delta * 3);
  state.rotY += (state.targetRotY - state.rotY) * Math.min(1, delta * 3);
  cloudGroup.rotation.x = state.rotX;
  cloudGroup.rotation.y = state.rotY;
  updateCloud(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const width = host.clientWidth;
  const height = host.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  const responsiveScale = Math.min(0.92, Math.max(0.48, width / 760));
  cloudGroup.scale.setScalar(responsiveScale * state.cloudScale);
  cloudGroup.position.x = width > 920 ? -1.2 : 0;
}

function refreshFromControls() {
  state.density = Number(controls.density.value);
  state.puffSize = Number(controls.puffSize.value);
  state.cloudScale = Number(controls.cloudScale.value);
  state.depth = Number(controls.depth.value);
  state.contrast = Number(controls.contrast.value);
  state.softness = Number(controls.softness.value);
  state.dissolve = Number(controls.dissolve.value);
  state.sun = Number(controls.sun.value);
  material.uniforms.uPuffScale.value = state.puffSize;
  material.uniforms.uDepthScale.value = state.depth;
  material.uniforms.uContrast.value = state.contrast;
  material.uniforms.uSoftness.value = state.softness;
  material.uniforms.uDissolvePower.value = state.dissolve;
  material.uniforms.uSun.value = state.sun;
  resize();
}

let textTimer = 0;
input.addEventListener("input", () => {
  window.clearTimeout(textTimer);
  textTimer = window.setTimeout(() => makeCloud(input.value), 140);
});

controls.density.addEventListener("input", () => {
  refreshFromControls();
  window.clearTimeout(textTimer);
  textTimer = window.setTimeout(() => makeCloud(input.value), 80);
});

for (const [key, element] of Object.entries(controls)) {
  if (key === "density") continue;
  element.addEventListener("input", refreshFromControls);
}

clearButton.addEventListener("click", () => {
  input.value = "";
  makeCloud(" ");
});

randomButton.addEventListener("click", () => {
  state.seed = Math.floor(Math.random() * 100000);
  makeCloud(input.value);
});

window.addEventListener("resize", resize);
window.addEventListener("pointermove", updatePointer);
window.addEventListener("pointerleave", clearPointer);
window.addEventListener("blur", clearPointer);

resize();
refreshFromControls();
makeCloud(input.value);
animate();
