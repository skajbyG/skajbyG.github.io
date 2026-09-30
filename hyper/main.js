import * as THREE from 'three';
import { EffectComposer } from './lib/addons/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from './lib/addons/postprocessing/ShaderPass.js';
import { OutputPass } from './lib/addons/postprocessing/OutputPass.js';

/* =========================================================
   helpers
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = Math.min(innerWidth, innerHeight) < 700;

/* =========================================================
   GLSL: 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT)
   ========================================================= */
const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/* =========================================================
   Generative synth (Web Audio)
   ========================================================= */
class Synth {
  constructor() { this.on = false; this.ctx = null; }

  init() {
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.bins = new Uint8Array(this.analyser.frequencyBinCount);
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);

    // echo
    this.delay = ctx.createDelay(1);
    this.delay.delayTime.value = 0.375;
    const fb = ctx.createGain(); fb.gain.value = 0.42;
    const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2400;
    this.delay.connect(dlp).connect(fb).connect(this.delay);
    const wet = ctx.createGain(); wet.gain.value = 0.5;
    dlp.connect(wet).connect(this.master);

    // pad
    const padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 700; padF.Q.value = 6;
    const padG = ctx.createGain(); padG.gain.value = 0.07;
    padF.connect(padG).connect(this.master);
    [55, 82.41, 110, 164.81].forEach((f, i) => {
      [-7, 7].forEach(det => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det + i * 2;
        o.connect(padF); o.start();
      });
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 500;
    lfo.connect(lfoG).connect(padF.frequency); lfo.start();

    // sub
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 55;
    const subG = ctx.createGain(); subG.gain.value = 0.12;
    sub.connect(subG).connect(this.master); sub.start();

    // sequencer
    this.scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
    this.step = 0;
    this.next = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  schedule() {
    const ctx = this.ctx, spb = 0.125;
    while (this.next < ctx.currentTime + 0.12) {
      const s = this.step % 16;
      if (s % 4 === 0) this.kick(this.next);
      if (s % 8 === 4) this.hat(this.next, 0.09);
      if (s % 2 === 1) this.hat(this.next, 0.025);
      if (Math.random() < (s % 4 === 0 ? 0.8 : 0.4)) {
        const n = this.scale[(Math.random() * this.scale.length) | 0];
        this.pluck(this.next, n);
      }
      this.next += spb; this.step++;
    }
  }

  kick(t) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.45);
  }

  hat(t, vol) {
    const ctx = this.ctx;
    if (!this.noiseBuf) {
      const b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
    }
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(g).connect(this.master); src.start(t); src.stop(t + 0.06);
  }

  pluck(t, f) {
    const ctx = this.ctx, o = ctx.createOscillator(), flt = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    flt.type = 'lowpass'; flt.Q.value = 8;
    flt.frequency.setValueAtTime(4200, t);
    flt.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(flt).connect(g);
    g.connect(this.master); g.connect(this.delay);
    o.start(t); o.stop(t + 0.4);
  }

  whoosh(dur = 3) {
    if (!this.on) return;
    const ctx = this.ctx, t = ctx.currentTime;
    this.hat(t, 0); // ensures noise buffer exists
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(120, t);
    bp.frequency.exponentialRampToValueAtTime(6000, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.8, t + dur * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(40, t);
    o.frequency.exponentialRampToValueAtTime(900, t + dur);
    const og = ctx.createGain(); og.gain.value = 0.08;
    src.connect(bp).connect(g).connect(this.master);
    o.connect(og).connect(g);
    src.start(t); src.stop(t + dur + 0.7);
    o.start(t); o.stop(t + dur + 0.7);
  }

  async toggle() {
    if (!this.ctx) this.init();
    this.on = !this.on;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    if (this.on) {
      await this.ctx.resume();
      this.master.gain.linearRampToValueAtTime(0.55, t + 1.2);
    } else {
      this.master.gain.linearRampToValueAtTime(0, t + 0.4);
    }
    return this.on;
  }

  level() {
    if (!this.on || !this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.bins);
    let s = 0;
    for (let i = 0; i < 10; i++) s += this.bins[i];
    return s / (10 * 255);
  }
}
const synth = new Synth();

/* =========================================================
   Particle targets
   ========================================================= */
const COUNT = isSmall ? 14000 : 32000;

function genGalaxy(n) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const branch = (i % 4) / 4 * Math.PI * 2;
    const r = 0.6 + Math.pow(Math.random(), 1.6) * 6.5;
    const spin = r * 0.85;
    const rnd = () => Math.pow(Math.random(), 3) * (Math.random() < .5 ? 1 : -1) * (0.25 + r * 0.12);
    a[i * 3] = Math.cos(branch + spin) * r + rnd();
    a[i * 3 + 1] = rnd() * 0.6;
    a[i * 3 + 2] = Math.sin(branch + spin) * r + rnd();
  }
  return a;
}

function genSphere(n) {
  const a = new Float32Array(n * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = g * i;
    const R = 2.5 + (Math.random() - .5) * 0.08 + (Math.random() < 0.06 ? Math.random() * 0.9 : 0);
    a[i * 3] = Math.cos(th) * rad * R;
    a[i * 3 + 1] = y * R;
    a[i * 3 + 2] = Math.sin(th) * rad * R;
  }
  return a;
}

function genKnot(n) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const cx = (2 + Math.cos(3 * t)) * Math.cos(2 * t);
    const cy = (2 + Math.cos(3 * t)) * Math.sin(2 * t);
    const cz = Math.sin(3 * t);
    // random point in a tube around the curve
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
    const rr = 0.32 * Math.cbrt(Math.random());
    a[i * 3] = cx * 0.95 + Math.sin(v) * Math.cos(u) * rr;
    a[i * 3 + 1] = cy * 0.95 + Math.sin(v) * Math.sin(u) * rr;
    a[i * 3 + 2] = cz * 0.95 + Math.cos(v) * rr;
  }
  return a;
}

function genText(n, text, worldW) {
  const cw = 1200, ch = 320;
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#fff';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  let fs = 260;
  x.font = `800 ${fs}px Unbounded, "Arial Black", sans-serif`;
  const w = x.measureText(text).width;
  if (w > cw * 0.94) { fs *= cw * 0.94 / w; x.font = `800 ${fs}px Unbounded, "Arial Black", sans-serif`; }
  x.fillText(text, cw / 2, ch / 2);
  const d = x.getImageData(0, 0, cw, ch).data;
  const pts = [];
  for (let yy = 0; yy < ch; yy += 2) for (let xx = 0; xx < cw; xx += 2) if (d[(yy * cw + xx) * 4 + 3] > 128) pts.push(xx, yy);
  const a = new Float32Array(n * 3);
  const s = worldW / cw;
  const m = pts.length / 2;
  for (let i = 0; i < n; i++) {
    const k = m ? ((Math.random() * m) | 0) * 2 : 0;
    a[i * 3] = ((pts[k] || cw / 2) - cw / 2 + Math.random() * 2) * s;
    a[i * 3 + 1] = -((pts[k + 1] || ch / 2) - ch / 2 + Math.random() * 2) * s;
    a[i * 3 + 2] = (Math.random() - .5) * 0.35;
  }
  return a;
}

function genStars(n) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = Math.random() * Math.PI * 2;
    const r = 3 + Math.pow(Math.random(), .7) * 26;
    a[i * 3] = Math.cos(th) * r;
    a[i * 3 + 1] = Math.sin(th) * r * 0.7;
    a[i * 3 + 2] = -Math.random() * 30 + 2;
  }
  return a;
}

/* =========================================================
   Scene
   ========================================================= */
const canvas = $('#gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
} catch (e) {
  renderer = null;
}

const state = {
  mouse: new THREE.Vector2(0, 0),      // -1..1
  mouseS: new THREE.Vector2(0, 0),     // smoothed
  mouse3: new THREE.Vector3(),
  scroll: 0, scrollS: 0, vel: 0,
  morph: 0, morphS: 0,
  heroP: 0, warpSec: 0,
  hover: 0,
  chaos: 0, chaosOn: false,
  warp: 0, warping: false,
  flash: 0,
  audio: 0,
  time: 0,
};


function initScene() {
  const DPR = Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x05040a, 1);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05040a, 0.02);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 7);

  /* ---------- blob ---------- */
  const blobUniforms = {
    uTime: { value: 0 }, uAmp: { value: 0.32 }, uFreq: { value: 0.85 },
    uAudio: { value: 0 }, uHover: { value: 0 }, uChaos: { value: 0 },
  };
  const blobMat = new THREE.ShaderMaterial({
    uniforms: blobUniforms,
    vertexShader: /* glsl */`
      uniform float uTime, uAmp, uFreq, uAudio, uHover, uChaos;
      varying vec3 vN; varying vec3 vV; varying float vD; varying vec3 vP;
      ${NOISE}
      float disp(vec3 p){
        float t = uTime * (0.35 + uChaos * 1.2);
        float n = snoise(p * uFreq + vec3(t, t * .7, -t * .4));
        n += 0.4 * snoise(p * uFreq * 2.4 - vec3(t * 1.3));
        n += uChaos * 0.3 * snoise(p * 6.0 + t * 3.0);
        return n * (uAmp + uAudio * 0.55 + uHover * 0.22 + uChaos * 0.3);
      }
      vec3 warp(vec3 p){ vec3 n = normalize(p); return n * 1.5 + n * disp(n * 1.5); }
      void main(){
        vec3 n = normalize(position);
        vec3 t = normalize(cross(n, abs(n.y) < .99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
        vec3 b = cross(n, t);
        float e = 0.01;
        vec3 p0 = warp(n);
        vec3 p1 = warp(n + t * e);
        vec3 p2 = warp(n + b * e);
        vec3 nn = normalize(cross(p1 - p0, p2 - p0));
        vD = length(p0) - 1.5;
        vP = p0;
        vec4 mv = modelViewMatrix * vec4(p0, 1.);
        vN = normalize(normalMatrix * nn);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uAudio, uChaos;
      varying vec3 vN; varying vec3 vV; varying float vD; varying vec3 vP;
      vec3 pal(float t){
        return 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
      }
      void main(){
        vec3 n = normalize(vN);
        float ndv = clamp(dot(n, vV), 0., 1.);
        float fres = pow(1. - ndv, 2.2);
        float h = ndv * 0.9 + vD * 1.4 + uTime * 0.05 + uChaos * uTime * 0.4;
        vec3 irid = pal(h);
        irid = mix(irid, vec3(0.0, 0.94, 1.0), 0.15);
        vec3 L = normalize(vec3(0.6, 0.8, 0.5));
        float spec = pow(max(dot(reflect(-L, n), vV), 0.), 48.);
        float band = smoothstep(0.02, 0., abs(fract(vD * 7. + uTime * .2) - .5) - .45);
        vec3 col = vec3(0.012, 0.008, 0.03);
        col += irid * fres * 1.9;
        col += irid * 0.10;
        col += spec * vec3(1.0) * 1.2;
        col += band * irid * 0.25;
        col *= 1. + uAudio * 1.4;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1, isSmall ? 48 : 80), blobMat);
  scene.add(blob);

  // orbit rings
  const rings = new THREE.Group();
  const ringCols = [0x00f0ff, 0xff2bd6, 0xd4ff3a];
  ringCols.forEach((c, i) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(2.35 + i * 0.32, 0.006 + i * 0.002, 6, 220),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    m.userData.spin = new THREE.Vector3((Math.random() - .5) * .6, (Math.random() - .5) * .6, (Math.random() - .5) * .3);
    rings.add(m);
  });
  scene.add(rings);

  /* ---------- particles ---------- */
  const aspectW = () => {
    const z = camZBase();
    const visW = 2 * z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    return Math.min(9.5, visW * 0.86);
  };
  const pGeo = new THREE.BufferGeometry();
  const targets = [genGalaxy(COUNT), genSphere(COUNT), genKnot(COUNT), genText(COUNT, 'SKAJBY', aspectW()), genStars(COUNT)];
  pGeo.setAttribute('position', new THREE.BufferAttribute(targets[0].slice(), 3));
  targets.forEach((t, i) => pGeo.setAttribute('aP' + i, new THREE.BufferAttribute(t, 3)));
  const rnd = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) rnd[i] = Math.random();
  pGeo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  pGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

  const pUniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: isSmall ? 3.8 : 3.1 },
    uPR: { value: DPR }, uTurb: { value: 0.3 }, uChaos: { value: 0 }, uAudio: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uShockP: { value: new THREE.Vector3() },
    uShockT: { value: -10 }, uWarp: { value: 0 }, uVel: { value: 0 },
  };
  const pMat = new THREE.ShaderMaterial({
    uniforms: pUniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uMorph, uSize, uPR, uTurb, uChaos, uAudio, uShockT, uWarp, uVel;
      uniform vec3 uMouse, uShockP;
      attribute vec3 aP0, aP1, aP2, aP3, aP4;
      attribute float aRand;
      varying vec3 vCol; varying float vA;
      ${NOISE}
      vec3 neon(float h){
        vec3 c1 = vec3(0.0, 0.94, 1.0), c2 = vec3(0.48, 0.36, 1.0), c3 = vec3(1.0, 0.17, 0.84), c4 = vec3(0.83, 1.0, 0.23);
        h = fract(h) * 4.0;
        if (h < 1.) return mix(c1, c2, h);
        if (h < 2.) return mix(c2, c3, h - 1.);
        if (h < 3.) return mix(c3, c4, h - 2.);
        return mix(c4, c1, h - 3.);
      }
      void main(){
        float m = clamp(uMorph, 0., 4.);
        float seg = min(floor(m), 3.);
        float t = clamp((m - seg) * 1.6 - aRand * 0.6, 0., 1.);
        t = t * t * (3. - 2. * t);
        vec3 a, b;
        if (seg < .5) { a = aP0; b = aP1; }
        else if (seg < 1.5) { a = aP1; b = aP2; }
        else if (seg < 2.5) { a = aP2; b = aP3; }
        else { a = aP3; b = aP4; }
        vec3 p = mix(a, b, t);

        float mid = sin(t * 3.14159);
        vec3 q = p * 0.5 + vec3(uTime * 0.15);
        p += mid * 1.6 * vec3(snoise(q), snoise(q + 17.1), snoise(q + 31.7));

        float turb = uTurb + uChaos * 1.4 + uAudio * 0.8;
        vec3 r = p * 0.7 + vec3(0., uTime * 0.25, 0.);
        p += turb * 0.18 * vec3(snoise(r), snoise(r + 5.2), snoise(r + 9.4));

        vec4 wp = modelMatrix * vec4(p, 1.);

        // mouse repulsion
        vec3 dm = wp.xyz - uMouse;
        float dl = length(dm.xy);
        wp.xyz += normalize(dm + vec3(1e-4)) * smoothstep(1.7, 0., dl) * 0.8;

        // shockwave
        float st = uTime - uShockT;
        if (st > 0. && st < 4.) {
          vec3 ds = wp.xyz - uShockP;
          float d = length(ds);
          float w = exp(-pow(d - st * 7.5, 2.) * 1.2) * exp(-st * 1.1);
          wp.xyz += normalize(ds + vec3(1e-4)) * w * 1.6;
        }

        // hyperspace pull
        wp.z += uWarp * uWarp * (8. + aRand * 30.) * (0.5 + 0.5 * sin(uTime * 3. + aRand * 20.));

        vec4 mv = viewMatrix * wp;
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.35 + aRand * 1.3) * (1. + uAudio * 1.2 + uWarp * 2.);
        gl_PointSize = size * uPR * (10. / -mv.z);

        float h = aRand * 0.3 + length(p) * 0.11 + p.y * 0.05 + uTime * 0.04 + uChaos * uTime * 0.4;
        vCol = neon(h);
        vA = (0.45 + 0.55 * sin(uTime * 2. + aRand * 60.)) * (0.6 + 0.4 * smoothstep(-25., -2., mv.z));
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vCol; varying float vA;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., d);
        a = pow(a, 1.8);
        gl_FragColor = vec4(vCol * a * vA * 0.75, 1.);
      }`,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  scene.add(points);

  /* ---------- warp streaks ---------- */
  const LINES = isSmall ? 900 : 2200;
  const lGeo = new THREE.BufferGeometry();
  const lSeed = new Float32Array(LINES * 2 * 3), lEnd = new Float32Array(LINES * 2);
  for (let i = 0; i < LINES; i++) {
    const th = Math.random() * Math.PI * 2, r = 1.5 + Math.pow(Math.random(), .6) * 22;
    const z = Math.random() * 120;
    for (let k = 0; k < 2; k++) {
      const j = i * 2 + k;
      lSeed[j * 3] = Math.cos(th) * r; lSeed[j * 3 + 1] = Math.sin(th) * r; lSeed[j * 3 + 2] = z;
      lEnd[j] = k;
    }
  }
  lGeo.setAttribute('position', new THREE.BufferAttribute(lSeed, 3));
  lGeo.setAttribute('aEnd', new THREE.BufferAttribute(lEnd, 1));
  const lUniforms = { uOffset: { value: 0 }, uLen: { value: 0.2 }, uVis: { value: 0 } };
  const lines = new THREE.LineSegments(lGeo, new THREE.ShaderMaterial({
    uniforms: lUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uOffset, uLen;
      attribute float aEnd;
      varying float vA; varying float vH;
      void main(){
        float z = mod(position.z + uOffset, 120.) - 110.;
        z -= aEnd * uLen;
        vA = smoothstep(-110., -50., z) * (1. - aEnd * 0.9);
        vH = fract(position.x * 0.13 + position.y * 0.07);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, z, 1.);
      }`,
    fragmentShader: /* glsl */`
      uniform float uVis;
      varying float vA; varying float vH;
      void main(){
        vec3 c = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.17, 0.84), vH);
        c = mix(c, vec3(1.), 0.35);
        gl_FragColor = vec4(c * vA * uVis, 1.);
      }`,
  }));
  lines.frustumCulled = false;
  scene.add(lines);

  /* ---------- post ---------- */
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.5, 0.22);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fx = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null }, uTime: { value: 0 }, uRGB: { value: 0 }, uWarp: { value: 0 },
      uFlash: { value: 0 }, uRes: { value: new THREE.Vector2(innerWidth, innerHeight) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse; uniform float uTime, uRGB, uWarp, uFlash; uniform vec2 uRes;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 c = vUv - .5;
        float r2 = dot(c, c);
        vec2 uv = .5 + c * (1. - uWarp * 0.35 * r2 - uRGB * 0.2 * r2);
        vec2 off = c * (0.004 + uRGB * 0.03 + uWarp * 0.05) * (0.4 + r2 * 3.);
        vec3 col;
        col.r = texture2D(tDiffuse, uv + off).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - off).b;
        // zoom blur during hyperspace
        if (uWarp > 0.01) {
          vec3 acc = vec3(0.);
          for (int i = 1; i <= 8; i++) {
            float k = float(i) / 8.;
            acc += texture2D(tDiffuse, .5 + (uv - .5) * (1. - k * 0.12 * uWarp)).rgb;
          }
          col = mix(col, acc / 8., uWarp * 0.8);
        }
        col += (hash(vUv * uRes + fract(uTime) * 100.) - .5) * 0.05;
        col *= 1. - r2 * 1.1;
        col *= 0.97 + 0.03 * sin(vUv.y * uRes.y * 1.6 + uTime * 8.);
        col = mix(col, vec3(1.), uFlash);
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  composer.addPass(fx);

  /* ---------- sizing ---------- */
  function camZBase() {
    const asp = innerWidth / innerHeight;
    return asp < 1 ? 7 + (1 - asp) * 9 : 7;
  }
  let resizeT;
  function onResize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fx.uniforms.uRes.value.set(w, h);
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const t = genText(COUNT, 'SKAJBY', aspectW());
      pGeo.attributes.aP3.array.set(t);
      pGeo.attributes.aP3.needsUpdate = true;
    }, 250);
  }
  addEventListener('resize', onResize);

  // re-generate text target once the display font is available
  if (document.fonts && document.fonts.load) {
    document.fonts.load('800 100px Unbounded').then(() => {
      const t = genText(COUNT, 'SKAJBY', aspectW());
      pGeo.attributes.aP3.array.set(t);
      pGeo.attributes.aP3.needsUpdate = true;
    }).catch(() => {});
  }

  /* ---------- interaction hooks ---------- */
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  function screenToWorld(nx, ny, out) {
    ray.setFromCamera({ x: nx, y: ny }, camera);
    return ray.ray.intersectPlane(plane, out) ? out : null;
  }

  addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    const nx = (e.clientX / innerWidth) * 2 - 1, ny = -(e.clientY / innerHeight) * 2 + 1;
    if (screenToWorld(nx, ny, hit)) {
      pUniforms.uShockP.value.copy(hit);
      pUniforms.uShockT.value = state.time;
      state.shockKick = 1;
    }
  });

  api.shock = () => {
    pUniforms.uShockP.value.set(0, 0, 0);
    pUniforms.uShockT.value = state.time;
    state.shockKick = 1;
  };

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let fpsAcc = 0, fpsFrames = 0;
  const hudFps = $('#hud-fps');
  $('#hud-count').textContent = COUNT.toLocaleString('cs-CZ');
  const statP = $('#stat-particles');
  statP.dataset.count = String(COUNT);
  let lineOffset = 0;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt * (reduced ? 0.4 : 1);
    const T = state.time;

    fpsAcc += dt; fpsFrames++;
    if (fpsAcc > 0.5) { hudFps.textContent = Math.round(fpsFrames / fpsAcc); fpsAcc = 0; fpsFrames = 0; }

    updateScroll(dt);

    state.mouseS.x = damp(state.mouseS.x, state.mouse.x, 6, dt);
    state.mouseS.y = damp(state.mouseS.y, state.mouse.y, 6, dt);
    state.audio = damp(state.audio, synth.level(), 18, dt);
    state.chaos = damp(state.chaos, state.chaosOn ? 1 : 0, 3, dt);
    state.morphS = damp(state.morphS, state.morph, 4, dt);
    state.shockKick = damp(state.shockKick || 0, 0, 3, dt);

    // hover over the blob?
    const mx = state.mouseS.x, my = state.mouseS.y;
    if (screenToWorld(mx, my, hit)) state.mouse3.copy(hit);
    const blobScreenDist = Math.hypot(mx * camera.aspect, my);
    state.hover = damp(state.hover, blobScreenDist < 0.45 && state.heroP < 0.5 ? 1 : 0, 4, dt);

    // camera
    const zb = camZBase();
    const warpE = state.warp;
    camera.position.x = damp(camera.position.x, mx * 0.6, 3, dt);
    camera.position.y = damp(camera.position.y, my * 0.4, 3, dt);
    camera.position.z = zb + Math.sin(state.morphS * Math.PI) * 0.4 - warpE * 2;
    camera.fov = 55 + warpE * 55 + state.vel * 8;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    camera.rotation.z = mx * -0.04 + Math.sin(T * 0.3) * 0.01 + warpE * Math.sin(T * 9) * 0.02;

    // blob: visible in hero, fades in morph, returns for the warp finale
    const inMorph = smooth(0, 0.6, state.morphS);
    const outro = state.warpSec;
    const blobScale = Math.max(0.0001, (1 - inMorph) * (1 - state.heroP * 0.25) + outro * 0.85);
    const breathe = 1 + Math.sin(T * 1.3) * 0.02 + state.audio * 0.15 + state.shockKick * 0.12;
    blob.scale.setScalar(blobScale * breathe);
    blob.visible = blobScale > 0.002;
    blob.rotation.y += dt * (0.15 + state.chaos);
    blob.rotation.x = damp(blob.rotation.x, my * 0.4, 2, dt);
    blob.position.y = damp(blob.position.y, state.heroP * 0.6, 4, dt);
    blobUniforms.uTime.value = T;
    blobUniforms.uAudio.value = state.audio;
    blobUniforms.uHover.value = state.hover + state.shockKick * 0.8;
    blobUniforms.uChaos.value = state.chaos;

    rings.scale.setScalar(blobScale * (1 + state.audio * 0.2));
    rings.visible = blob.visible;
    rings.position.copy(blob.position);
    rings.children.forEach((r, i) => {
      r.rotation.x += r.userData.spin.x * dt * (1 + state.chaos * 4 + warpE * 6);
      r.rotation.y += r.userData.spin.y * dt * (1 + state.chaos * 4 + warpE * 6);
      r.rotation.z += r.userData.spin.z * dt;
      r.material.opacity = 0.6 + 0.4 * Math.sin(T * 2 + i);
    });

    // particles
    pUniforms.uTime.value = T;
    pUniforms.uMorph.value = state.morphS;
    pUniforms.uChaos.value = state.chaos;
    pUniforms.uAudio.value = state.audio;
    pUniforms.uWarp.value = warpE;
    pUniforms.uTurb.value = 0.3 + Math.abs(state.vel) * 2.5;
    if (state.hasMouse && !isTouch) pUniforms.uMouse.value.copy(state.mouse3);
    const galaxyW = 1 - smooth(0.2, 1.2, state.morphS);
    points.rotation.y += dt * (0.05 + galaxyW * 0.1 + state.chaos * 0.6);
    points.rotation.x = damp(points.rotation.x, galaxyW * 0.45 + my * 0.15, 2, dt);
    // straighten the rotation for the text stage so it faces the camera
    const textFace = smooth(2.3, 3.0, state.morphS) * (1 - smooth(3.4, 3.9, state.morphS));
    if (textFace > 0.001) {
      const twoPi = Math.PI * 2;
      const target = Math.round(points.rotation.y / twoPi) * twoPi;
      points.rotation.y = lerp(points.rotation.y, target + mx * 0.25, textFace * 0.12);
      points.rotation.x = lerp(points.rotation.x, -my * 0.12, textFace * 0.2);
    }

    // warp streaks
    const speed = 6 + Math.abs(state.vel) * 180 + warpE * 260;
    lineOffset += dt * speed;
    lUniforms.uOffset.value = lineOffset;
    lUniforms.uLen.value = 0.3 + Math.abs(state.vel) * 25 + warpE * 40;
    lUniforms.uVis.value = clamp(smooth(3.3, 4, state.morphS) * 0.35 + Math.abs(state.vel) * 4 + warpE * 2, 0, 2.5);

    // post
    bloom.strength = 0.7 + state.audio * 0.9 + warpE * 1.6 + state.chaos * 0.4 + state.shockKick * 0.5;
    fx.uniforms.uTime.value = T;
    fx.uniforms.uRGB.value = clamp(Math.abs(state.vel) * 3 + state.chaos * 0.35 + state.shockKick * 0.3, 0, 1.2);
    fx.uniforms.uWarp.value = warpE;
    fx.uniforms.uFlash.value = state.flash;

    composer.render();
    updateDomFrame(dt);
    requestAnimationFrame(frame);
  }

  initDom();
  finishLoading();
  requestAnimationFrame(frame);
}

/* =========================================================
   DOM / scroll / UI
   ========================================================= */
const api = {};
let sections = {};

function measure() {
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const morph = $('#morph'), warp = $('#warp');
  sections = {
    morphTop: top(morph), morphH: morph.offsetHeight,
    warpTop: top(warp), warpH: warp.offsetHeight,
    docH: document.documentElement.scrollHeight - innerHeight,
  };
}

const MORPH_STATES = [
  ['GALAXIE', 'Spirální galaxie. Čtyři ramena, tisíce hvězd, jedna gravitace.'],
  ['SFÉRA', 'Dokonalá koule z Fibonacciho spirály. Každá částice na svém místě.'],
  ['UZEL', 'Torusový uzel (2,3). Nekonečná smyčka, která se nikdy nerozváže.'],
  ['SKAJBY', 'Hmota si pamatuje jméno. Pohni myší a rozfoukej ho.'],
  ['PRACH', 'Všechno se rozpadne na hvězdný prach. A letí dál.'],
];
let lastStage = -1;

function updateScroll(dt) {
  const y = scrollY;
  const prev = state.scrollS;
  state.scrollS = damp(state.scrollS, y, 10, dt);
  const v = (state.scrollS - prev) / Math.max(innerHeight, 1);
  state.vel = damp(state.vel, clamp(v, -0.2, 0.2), 8, dt);
  state.heroP = clamp(y / innerHeight);

  const { morphTop = 0, morphH = 1, warpTop = 0, warpH = 1, docH = 1 } = sections;
  const mp = clamp((y - morphTop) / Math.max(morphH - innerHeight, 1));
  // hold each shape for a while between transitions
  const raw = mp * 4;
  const seg = Math.min(Math.floor(raw), 3);
  const f = smooth(0.2, 0.8, raw - seg);
  state.morph = y < morphTop ? 0 : seg + f;
  state.warpSec = smooth(warpTop - innerHeight, warpTop + warpH * 0.3, y);

  const stage = Math.round(clamp(renderer ? state.morphS : state.morph, 0, 4));
  if (stage !== lastStage) {
    lastStage = stage;
    const [name, desc] = MORPH_STATES[stage];
    scramble($('#morph-name'), name);
    $('#morph-desc').textContent = desc;
    $$('#morph-steps span').forEach((s, i) => s.classList.toggle('on', i === stage));
  }
  $('#morph-meter').style.width = (mp * 100).toFixed(1) + '%';
  const pct = clamp(y / Math.max(docH, 1));
  $('#progress').style.height = (pct * 100).toFixed(1) + '%';
  const inMorphSec = y > morphTop - innerHeight * 0.5 && y < morphTop + morphH - innerHeight * 0.5;
  document.body.classList.toggle('hud-on', y > innerHeight * 0.6 && !inMorphSec && y < docH - innerHeight * 0.6);
  $('#hud-scroll').textContent = String(Math.round(pct * 100)).padStart(3, '0');
  document.documentElement.style.setProperty('--skew', (state.vel * -60).toFixed(2) + 'deg');
}

/* --- text scramble --- */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scramble(el, text, dur = 700) {
  if (!el) return;
  if (reduced) { el.textContent = text; return; }
  const from = el.textContent;
  const len = Math.max(from.length, text.length);
  const start = performance.now();
  cancelAnimationFrame(el._scr);
  const tick = (now) => {
    const p = clamp((now - start) / dur);
    let out = '';
    for (let i = 0; i < len; i++) {
      const reveal = p * len * 1.4 - i * 0.4;
      if (reveal >= 1) out += text[i] || '';
      else if (reveal > 0) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += from[i] || '';
    }
    el.textContent = out;
    if (p < 1) el._scr = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._scr = requestAnimationFrame(tick);
}

function scrambleHTML(el) {
  // scramble text nodes while keeping <br>
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  const spans = parts.map((p) => { const s = document.createElement('span'); s.textContent = p.replace(/&shy;/g, ''); return s; });
  el.innerHTML = '';
  spans.forEach((s, i) => { el.appendChild(s); if (i < spans.length - 1) el.appendChild(document.createElement('br')); });
  return () => spans.forEach((s) => { const t = s.textContent; s.textContent = ''; scramble(s, t, 1100); });
}

let domReady = false;
let heroChars = [];
let titleCache = [];

function initDom() {
  if (domReady) return;
  domReady = true;

  // split hero title into chars
  $$('[data-split]').forEach((line) => {
    const txt = line.textContent;
    line.textContent = '';
    [...txt].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      s.style.setProperty('--i', heroChars.length);
      line.appendChild(s);
      heroChars.push(s);
    });
  });

  // manifest words
  const mt = $('#manifest-text');
  const hot = new Set(['hmota', 'prostor.', 'realitu.', 'rázovou', 'vlnu.', 'nudné.']);
  mt.innerHTML = mt.textContent.trim().split(/\s+/).map((w) => `<span class="w${hot.has(w.toLowerCase()) ? ' hot-able' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', mt);

  // reveal / scramble on view
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.hasAttribute('data-reveal')) el.classList.add('in');
      if (el.hasAttribute('data-scramble')) el._play && el._play();
      if (el.hasAttribute('data-count')) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.2 });
  $$('[data-scramble]').forEach((el) => { el._play = scrambleHTML(el); io.observe(el); });
  $$('[data-reveal]').forEach((el) => io.observe(el));
  $$('[data-count]').forEach((el) => io.observe(el));

  // nav scramble on hover
  $$('[data-scramble-hover]').forEach((el) => {
    const t = el.textContent;
    el.addEventListener('mouseenter', () => scramble(el, t, 450));
  });

  // cursor
  const cur = $('#cursor'), dot = $('.c-dot'), ring = $('.c-ring'), label = $('#c-label');
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  addEventListener('pointermove', (e) => {
    cx = e.clientX; cy = e.clientY;
    state.hasMouse = true;
    state.mouse.x = (cx / innerWidth) * 2 - 1;
    state.mouse.y = -(cy / innerHeight) * 2 + 1;
    $('#hud-xy').textContent = `${state.mouse.x.toFixed(2)} / ${state.mouse.y.toFixed(2)}`;
  }, { passive: true });
  addEventListener('pointerdown', () => cur.classList.add('down'));
  addEventListener('pointerup', () => cur.classList.remove('down'));
  document.addEventListener('mouseover', (e) => {
    const h = e.target.closest('[data-hover]');
    cur.classList.toggle('hover', !!h);
    label.textContent = h ? (h.dataset.cursor || '') : '';
  });

  // tilt cards
  $$('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', ((px - .5) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - py) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  });

  // magnetic
  const mags = $$('[data-magnetic]');
  addEventListener('pointermove', (e) => {
    mags.forEach((m) => {
      const r = m.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(x, y), R = r.width * 0.9;
      if (d < R) m.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.06)`;
      else m.style.transform = '';
    });
  }, { passive: true });

  // sound
  const sb = $('#sound');
  sb.addEventListener('click', async () => {
    const on = await synth.toggle();
    sb.classList.toggle('on', on);
    sb.setAttribute('aria-pressed', String(on));
    scramble($('.sound-txt', sb), on ? 'ZVUK ZAP' : 'ZVUK VYP', 350);
  });

  // chaos mode
  addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.closest('input, textarea, button, a')) {
      e.preventDefault();
      state.chaosOn = !state.chaosOn;
      document.body.classList.toggle('chaos', state.chaosOn);
    }
  });

  // warp
  $('#warp-btn').addEventListener('click', hyperjump);

  // clock
  const clk = $('#clock');
  const tickClock = () => {
    clk.textContent = new Date().toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour12: false }) + ' PRG';
  };
  tickClock(); setInterval(tickClock, 1000);

  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);

  // per-frame DOM work (also used without WebGL)
  window.__dom = { words, cursor: { dot, ring, get: () => ({ cx, cy }), set: (x, y) => { rx = x; ry = y; }, r: () => ({ rx, ry }) } };
  if (!renderer) {
    const loop = () => { updateScroll(1 / 60); updateDomFrame(1 / 60); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}

function updateDomFrame(dt) {
  const d = window.__dom;
  if (!d) return;

  // cursor
  const { cx, cy } = d.cursor.get();
  let { rx, ry } = d.cursor.r();
  rx = damp(rx, cx, 14, dt); ry = damp(ry, cy, 14, dt);
  d.cursor.set(rx, ry);
  d.cursor.dot.style.transform = `translate(${cx}px, ${cy}px)`;
  d.cursor.ring.style.transform = `translate(${rx}px, ${ry}px)`;

  // manifest word lighting
  const mt = $('#manifest-text');
  const r = mt.getBoundingClientRect();
  const p = clamp((innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.3));
  const n = Math.floor(p * d.words.length * 1.05);
  d.words.forEach((w, i) => {
    const lit = i < n;
    if (w._lit !== lit) {
      w._lit = lit;
      w.classList.toggle('lit', lit);
      w.classList.toggle('hot', lit && w.classList.contains('hot-able'));
    }
  });

  // hero variable-weight reacting to cursor
  if (state.heroP < 1 && !isTouch && document.body.classList.contains('ready')) {
    if (!titleCache.length || titleCache._y !== scrollY) {
      titleCache = heroChars.map((c) => { const b = c.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
      titleCache._y = scrollY;
    }
    heroChars.forEach((c, i) => {
      const [x, y] = titleCache[i];
      const dd = Math.hypot(cx - x, cy - y);
      const w = Math.round(200 + 700 * smooth(420, 40, dd));
      if (c._w !== w) { c._w = w; c.style.fontVariationSettings = `'wght' ${w}`; c.style.fontWeight = w; }
    });
  }
}

function countUp(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const start = performance.now(), dur = 1800;
  const isZero = target === 0;
  const tick = (now) => {
    const p = clamp((now - start) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    if (isZero) el.textContent = p < 1 ? String((Math.random() * 999) | 0) : '0';
    else el.textContent = Math.round(target * e).toLocaleString('cs-CZ');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* --- hyperjump sequence --- */
function tween(dur, fn) {
  return new Promise((res) => {
    const s = performance.now();
    const t = (now) => { const p = clamp((now - s) / dur); fn(p); p < 1 ? requestAnimationFrame(t) : res(); };
    requestAnimationFrame(t);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function hyperjump() {
  if (state.warping) return;
  state.warping = true;
  const btn = $('#warp-btn'), cd = $('#countdown'), flash = $('#flash');
  btn.classList.add('charging');
  synth.whoosh(3.2);
  for (const n of ['3', '2', '1']) {
    cd.innerHTML = `<span>${n}</span>`;
    await wait(700);
  }
  cd.innerHTML = '';
  await tween(1300, (p) => { state.warp = p * p; });
  await tween(250, (p) => { state.flash = p; flash.style.opacity = p; });
  // reset reality
  scrollTo({ top: 0, behavior: 'instant' });
  state.scrollS = 0;
  state.morph = state.morphS = 0;
  state.warp = 0;
  btn.classList.remove('charging');
  api.shock && api.shock();
  await tween(1400, (p) => { const v = 1 - p; state.flash = v; flash.style.opacity = v; });
  state.warping = false;
}

/* --- loader --- */
function finishLoading() {
  const num = $('#loader-num'), bar = $('#loader-bar'), log = $('#loader-log');
  const logs = ['kompiluji shadery…', 'rozprašuji částice…', 'ohýbám časoprostor…', 'ladím syntezátor…', 'realita připravena.'];
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(2500)]) : Promise.resolve();
  let fontsDone = false;
  fontsReady.then(() => { fontsDone = true; });
  const start = performance.now();
  const minDur = reduced ? 300 : 1800;
  let shown = 0;
  const tick = (now) => {
    const t = clamp((now - start) / minDur);
    const target = fontsDone ? t : Math.min(t, 0.9);
    shown = Math.max(shown, target);
    const v = Math.round(shown * 100);
    num.textContent = String(v).padStart(3, '0');
    bar.style.width = v + '%';
    log.textContent = logs[Math.min(logs.length - 1, Math.floor(shown * logs.length))];
    if (shown < 1) requestAnimationFrame(tick);
    else {
      setTimeout(() => {
        $('#loader').classList.add('done');
        document.body.classList.remove('is-loading');
        document.body.classList.add('ready');
        measure();
        api.shock && api.shock();
      }, 250);
    }
  };
  requestAnimationFrame(tick);
}

/* =========================================================
   boot
   ========================================================= */
if (!renderer) {
  document.body.classList.add('no-gl');
  initDom();
  finishLoading();
} else {
  initScene();
}
