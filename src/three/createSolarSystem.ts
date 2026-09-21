import * as THREE from 'three';
import { gsap } from 'gsap';
import { REDUCED } from '@/lib/motion';
import type { SectionId } from '@/data';

export interface SceneCallbacks {
  onProgress: (fraction: number) => void;
  onReady: () => void;
}

export interface SolarSystem {
  focus: (key: SectionId) => void;
  setScrollVelocity: (v: number) => void;
  dispose: () => void;
}

interface FocusConfig { target: string; distMul: number; side: number; shift: number; ang: number }
interface PlanetDef { key: string; r: number; dist: number; au: number; angle: number; spin: number; tilt: number }
interface Body { group: THREE.Object3D; r: number }
interface Planet extends Body {
  mesh: THREE.Mesh; dist: number; angle: number; omega: number; spin: number;
  cloud?: THREE.Mesh; moonPivot?: THREE.Object3D;
}
interface Painted { color: HTMLCanvasElement; bump?: HTMLCanvasElement }
type Painter = (x: number, y: number, z: number, lat: number, lon: number, o: number[]) => void;
type PaintSpec = [width: number, height: number, withBump: boolean, make: () => Painter];

/* Builds the Three.js solar system and returns { focus, setScrollVelocity, dispose }.
   Camera targets for each section live in FOCUS; planet sizes and orbits live in DEFS. */
export function createSolarSystem(canvas: HTMLCanvasElement, cb: SceneCallbacks): SolarSystem {
  const V3 = THREE.Vector3;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x02030a);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
  camera.position.set(0, 90, 300);
  scene.add(new THREE.AmbientLight(0x3a4a7a, 0.55));
  scene.add(new THREE.PointLight(0xfff0dc, 1.9, 0));

  let disposed = false, raf = 0, ready = false, currentKey: SectionId = 'home';
  const clock = new THREE.Clock();
  const bodies: Record<string, Body> = {};
  const planets: Planet[] = [];
  let sunGlow: THREE.Sprite | null = null;
  const ptr = { x: 0, y: 0 };
  const rig = { blend: 1, fromPos: new V3(0, 90, 300), fromLook: new V3(), look: new V3(), lift: 0, mx: 0, my: 0, vel: 0, velTarget: 0 };

  /* Where the camera goes for each section */
  const FOCUS: Record<SectionId, FocusConfig> = {
    home:       { target: 'sun',     distMul: 5.5, side:  1, shift: 1.6, ang: 0 },
    skills:     { target: 'earth',   distMul: 5.2, side:  1, shift: 1.7, ang: 0.9 },
    experience: { target: 'mars',    distMul: 5.2, side: -1, shift: 1.7, ang: -0.9 },
    projects:   { target: 'jupiter', distMul: 3.4, side:  0, shift: 0,   ang: 0.7 },
    contact:    { target: 'saturn',  distMul: 6.8, side:  1, shift: 1.5, ang: 0.8 }
  };

  const DEFS: PlanetDef[] = [
    { key: 'mercury', r: 0.9, dist: 15,  au: 0.39, angle: 0.6, spin: 0.25,  tilt: 0.03 },
    { key: 'venus',   r: 1.6, dist: 23,  au: 0.72, angle: 2.4, spin: -0.06, tilt: 0.05 },
    { key: 'earth',   r: 1.8, dist: 33,  au: 1.0,  angle: 4.0, spin: 0.35,  tilt: 0.41 },
    { key: 'mars',    r: 1.2, dist: 43,  au: 1.52, angle: 1.1, spin: 0.33,  tilt: 0.44 },
    { key: 'jupiter', r: 4.2, dist: 64,  au: 5.2,  angle: 5.2, spin: 0.6,   tilt: 0.05 },
    { key: 'saturn',  r: 3.6, dist: 84,  au: 9.54, angle: 3.3, spin: 0.55,  tilt: 0.47 },
    { key: 'uranus',  r: 2.4, dist: 101, au: 19.2, angle: 0.2, spin: -0.4,  tilt: 1.7 },
    { key: 'neptune', r: 2.3, dist: 115, au: 30.1, angle: 2.0, spin: 0.4,   tilt: 0.5 }
  ];

  /* ---------- procedural noise + painters (no image files needed) ---------- */
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const smooth = (a: number, b: number, t: number) => { t = clamp01((t - a) / (b - a)); return t * t * (3 - 2 * t); };

  function makeNoise(seed: number) {
    const perm = new Uint8Array(512), g = new Float32Array(256), p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed >>> 0;
    const rnd = (): number => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    for (let i = 0; i < 256; i++) g[i] = rnd();
    function h(a: number, b: number, c: number): number { return g[perm[perm[perm[a] + b] + c]]; }
    return function (x: number, y: number, z: number): number {
      const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      const xf = x - X, yf = y - Y, zf = z - Z;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
      const xi = X & 255, yi = Y & 255, zi = Z & 255, xj = (xi + 1) & 255, yj = (yi + 1) & 255, zj = (zi + 1) & 255;
      const x00 = lerp(h(xi, yi, zi), h(xj, yi, zi), u), x10 = lerp(h(xi, yj, zi), h(xj, yj, zi), u);
      const x01 = lerp(h(xi, yi, zj), h(xj, yi, zj), u), x11 = lerp(h(xi, yj, zj), h(xj, yj, zj), u);
      return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
    };
  }
  const noise = makeNoise(1337);
  function fbm(x: number, y: number, z: number, oct: number): number {
    let a = 0.5, s = 0, n = 0;
    for (let i = 0; i < oct; i++) {
      s += a * noise(x, y, z); n += a; a *= 0.5;
      x = x * 2.03 + 7.3; y = y * 2.03 + 3.1; z = z * 2.03 + 11.7;
    }
    return s / n;
  }
  function pal(list: number[][], s: number, o: number[]) {
    s = clamp01(s) * (list.length - 1);
    const i = Math.min(list.length - 2, Math.floor(s)), t = s - i, a = list[i], b = list[i + 1];
    o[0] = a[0] + (b[0] - a[0]) * t; o[1] = a[1] + (b[1] - a[1]) * t; o[2] = a[2] + (b[2] - a[2]) * t;
  }
  const wrapPi = (a: number) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

  const out = [0, 0, 0, 255, 0.5];
  /* Samples the noise on the sphere (not the flat map), so textures have no seams or pole pinching. */
  function paint(w: number, h: number, fn: Painter, withBump: boolean): Painted {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d')!, img = ctx.createImageData(w, h), d = img.data;
    let bc: HTMLCanvasElement | undefined, bctx: CanvasRenderingContext2D | undefined, bimg: ImageData | undefined, bd: Uint8ClampedArray | undefined;
    if (withBump) { bc = document.createElement('canvas'); bc.width = w; bc.height = h; bctx = bc.getContext('2d')!; bimg = bctx.createImageData(w, h); bd = bimg.data; }
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w) * Math.PI * 2;
        out[3] = 255; out[4] = 0.5;
        fn(cl * Math.cos(lon), sl, cl * Math.sin(lon), lat, lon, out);
        const k = (j * w + i) * 4;
        d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = out[3];
        if (bd) { const v = out[4] * 255; bd[k] = bd[k + 1] = bd[k + 2] = v; bd[k + 3] = 255; }
      }
    }
    ctx.putImageData(img, 0, 0);
    if (bctx && bimg) bctx.putImageData(bimg, 0, 0);
    return { color: c, bump: bc };
  }
  function toTex(c: HTMLCanvasElement, srgb?: boolean): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c);
    if (srgb !== false) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = maxAniso;
    return t;
  }

  const PAINT: Record<string, PaintSpec> = {
    nebula: [512, 256, false, () => (x, y, z, la, lo, o) => {
      const d = x * 0.28 + y * 0.93 + z * 0.24, band = Math.exp(-d * d * 9);
      const n = fbm(x * 1.6 + 5, y * 1.6, z * 1.6, 5), n2 = fbm(x * 3.2, y * 3.2 + 9, z * 3.2, 4);
      const v = smooth(0.38, 0.78, n) * (0.25 + band) * 0.65, dust = smooth(0.55, 0.8, n2) * band;
      o[0] = 5 + v * 70 + dust * 40; o[1] = 7 + v * 42; o[2] = 16 + v * 125 - dust * 10;
    }],
    mercury: [384, 192, true, () => rocky([1, 0.97, 0.92], 0)],
    moon:    [256, 128, true, () => rocky([0.95, 0.96, 1], 5)],
    venus: [384, 192, false, () => (x, y, z, la, lo, o) => {
      const w = fbm(x * 2, y * 4, z * 2, 3), n = fbm(x * 1.8 + w * 1.5, y * 5 + w, z * 1.8 + w * 1.5, 4);
      const t = clamp01(n * 1.2 + Math.sin(y * 9 + w * 4) * 0.12 - 0.1);
      pal([[196, 150, 86], [226, 190, 122], [242, 222, 168]], t, o);
    }],
    earth: [1024, 512, true, () => (x, y, z, la, lo, o) => {
      const e = fbm(x * 1.6 + 3.1, y * 1.6, z * 1.6, 6), sea = 0.535;
      let r, g, b, h;
      if (e < sea) {
        const t = clamp01(e / sea), s = t * t;
        r = lerp(5, 28, s); g = lerp(22, 90, s); b = lerp(62, 152, t); h = 0.15;
      } else {
        const t = clamp01((e - sea) / 0.2), m = fbm(x * 3.2 + 9, y * 3.2, z * 3.2, 4), dry = smooth(0.48, 0.66, m), hi = smooth(0.45, 1, t), sn = smooth(0.88, 1, t);
        r = lerp(lerp(44, 150, dry), 118, hi); g = lerp(lerp(112, 128, dry), 104, hi); b = lerp(lerp(52, 82, dry), 92, hi);
        r = lerp(r, 238, sn); g = lerp(g, 240, sn); b = lerp(b, 244, sn);
        h = 0.3 + t * 0.7;
      }
      const ay = Math.abs(y);
      if (ay > 0.72) {
        const ic = smooth(0.86, 0.94, ay + (fbm(x * 6, y * 6, z * 6, 3) - 0.5) * 0.18);
        r = lerp(r, 236, ic); g = lerp(g, 242, ic); b = lerp(b, 248, ic); h = lerp(h, 0.45, ic);
      }
      o[0] = r; o[1] = g; o[2] = b; o[4] = h;
    }],
    clouds: [768, 384, false, () => (x, y, z, la, lo, o) => {
      const n = fbm(x * 2.5 + 20, y * 3.5, z * 2.5, 5);
      o[0] = o[1] = o[2] = 255; o[3] = smooth(0.5, 0.72, n) * 235;
    }],
    mars: [1024, 512, true, () => (x, y, z, la, lo, o) => {
      const n = fbm(x * 2, y * 2, z * 2, 6), m = fbm(x * 4 + 7, y * 4, z * 4, 4);
      let r = lerp(112, 176, smooth(0.38, 0.58, n)), g = lerp(52, 86, smooth(0.38, 0.58, n)), b = lerp(34, 48, smooth(0.38, 0.58, n));
      const lt = smooth(0.55, 0.75, m) * 0.5;
      r = lerp(r, 214, lt); g = lerp(g, 140, lt); b = lerp(b, 92, lt);
      const cap = smooth(0.88, 0.95, Math.abs(y) + (fbm(x * 6, y * 6, z * 6, 2) - 0.5) * 0.1);
      o[0] = lerp(r, 240, cap); o[1] = lerp(g, 236, cap); o[2] = lerp(b, 232, cap); o[4] = n;
    }],
    jupiter: [1024, 512, false, () => (x, y, z, la, lo, o) => {
      const turb = fbm(x * 2.5, y * 10, z * 2.5, 4);
      const band = Math.sin(y * 13 + (turb - 0.5) * 3) * 0.5 + 0.5, band2 = Math.sin(y * 31 + (turb - 0.5) * 5) * 0.5 + 0.5;
      const s = 0.65 * band + 0.35 * band2 + (fbm(x * 6, y * 30, z * 6, 3) - 0.5) * 0.25;
      pal([[233, 216, 184], [204, 152, 104], [160, 108, 72], [226, 200, 162], [122, 84, 60]], s, o);
      const dLat = (la + 0.35) / 0.12, dLon = wrapPi(lo - 2.0) / 0.27, d = Math.sqrt(dLat * dLat + dLon * dLon);
      if (d < 1.3) {
        const k = 1 - smooth(0.7, 1.3, d), sw = fbm(x * 12, y * 12, z * 12, 3);
        o[0] = lerp(o[0], 196 + sw * 30, k); o[1] = lerp(o[1], 86 + sw * 30, k); o[2] = lerp(o[2], 58 + sw * 20, k);
      }
    }],
    saturn: [1024, 512, false, () => (x, y, z, la, lo, o) => {
      const turb = fbm(x * 2, y * 8, z * 2, 3);
      const s = 0.6 * (Math.sin(y * 10 + (turb - 0.5) * 2) * 0.5 + 0.5) + 0.4 * (Math.sin(y * 24 + (turb - 0.5) * 3) * 0.5 + 0.5) + (fbm(x * 5, y * 24, z * 5, 3) - 0.5) * 0.15;
      pal([[226, 204, 148], [203, 174, 120], [238, 222, 178], [190, 160, 110]], s, o);
    }],
    uranus: [256, 128, false, () => (x, y, z, la, lo, o) => {
      pal([[128, 196, 210], [160, 222, 230], [140, 206, 218]], 0.5 + 0.5 * Math.sin(y * 8) * 0.6 + (fbm(x * 2, y * 6, z * 2, 2) - 0.5) * 0.3, o);
    }],
    neptune: [384, 192, false, () => (x, y, z, la, lo, o) => {
      const s = 0.5 + 0.5 * Math.sin(y * 9 + fbm(x * 2, y * 4, z * 2, 3) * 3);
      pal([[36, 62, 168], [58, 92, 208], [70, 112, 224]], s, o);
      const st = smooth(0.64, 0.8, fbm(x * 3, y * 14, z * 3, 4)) * 0.35;
      o[0] = lerp(o[0], 240, st); o[1] = lerp(o[1], 244, st); o[2] = lerp(o[2], 255, st);
    }]
  };
  function rocky(tint: number[], off: number): Painter {
    return (x, y, z, la, lo, o) => {
      const n = fbm(x * 2.2 + off, y * 2.2, z * 2.2, 5), c = fbm(x * 8, y * 8 + off, z * 8, 3);
      const v = lerp(62, 178, smooth(0.36, 0.62, n) * 0.75 + c * 0.25);
      o[0] = v * tint[0]; o[1] = v * tint[1]; o[2] = v * tint[2]; o[4] = n * 0.7 + c * 0.3;
    };
  }

  function ringTexture(): THREE.CanvasTexture {
    const w = 1024, h = 8, c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d')!, img = ctx.createImageData(w, h), d = img.data;
    for (let i = 0; i < w; i++) {
      const t = i / (w - 1), n = noise(t * 90, 0.5, 0.5) * 0.5 + noise(t * 23, 3.3, 1) * 0.5;
      let dens = smooth(0, 0.06, t) * (0.35 + 0.65 * n);
      if (t < 0.2) dens *= 0.4; else if (t < 0.56) dens *= 1.15; else if (t < 0.62) dens *= 0.05; else dens *= 0.75;
      dens *= smooth(1, 0.93, t);
      const a = clamp01(dens) * 235, cr = lerp(190, 236, n), cg = lerp(170, 220, n), cb = lerp(135, 186, n);
      for (let j = 0; j < h; j++) { const k = (j * w + i) * 4; d[k] = cr; d[k + 1] = cg; d[k + 2] = cb; d[k + 3] = a; }
    }
    ctx.putImageData(img, 0, 0);
    return toTex(c);
  }
  function radialTexture(stops: [number, string][], size: number): THREE.CanvasTexture {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d')!, g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return toTex(c);
  }

  /* ---------- shader helpers ---------- */
  const sunMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: [
      'varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;',
      'void main(){ vPos = position; vNormal = normalize(normalMatrix * normal);',
      'vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }'
    ].join('\n'),
    fragmentShader: [
      'uniform float uTime; varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;',
      'float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
      'float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
      ' return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),',
      '            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }',
      'float fbm(vec3 p){ float v = 0.0; float a = 0.5; for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }',
      'void main(){',
      ' vec3 p = normalize(vPos) * 2.2; float t = uTime * 0.05;',
      ' float n = fbm(p + vec3(t, -t * 0.7, t * 0.5));',
      ' float n2 = fbm(p * 2.5 - vec3(t * 1.5) + n * 1.5);',
      ' float heat = smoothstep(0.25, 0.85, n * 0.6 + n2 * 0.55);',
      ' vec3 col = mix(vec3(0.75, 0.12, 0.0), vec3(1.0, 0.5, 0.05), smoothstep(0.0, 0.5, heat));',
      ' col = mix(col, vec3(1.0, 0.92, 0.55), smoothstep(0.5, 1.0, heat));',
      ' float facing = max(dot(normalize(vNormal), vView), 0.0);',
      ' col += vec3(1.0, 0.45, 0.1) * pow(1.0 - facing, 2.5) * 0.8;',
      ' col *= 0.75 + 0.5 * facing;',
      ' gl_FragColor = vec4(col * 1.25, 1.0); }'
    ].join('\n')
  });

  function atmosphere(radius: number, color: number, scale: number, strength: number, unlit: boolean): THREE.Mesh {
    const edge = Math.sqrt(1 - 1 / (scale * scale));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uEdge: { value: edge }, uStrength: { value: strength }, uUnlit: { value: unlit ? 1 : 0 } },
      vertexShader: [
        'varying vec3 vN; varying vec3 vV; varying float vLit;',
        'void main(){ vN = normalize(normalMatrix * normal);',
        ' vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz);',
        ' vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;',
        ' mat3 m3 = mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz);',
        ' vLit = dot(normalize(m3 * normal), normalize(-wp));',
        ' gl_Position = projectionMatrix * mv; }'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor; uniform float uEdge; uniform float uStrength; uniform float uUnlit;',
        'varying vec3 vN; varying vec3 vV; varying float vLit;',
        'void main(){ float d = -dot(normalize(vN), normalize(vV));',
        ' float i = pow(clamp(d / uEdge, 0.0, 1.0), 2.2);',
        ' float lit = mix(0.25 + 0.75 * smoothstep(-0.3, 0.7, vLit), 1.0, uUnlit);',
        ' gl_FragColor = vec4(uColor * i * lit * uStrength, 1.0); }'
      ].join('\n'),
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    return new THREE.Mesh(new THREE.SphereGeometry(radius * scale, 64, 48), mat);
  }

  function makeStars(count: number, rMin: number, rMax: number, size: number): THREE.Points {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), r = rMin + Math.random() * (rMax - rMin);
      pos[i * 3] = r * s * Math.cos(t); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(t);
      const k = Math.random(), c: number[] = k < 0.15 ? [1, 0.82, 0.62] : k < 0.35 ? [0.72, 0.82, 1] : [1, 1, 1], b = 0.45 + Math.random() * 0.55;
      col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: size * pr, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false
    }));
    pts.frustumCulled = false;
    return pts;
  }

  const dotTex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']], 64);

  /* ---------- camera pose maths ---------- */
  const _up = new V3(0, 1, 0), _dir = new V3(), _cam = new V3(), _look = new V3(), _fwd = new V3(), _right = new V3(), _look2 = new V3();
  function computePose(f: FocusConfig, aspect: number) {
    const t = bodies[f.target], P = t.group.position, R = t.r;
    if (f.target === 'sun') _dir.set(0.12, 0.42, 1);
    else { _dir.copy(P).negate(); _dir.y = 0; if (_dir.lengthSq() < 1e-6) _dir.set(0, 0, 1); _dir.normalize().applyAxisAngle(_up, f.ang); _dir.y += 0.2; }
    _dir.normalize();
    const portrait = aspect < 0.9;
    _cam.copy(P).addScaledVector(_dir, R * f.distMul * (portrait ? 1.5 : 1));
    _fwd.copy(P).sub(_cam).normalize();
    _right.crossVectors(_fwd, _up).normalize();
    _look.copy(P).addScaledVector(_right, portrait ? 0 : -f.side * f.shift * R);
    if (portrait) _look.y -= R * 0.8;
  }
  function startTransition(duration: number, ease: string) {
    gsap.killTweensOf(rig);
    rig.fromPos.copy(camera.position); rig.fromLook.copy(rig.look);
    rig.blend = 0;
    computePose(FOCUS[currentKey], camera.aspect);
    rig.lift = rig.fromPos.distanceTo(_cam) * 0.16;
    gsap.to(rig, { blend: 1, duration: duration, ease: ease });
  }

  /* ---------- scene build ---------- */
  const starGroup = new THREE.Group();
  const beltGroup = new THREE.Group();
  const sunGroup = new THREE.Group();
  scene.add(starGroup, beltGroup, sunGroup);

  function build(T: Record<string, Painted>) {
    // background
    const neb = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 32), new THREE.MeshBasicMaterial({ map: toTex(T.nebula.color), side: THREE.BackSide, depthWrite: false }));
    neb.renderOrder = -10;
    starGroup.add(neb, makeStars(5200, 1000, 1500, 1.7), makeStars(320, 1000, 1500, 3.4));

    // sun
    const sun = new THREE.Mesh(new THREE.SphereGeometry(7, 96, 64), sunMat);
    sunGroup.add(sun, atmosphere(7, 0xff8a2b, 1.22, 1.3, true));
    const glowA = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture([[0, 'rgba(255,240,200,1)'], [0.15, 'rgba(255,190,90,.6)'], [0.4, 'rgba(255,120,30,.18)'], [1, 'rgba(255,80,0,0)']], 256), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const glowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowA.material.map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35 }));
    glowA.scale.set(44, 44, 1); glowB.scale.set(120, 120, 1);
    sunGroup.add(glowA, glowB);
    bodies.sun = { group: sunGroup, r: 7 };
    sunGlow = glowA;

    // planets
    const atmo: Record<string, [number, number, number]> = {
      venus: [0xffd890, 1.08, 0.7], earth: [0x4da6ff, 1.14, 1.5], mars: [0xff9a6a, 1.06, 0.45],
      jupiter: [0xe8c9a0, 1.04, 0.25], saturn: [0xf2dc9a, 1.04, 0.25], uranus: [0x9be8f0, 1.08, 0.9], neptune: [0x5b7cff, 1.08, 1.0]
    };
    DEFS.forEach(def => {
      const tex = T[def.key];
      const group = new THREE.Group(), tilt = new THREE.Group();
      tilt.rotation.z = def.tilt; group.add(tilt); scene.add(group);
      const mat = new THREE.MeshStandardMaterial({ map: toTex(tex.color), roughness: 1, metalness: 0 });
      if (tex.bump) { mat.bumpMap = toTex(tex.bump, false); mat.bumpScale = def.key === 'earth' ? 0.25 : 0.4; }
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.r, 96, 64), mat);
      tilt.add(mesh);
      if (atmo[def.key]) { const a = atmo[def.key]; tilt.add(atmosphere(def.r, a[0], a[1], a[2], false)); }
      const b: Planet = { group: group, mesh: mesh, r: def.r, dist: def.dist, angle: def.angle, omega: 0.06 * Math.pow(def.au, -1.5), spin: def.spin };
      bodies[def.key] = b;
      planets.push(b);

      if (def.key === 'earth') {
        b.cloud = new THREE.Mesh(new THREE.SphereGeometry(def.r * 1.012, 96, 64), new THREE.MeshStandardMaterial({ map: toTex(T.clouds.color), transparent: true, depthWrite: false, roughness: 1 }));
        tilt.add(b.cloud);
        b.moonPivot = new THREE.Object3D(); group.add(b.moonPivot);
        const mm = new THREE.MeshStandardMaterial({ map: toTex(T.moon.color), bumpMap: toTex(T.moon.bump!, false), bumpScale: 0.4, roughness: 1 });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), mm); moon.position.set(3.8, 0, 0);
        b.moonPivot.add(moon);
      }
      if (def.key === 'saturn') {
        const inner = def.r * 1.25, outer = def.r * 2.2, rg = new THREE.RingGeometry(inner, outer, 128, 1);
        const p = rg.attributes.position, uv = rg.attributes.uv as THREE.BufferAttribute, v = new V3();
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5); }
        const ring = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: 1 }));
        ring.rotation.x = -Math.PI / 2; tilt.add(ring);
      }

      // orbit path
      const pts = [];
      for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; pts.push(new V3(Math.cos(a) * def.dist, 0, Math.sin(a) * def.dist)); }
      scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6c86b8, transparent: true, opacity: 0.16 })));
    });

    // asteroid belt
    const N = 1600, rockGeo = new THREE.IcosahedronGeometry(0.16, 0);
    const belt = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }), N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), cc = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, r = 53.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 4.5;
      ps.set(Math.cos(a) * r, (Math.random() - 0.5) * 1.6, Math.sin(a) * r);
      eu.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); q.setFromEuler(eu);
      const s = 0.4 + Math.pow(Math.random(), 3) * 2.2; sc.set(s, s * (0.7 + Math.random() * 0.5), s);
      m4.compose(ps, q, sc); belt.setMatrixAt(i, m4);
      const g = 0.35 + Math.random() * 0.3; cc.setRGB(g, g * 0.92, g * 0.82); belt.setColorAt(i, cc);
    }
    beltGroup.add(belt);
  }

  /* ---------- loop ---------- */
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    rig.velTarget *= Math.pow(0.03, dt);
    rig.vel += (rig.velTarget - rig.vel) * Math.min(1, dt * 5);
    const ts = (1 + rig.vel * 3) * (REDUCED ? 0.3 : 1);

    sunMat.uniforms.uTime.value = t;
    if (sunGlow) { const pulse = 1 + Math.sin(t * 0.8) * 0.02; sunGlow.scale.set(44 * pulse, 44 * pulse, 1); }
    beltGroup.rotation.y += dt * 0.004 * ts;
    starGroup.rotation.y += dt * 0.002;

    planets.forEach(b => {
      b.angle += b.omega * dt * ts;
      b.group.position.set(Math.cos(b.angle) * b.dist, 0, Math.sin(b.angle) * b.dist);
      b.mesh.rotation.y += b.spin * dt * 0.6;
      if (b.cloud) b.cloud.rotation.y += dt * 0.03;
      if (b.moonPivot) b.moonPivot.rotation.y += dt * 0.25 * ts;
    });

    const f = FOCUS[currentKey];
    computePose(f, camera.aspect);
    const b = rig.blend;
    camera.position.lerpVectors(rig.fromPos, _cam, b);
    _look2.lerpVectors(rig.fromLook, _look, b);
    rig.look.copy(_look2);
    camera.position.y += Math.sin(Math.PI * b) * rig.lift;
    rig.mx += (ptr.x - rig.mx) * Math.min(1, dt * 2.5);
    rig.my += (ptr.y - rig.my) * Math.min(1, dt * 2.5);
    const R = bodies[f.target].r;
    camera.position.addScaledVector(_right, rig.mx * R * 0.1);
    camera.position.y += rig.my * R * 0.06;
    const fov = 45 + Math.sin(Math.PI * b) * 9;
    if (Math.abs(fov - camera.fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.lookAt(_look2);
    starGroup.position.copy(camera.position);

    renderer.render(scene, camera);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  function onPointer(e: PointerEvent) { ptr.x = (e.clientX / window.innerWidth - 0.5) * 2; ptr.y = -(e.clientY / window.innerHeight - 0.5) * 2; }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  resize();

  /* Sun exists before textures finish, so the camera maths never hits undefined */
  bodies.sun = { group: sunGroup, r: 7 };

  const tick = () => new Promise<void>(r => setTimeout(r, 16));
  async function init() {
    const names = Object.keys(PAINT), T: Record<string, Painted> = {};
    for (let i = 0; i < names.length; i++) {
      await tick();
      if (disposed) return;
      const spec = PAINT[names[i]];
      T[names[i]] = paint(spec[0], spec[1], spec[3](), spec[2]);
      cb.onProgress((i + 1) / (names.length + 1));
    }
    await tick();
    if (disposed) return;
    build(T);
    planets.forEach(b => { b.group.position.set(Math.cos(b.angle) * b.dist, 0, Math.sin(b.angle) * b.dist); });
    cb.onProgress(1);
    ready = true;
    startTransition(REDUCED ? 0.01 : 4.2, 'power3.out');
    frame();
    cb.onReady();
  }
  init().catch(err => { console.error(err); cb.onReady(); });

  return {
    focus: function (key: SectionId) {
      if (!FOCUS[key] || key === currentKey) return;
      currentKey = key;
      if (ready) startTransition(REDUCED ? 0.01 : 2.8, 'power3.inOut');
    },
    setScrollVelocity: function (v: number) { rig.velTarget = Math.min(Math.abs(v) / 900, 8); },
    dispose: function () {
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onPointer);
      gsap.killTweensOf(rig); renderer.dispose();
    }
  };
}
