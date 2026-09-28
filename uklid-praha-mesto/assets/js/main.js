import { initBubbles } from './bubbles.js';
const CONFIG = window.UPM_CONFIG; // nastavení z assets/js/config.js

// Hlavička: stín po odscrollování + mobilní menu
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const toggle = document.querySelector('.nav-toggle');
const setNav = (open) => {
  document.body.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
};
toggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
document.querySelectorAll('.main-nav a').forEach((a) => a.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

// Plynulé objevování sekcí
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => {
  // co je vidět hned po načtení, ukázat bez čekání
  if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
  else io.observe(el);
});

// 3D bubliny v úvodu
initBubbles(document.getElementById('hero-canvas'), { layout: 'hero' });

// Jemný 3D náklon telefonu podle kurzoru
const phone = document.getElementById('tilt-phone');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (phone && !reduce && window.matchMedia('(hover: hover)').matches) {
  const stage = phone.parentElement;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    phone.style.transform = `rotateY(${-16 + x * 14}deg) rotateX(${8 - y * 10}deg) rotateZ(1deg)`;
  });
  stage.addEventListener('pointerleave', () => { phone.style.transform = ''; });
}

// Poptávkový formulář → předvyplněný e-mail
const form = document.getElementById('inquiry');
const errBox = document.getElementById('inquiry-error');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (!d.name.trim() || !d.phone.trim()) {
    errBox.className = 'alert alert-error';
    errBox.textContent = 'Vyplňte prosím jméno a telefon, ať se vám můžeme ozvat.';
    errBox.hidden = false;
    (d.name.trim() ? form.elements.phone : form.elements.name).focus();
    return;
  }
  errBox.hidden = true;
  const details = [
    `Jméno: ${d.name}`,
    `Telefon: ${d.phone}`,
    d.email && `E-mail: ${d.email}`,
    `Služba: ${d.service}`,
    d.place && `Lokalita / prostory: ${d.place}`,
  ].filter(Boolean).join('\n');
  const body = d.message.trim() ? `${details}\n\n${d.message.trim()}` : details;
  const subject = `Poptávka – ${d.service}`;
  window.location.href = `mailto:${CONFIG.company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  errBox.className = 'alert alert-info';
  errBox.textContent = `Otevíráme váš e-mail s připravenou zprávou. Pokud se neotevřel, napište nám na ${CONFIG.company.email} nebo zavolejte na ${CONFIG.company.phone}.`;
  errBox.hidden = false;
});

document.getElementById('year').textContent = new Date().getFullYear();
