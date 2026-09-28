(() => {
  // assets/js/bubbles.js
  var VERT = (
    /* glsl */
    `
  uniform float uTime;
  uniform float uSeed;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  void main() {
    vec3 p = position;
    float w = sin(uTime * 1.1 + p.y * 3.0 + uSeed) * 0.018 + sin(uTime * 0.7 + p.x * 4.0 + uSeed * 2.0) * 0.012;
    p += normal * w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vP = p;
    gl_Position = projectionMatrix * mv;
  }
`
  );
  var FRAG = (
    /* glsl */
    `
  uniform float uTime;
  uniform float uSeed;
  uniform float uDark;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  vec3 pal(float t) { return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(vV);
    float ndv = clamp(dot(n, v), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 2.4);

    // tenk\xE1 vrstva m\xFDdla \u2192 duhov\xE9 p\u0159elivy
    float film = ndv * 1.3 + vP.y * 0.35 + sin(vP.x * 2.2 + uTime * 0.35 + uSeed) * 0.18 + uSeed * 0.17;
    vec3 iri = pal(film);
    vec3 brand = mix(vec3(0.05, 0.52, 0.49), vec3(0.27, 0.34, 0.72), 0.5 + 0.5 * sin(film * 2.6));
    vec3 col = mix(brand, iri, 0.38);

    float alpha = fres * 0.72 + 0.035;

    vec3 L1 = normalize(vec3(-0.55, 0.75, 0.65));
    vec3 L2 = normalize(vec3(0.7, -0.35, 0.45));
    float s1 = pow(max(dot(n, normalize(L1 + v)), 0.0), 110.0);
    float s2 = pow(max(dot(n, normalize(L2 + v)), 0.0), 48.0) * 0.22;
    float spec = s1 + s2;
    col = mix(col, vec3(1.0), clamp(spec, 0.0, 1.0));
    alpha = max(alpha, clamp(s1 * 1.1 + s2, 0.0, 0.95));
    alpha = mix(alpha, alpha * 1.25, uDark);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
  }
`
  );
  function initBubbles(canvas, { layout = "hero", dark = false } = {}) {
    const THREE = window.THREE;
    if (!THREE || !canvas) return null;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return null;
    }
    renderer.setClearColor(0, 0);
    const reduce2 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 14);
    const group = new THREE.Group();
    scene.add(group);
    const geo = new THREE.SphereGeometry(1, 72, 54);
    const layouts = {
      hero: [
        [1.6, 0.6, 0, 2.25],
        [-1.4, 2.4, -2, 0.9],
        [3.9, 2.8, -3, 0.75],
        [3.4, -1.9, 1, 0.95],
        [-0.4, -2.3, 1.5, 0.55],
        [-2.6, -0.4, -4, 0.7],
        [0.3, 3.6, -5, 0.45],
        [5, 0.4, -6, 0.6],
        [-3.2, 3.2, -1, 0.35]
      ],
      heroMobile: [
        [1.4, -0.4, 0, 1.7],
        [-2, 1.6, -2, 0.7],
        [3, 2.4, -3, 0.55],
        [-1.2, -2.8, 1, 0.5],
        [2.8, -3, -1, 0.6]
      ],
      gate: [
        [-4.6, 2.2, -1, 1.5],
        [4.8, -1.8, -1, 1.9],
        [5.2, 3.2, -4, 0.7],
        [-5.4, -3, -2, 0.9],
        [-2.6, 4.2, -5, 0.5],
        [2.2, -4.4, -3, 0.55],
        [0.4, 4.6, -7, 0.4]
      ]
    };
    let bubbles = [];
    const build = (key) => {
      bubbles.forEach((b) => {
        group.remove(b.mesh);
        b.mesh.material.dispose();
      });
      bubbles = layouts[key].map(([x, y, z, r], i) => {
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms: { uTime: { value: 0 }, uSeed: { value: i * 1.37 + 0.4 }, uDark: { value: dark ? 1 : 0 } },
          transparent: true,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.scale.setScalar(r);
        mesh.renderOrder = -z;
        group.add(mesh);
        return { mesh, base: new THREE.Vector3(x, y, z), r, phase: i * 1.9, speed: 0.35 + i % 4 * 0.08 };
      });
    };
    let currentLayout = "";
    const pickLayout = () => {
      const w = canvas.clientWidth;
      const key = layout === "hero" ? w < 640 ? "heroMobile" : "hero" : layout;
      if (key !== currentLayout) {
        currentLayout = key;
        build(key);
      }
    };
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 17 : 14;
      camera.updateProjectionMatrix();
      pickLayout();
      if (!running) render(lastT);
    };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      pointer.tx = e.clientX / window.innerWidth * 2 - 1;
      pointer.ty = e.clientY / window.innerHeight * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let scrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
    }, { passive: true });
    let lastT = 0;
    const render = (t) => {
      lastT = t;
      const time = t / 1e3;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      group.rotation.y = pointer.x * 0.12;
      group.rotation.x = pointer.y * 0.08;
      group.position.y = Math.min(scrollY, 900) * 35e-4;
      bubbles.forEach((b) => {
        const s = b.speed;
        b.mesh.position.x = b.base.x + Math.sin(time * s * 0.8 + b.phase) * 0.18 + pointer.x * (0.25 + b.base.z * 0.04);
        b.mesh.position.y = b.base.y + Math.sin(time * s + b.phase) * 0.32 - pointer.y * 0.15;
        b.mesh.rotation.y = time * 0.1 + b.phase;
        b.mesh.material.uniforms.uTime.value = time;
      });
      renderer.render(scene, camera);
    };
    let running = false;
    let visible = true;
    let raf = 0;
    const loop = (t) => {
      render(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running && !reduce2 && visible && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }).observe(canvas);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    resize();
    if (reduce2) render(4e3);
    else start();
    canvas.classList.add("ready");
    return { stop, start };
  }

  // assets/js/main.js
  var CONFIG = window.UPM_CONFIG;
  var header = document.querySelector(".site-header");
  var onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  var toggle = document.querySelector(".nav-toggle");
  var setNav = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zav\u0159\xEDt menu" : "Otev\u0159\xEDt menu");
  };
  toggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  document.querySelectorAll(".main-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });
  var io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  initBubbles(document.getElementById("hero-canvas"), { layout: "hero" });
  var phone = document.getElementById("tilt-phone");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (phone && !reduce && window.matchMedia("(hover: hover)").matches) {
    const stage = phone.parentElement;
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = `rotateY(${-16 + x * 14}deg) rotateX(${8 - y * 10}deg) rotateZ(1deg)`;
    });
    stage.addEventListener("pointerleave", () => {
      phone.style.transform = "";
    });
  }
  var form = document.getElementById("inquiry");
  var errBox = document.getElementById("inquiry-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !d.phone.trim()) {
      errBox.textContent = "Vypl\u0148te pros\xEDm jm\xE9no a telefon, a\u0165 se v\xE1m m\u016F\u017Eeme ozvat.";
      errBox.hidden = false;
      (d.name.trim() ? form.elements.phone : form.elements.name).focus();
      return;
    }
    errBox.hidden = true;
    const details = [
      `Jm\xE9no: ${d.name}`,
      `Telefon: ${d.phone}`,
      d.email && `E-mail: ${d.email}`,
      `Slu\u017Eba: ${d.service}`,
      d.place && `Lokalita / prostory: ${d.place}`
    ].filter(Boolean).join("\n");
    const body = d.message.trim() ? `${details}

${d.message.trim()}` : details;
    const subject = `Popt\xE1vka \u2013 ${d.service}`;
    window.location.href = `mailto:${CONFIG.company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.getElementById("year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
})();
