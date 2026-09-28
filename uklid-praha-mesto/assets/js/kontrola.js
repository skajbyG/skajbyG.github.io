import { store, isDemo, DEMO_CODE } from './store.js';
import { initBubbles } from './bubbles.js';
import { openGallery, openCompare } from './lightbox.js';
const CONFIG = window.UPM_CONFIG; // nastavení z assets/js/config.js
import {
  icon, esc, fmt, minutesBetween, fmtDuration, fmtHours, plural, firstName, normalizeCode, storage, mapLink, todayISO,
} from './util.js';

const CODE_KEY = 'upm_client_code';
const $ = (id) => document.getElementById(id);

const gate = $('gate');
const dash = $('dash');
const form = $('code-form');
const input = $('code');
const err = $('code-error');
const submit = $('code-submit');

let data = null;
let bubbles = null;

if (isDemo()) {
  $('mode-banner').hidden = false;
  $('demo-hint').hidden = false;
}

$('use-demo').addEventListener('click', () => {
  input.value = DEMO_CODE;
  form.requestSubmit();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = normalizeCode(input.value);
  if (!code) {
    showError('Zadejte prosím přístupový kód.');
    input.focus();
    return;
  }
  await login(code);
});

$('logout').addEventListener('click', () => {
  storage.del(CODE_KEY);
  data = null;
  history.replaceState(null, '', location.pathname);
  dash.hidden = true;
  gate.hidden = false;
  $('logout').hidden = true;
  input.value = '';
  bubbles?.start();
  input.focus();
});

function showError(msg) {
  err.textContent = msg;
  err.hidden = !msg;
}

async function login(code, silent = false) {
  showError('');
  submit.disabled = true;
  submit.textContent = 'Načítám…';
  try {
    const s = await store();
    const res = await s.clientPortal(code);
    if (!res) {
      if (!silent) showError('Tento kód neznáme. Zkontrolujte jej prosím, případně nám zavolejte.');
      storage.del(CODE_KEY);
      return;
    }
    storage.set(CODE_KEY, code);
    data = res;
    renderDash();
  } catch (e) {
    showError(e.message || 'Něco se nepovedlo. Zkuste to prosím znovu.');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Zobrazit mé úklidy';
  }
}

function renderDash() {
  gate.hidden = true;
  dash.hidden = false;
  $('logout').hidden = false;
  bubbles?.stop();
  window.scrollTo(0, 0);

  $('client-name').textContent = `Dobrý den, ${data.client.name}`;
  const n = data.cleanings.length;
  $('dash-sub').textContent = n
    ? `Evidujeme ${n} ${plural(n, 'úklid', 'úklidy', 'úklidů')}. Klepnutím na fotku ji zvětšíte.`
    : 'Zatím tu nejsou žádné záznamy.';

  // filtry
  const placeSel = $('filter-place');
  placeSel.innerHTML = `<option value="">Všechna místa</option>${data.places.map((p) => `<option value="${esc(p.id)}">${esc(p.label)}</option>`).join('')}`;
  placeSel.parentElement.hidden = data.places.length < 2;
  const months = [...new Set(data.cleanings.map((c) => fmt.monthKey(c.date)))];
  const monthSel = $('filter-month');
  monthSel.innerHTML = `<option value="">Všechny měsíce</option>${months.map((m) => `<option value="${m}">${fmt.monthLabel(m)}</option>`).join('')}`;
  placeSel.onchange = monthSel.onchange = renderList;

  renderStats();
  renderList();
}

function renderStats() {
  const thisMonth = fmt.monthKey(todayISO());
  const inMonth = data.cleanings.filter((c) => fmt.monthKey(c.date) === thisMonth);
  const minutes = inMonth.reduce((sum, c) => sum + minutesBetween(c.start_time, c.end_time), 0);
  const last = data.cleanings[0];
  const photoCount = data.cleanings.reduce((s, c) => s + c.photos.length, 0);
  $('stats').innerHTML = `
    <div class="stat"><small>Poslední úklid</small><b>${last ? `${fmt.day(last.date)}. ${parseInt(last.date.slice(5, 7), 10)}.` : '—'}</b><span>${last ? `${fmt.dayName(last.date)}, ${fmt.time(last.start_time)} – ${fmt.time(last.end_time)}` : 'zatím žádný'}</span></div>
    <div class="stat"><small>Tento měsíc</small><b>${inMonth.length}</b><span>${plural(inMonth.length, 'úklid', 'úklidy', 'úklidů')}</span></div>
    <div class="stat"><small>Odpracováno tento měsíc</small><b>${fmtHours(minutes)} h</b><span>${fmtDuration(minutes)}</span></div>
    <div class="stat"><small>Fotografií celkem</small><b>${photoCount}</b><span>před a po úklidu</span></div>`;
}

function renderList() {
  const place = $('filter-place').value;
  const month = $('filter-month').value;
  const list = data.cleanings.filter((c) => (!place || c.place_id === place) && (!month || fmt.monthKey(c.date) === month));
  const tl = $('timeline');
  if (!list.length) {
    tl.innerHTML = `<div class="empty"><b>Žádné úklidy</b>${data.cleanings.length ? 'Pro zvolený filtr nic nemáme.' : 'Jakmile u vás uklidíme, záznam se tu objeví.'}</div>`;
    return;
  }
  let html = '';
  let currentMonth = '';
  list.forEach((c) => {
    const m = fmt.monthKey(c.date);
    if (m !== currentMonth) {
      currentMonth = m;
      html += `<div class="month-label">${fmt.monthLabel(m)}</div>`;
    }
    html += cardHTML(c);
  });
  tl.innerHTML = html;
}

function cardHTML(c) {
  const mins = minutesBetween(c.start_time, c.end_time);
  const before = c.photos.filter((p) => p.kind === 'pred');
  const after = c.photos.filter((p) => p.kind !== 'pred');
  const place = c.place || data.places.find((p) => p.id === c.place_id);
  const photoBtn = (p) => `<button class="photo" type="button" data-cid="${esc(c.id)}" data-pid="${esc(p.id)}" aria-label="Zvětšit fotku ${p.kind === 'pred' ? 'před úklidem' : 'po úklidu'}">
      <img src="${esc(p.url)}" alt="" loading="lazy"><span class="tag ${p.kind === 'pred' ? '' : 'po'}">${p.kind === 'pred' ? 'Před' : 'Po'}</span></button>`;
  const group = (title, arr) => (arr.length ? `<div class="photo-group"><div class="photo-group-head">${title} · ${arr.length}</div><div class="photos">${arr.map(photoBtn).join('')}</div></div>` : '');

  const mailSubject = `Úklid ${fmt.short(c.date)} – ${place?.label || ''}`;
  const mailBody = `Dobrý den,\n\nk úklidu dne ${fmt.short(c.date)} (${fmt.time(c.start_time)}–${fmt.time(c.end_time)}, ${place?.address || ''}) bych rád(a) doplnil(a):\n\n`;

  return `
  <article class="cl-card">
    <div class="cl-date"><b>${fmt.day(c.date)}</b><small>${fmt.dayShort(c.date)} · ${fmt.monthShort(c.date)}</small></div>
    <div>
      <div class="cl-top">
        <div class="cl-time">${fmt.time(c.start_time)} – ${fmt.time(c.end_time)}<span>${fmtDuration(mins)}</span></div>
        <span class="badge">${icon.check}Dokončeno</span>
      </div>
      <div class="cl-meta">
        <span>${icon.clock}${esc(fmt.long(c.date))}</span>
        ${place ? `<span>${icon.pin}<a href="${mapLink(place.address)}" target="_blank" rel="noopener">${esc(place.label)} · ${esc(place.address)}</a></span>` : ''}
        ${c.employee_name ? `<span>${icon.user}Uklízel(a): ${esc(firstName(c.employee_name))}</span>` : ''}
      </div>
      ${c.tasks?.length ? `<div class="chips">${c.tasks.map((t) => `<span class="chip">${icon.check}${esc(t)}</span>`).join('')}</div>` : ''}
      ${c.note ? `<div class="cl-note"><b>Poznámka:</b> ${esc(c.note)}</div>` : ''}
      ${group('Před úklidem', before)}
      ${group('Po úklidu', after)}
      <div class="cl-actions">
        ${before.length && after.length ? `<button class="btn btn-sm btn-primary" type="button" data-compare="${esc(c.id)}">${icon.swap}Porovnat před / po</button>` : ''}
        <a class="btn btn-sm" href="mailto:${CONFIG.company.email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}">${icon.mail}Máte připomínku?</a>
      </div>
    </div>
  </article>`;
}

// Delegace kliknutí – fotky a porovnání
$('timeline').addEventListener('click', (e) => {
  const photo = e.target.closest('.photo');
  const cmp = e.target.closest('[data-compare]');
  if (photo) {
    const c = data.cleanings.find((x) => x.id === photo.dataset.cid);
    const ordered = [...c.photos.filter((p) => p.kind === 'pred'), ...c.photos.filter((p) => p.kind !== 'pred')];
    const items = ordered.map((p) => ({ url: p.url, caption: `${p.kind === 'pred' ? 'Před úklidem' : 'Po úklidu'} · ${fmt.short(c.date)}` }));
    openGallery(items, ordered.findIndex((p) => p.id === photo.dataset.pid));
  } else if (cmp) {
    const c = data.cleanings.find((x) => x.id === cmp.dataset.compare);
    const before = c.photos.find((p) => p.kind === 'pred');
    const after = c.photos.find((p) => p.kind !== 'pred');
    openCompare(before.url, after.url, `Před / po · ${fmt.short(c.date)} – posuňte jezdcem`);
  }
});

// Start: kód z odkazu (?kod=…) nebo zapamatovaný z minula
const params = new URLSearchParams(location.search);
const fromUrl = params.get('kod');
const remembered = storage.get(CODE_KEY);
if (fromUrl) {
  input.value = normalizeCode(fromUrl);
  login(normalizeCode(fromUrl));
} else if (remembered) {
  login(remembered, true);
}

if (!gate.hidden) bubbles = initBubbles($('gate-canvas'), { layout: 'gate' });
