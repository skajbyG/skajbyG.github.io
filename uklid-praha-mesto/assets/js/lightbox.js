// Prohlížeč fotek (galerie) a porovnání „před / po" posuvníkem.
import { icon, esc } from './util.js';

const box = document.getElementById('lightbox');
const content = document.getElementById('lb-content');
const caption = document.getElementById('lb-caption');
const prev = document.getElementById('lb-prev');
const next = document.getElementById('lb-next');
const closeBtn = document.getElementById('lb-close');

let items = [];
let index = 0;
let lastFocus = null;

if (box) {
  closeBtn.innerHTML = icon.close;
  prev.innerHTML = icon.left;
  next.innerHTML = icon.right;
  closeBtn.addEventListener('click', close);
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && items.length > 1) show(index - 1);
    if (e.key === 'ArrowRight' && items.length > 1) show(index + 1);
  });
  // přejetí prstem
  let sx = null;
  content.addEventListener('touchstart', (e) => { if (items.length > 1) sx = e.touches[0].clientX; }, { passive: true });
  content.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    sx = null;
  });
}

function openBox() {
  lastFocus = document.activeElement;
  box.classList.add('open');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

function close() {
  box.classList.remove('open');
  content.innerHTML = '';
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

function show(i) {
  index = (i + items.length) % items.length;
  const it = items[index];
  content.innerHTML = `<img src="${esc(it.url)}" alt="${esc(it.caption)}">`;
  caption.textContent = `${it.caption}${items.length > 1 ? ` · ${index + 1} / ${items.length}` : ''}`;
}

export function openGallery(list, start = 0) {
  items = list;
  prev.hidden = next.hidden = list.length < 2;
  show(start);
  openBox();
}

export function openCompare(beforeUrl, afterUrl, text) {
  items = [];
  prev.hidden = next.hidden = true;
  caption.textContent = text;
  content.innerHTML = `
    <div class="compare" style="--pos:50%" tabindex="0" role="slider" aria-label="Porovnání před a po" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
      <img src="${esc(beforeUrl)}" alt="Před úklidem">
      <img class="cmp-after" src="${esc(afterUrl)}" alt="Po úklidu">
      <span class="cmp-label l">Před</span><span class="cmp-label r">Po</span>
      <span class="cmp-line"></span><span class="cmp-knob">${icon.swap}</span>
    </div>`;
  const el = content.querySelector('.compare');
  const set = (pct) => {
    const p = Math.max(0, Math.min(100, pct));
    el.style.setProperty('--pos', `${p}%`);
    el.setAttribute('aria-valuenow', String(Math.round(p)));
  };
  const fromEvent = (e) => {
    const r = el.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  let dragging = false;
  el.addEventListener('pointerdown', (e) => { dragging = true; el.setPointerCapture(e.pointerId); fromEvent(e); });
  el.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  el.addEventListener('pointerup', () => { dragging = false; });
  el.addEventListener('keydown', (e) => {
    const now = Number(el.getAttribute('aria-valuenow'));
    if (e.key === 'ArrowLeft') { set(now - 5); e.preventDefault(); e.stopPropagation(); }
    if (e.key === 'ArrowRight') { set(now + 5); e.preventDefault(); e.stopPropagation(); }
  });
  openBox();
  // krátká ukázka, že se dá posouvat
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let t0;
    const anim = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / 1100);
      if (dragging) return;
      set(50 + Math.sin(k * Math.PI * 2) * 18);
      if (k < 1) requestAnimationFrame(anim);
    };
    setTimeout(() => requestAnimationFrame(anim), 250);
  }
}
