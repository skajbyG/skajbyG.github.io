import { store, isDemo } from './store.js';
import { initBubbles } from './bubbles.js';
import { openGallery } from './lightbox.js';
import {
  icon, esc, fmt, todayISO, nowHM, minutesBetween, fmtDuration, firstName, uuid, toast, copyText, compressImage,
} from './util.js';

const $ = (id) => document.getElementById(id);
const DEFAULT_TASKS = [
  'Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Kuchyň', 'Koupelna a WC', 'Vynesení odpadků',
  'Mytí oken', 'Lednice', 'Trouba a digestoř', 'Ložní prádlo', 'Žehlení', 'Společné prostory', 'Tepování',
];

let s;
let session = null;
let clients = [];
let records = [];
let bubbles = null;

const state = {
  tasks: new Set(),
  extraTasks: [],
  photos: [], // { id, kind, blob, url, processing }
  kind: 'pred',
};

/* ---------- Start ---------- */
(async function init() {
  const demo = isDemo();
  $('mode-banner').hidden = !demo;
  $('demo-hint').hidden = !demo;
  $('login-demo').hidden = !demo;
  $('login-live').hidden = demo;

  $('t-new').innerHTML = `${icon.camera}Nový záznam`;
  $('t-records').innerHTML = `${icon.list}Záznamy`;
  $('t-clients').innerHTML = `${icon.users}Klienti`;
  $('ic-camera').innerHTML = icon.camera;
  $('ic-gallery').innerHTML = icon.image;
  $('ok-ic').innerHTML = icon.check;
  $('add-place-row').innerHTML = `${icon.plus}Další místo`;

  bubbles = initBubbles($('gate-canvas'), { layout: 'gate' });

  try {
    s = await store();
    session = await s.getSession();
  } catch (e) {
    showLoginError(`Nepodařilo se připojit: ${e.message}`);
    return;
  }
  if (session) showApp();
})();

/* ---------- Přihlášení ---------- */
function showLoginError(msg) {
  $('login-error').textContent = msg;
  $('login-error').hidden = !msg;
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoginError('');
  const f = e.target;
  const btn = $('login-submit');
  btn.disabled = true;
  btn.textContent = 'Přihlašuji…';
  try {
    s = s || (await store());
    session = isDemo()
      ? await s.signIn({ name: f.elements.name.value, pin: f.pin.value.trim() })
      : await s.signIn({ email: f.email.value, password: f.password.value });
    showApp();
  } catch (err) {
    showLoginError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Přihlásit se';
  }
});

$('logout').addEventListener('click', async () => {
  await s.signOut();
  session = null;
  $('app').hidden = true;
  $('gate').hidden = false;
  $('logout').hidden = true;
  $('who').hidden = true;
  bubbles?.start();
});

async function showApp() {
  $('gate').hidden = true;
  $('app').hidden = false;
  $('logout').hidden = false;
  $('who').hidden = false;
  $('who').textContent = session.name;
  bubbles?.stop();
  const h = new Date().getHours();
  $('greet-eyebrow').textContent = `${h < 10 ? 'Dobré ráno' : h < 18 ? 'Dobrý den' : 'Dobrý večer'}, ${firstName(session.name)}`;
  renderTasks();
  renderPlaceRows();
  resetForm();
  await loadClients();
}

/* ---------- Záložky ---------- */
const TITLES = { new: 'Zápis úklidu', records: 'Poslední záznamy', clients: 'Klienti a přístupové kódy' };
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.tab)));
function selectTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  $('tab-new').hidden = name !== 'new';
  $('tab-records').hidden = name !== 'records';
  $('tab-clients').hidden = name !== 'clients';
  $('greet').textContent = TITLES[name];
  if (name === 'records') loadRecords();
  if (name === 'clients') renderClients();
}

/* ---------- Klienti (výběr v zápisu) ---------- */
async function loadClients() {
  try {
    clients = await s.listClients();
  } catch (e) {
    toast(e.message);
    clients = [];
  }
  const sel = $('f-client');
  const prev = sel.value;
  sel.innerHTML = clients.length
    ? `<option value="">Vyberte klienta…</option>${clients.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}`
    : '<option value="">Nejdřív založte klienta v záložce Klienti</option>';
  if (clients.some((c) => c.id === prev)) sel.value = prev;
  else if (clients.length === 1) sel.value = clients[0].id;
  fillPlaces();
  renderClients();
}

function fillPlaces() {
  const c = clients.find((x) => x.id === $('f-client').value);
  const sel = $('f-place');
  const places = c?.places || [];
  sel.innerHTML = places.length
    ? (places.length > 1 ? '<option value="">Vyberte místo…</option>' : '') + places.map((p) => `<option value="${esc(p.id)}">${esc(p.label)} – ${esc(p.address)}</option>`).join('')
    : `<option value="">${c ? 'Klient nemá žádné místo' : '—'}</option>`;
  sel.disabled = !places.length;
  updateSummary();
}
$('f-client').addEventListener('change', fillPlaces);

/* ---------- Formulář úklidu ---------- */
const form = $('cleaning-form');

function resetForm() {
  form.reset();
  $('f-date').value = todayISO();
  state.tasks = new Set();
  state.extraTasks = [];
  state.photos.forEach((p) => p.url && URL.revokeObjectURL(p.url));
  state.photos = [];
  setKind('pred');
  renderTasks();
  renderPreviews();
  if (clients.length) {
    if (clients.length === 1) $('f-client').value = clients[0].id;
    fillPlaces();
  }
  showFormError('');
  updateSummary();
}

document.querySelectorAll('[data-now]').forEach((b) => b.addEventListener('click', () => {
  $(b.dataset.now).value = nowHM();
  updateSummary();
}));
form.addEventListener('input', updateSummary);
form.addEventListener('change', updateSummary);

function renderTasks() {
  const all = [...DEFAULT_TASKS, ...state.extraTasks];
  $('tasks').innerHTML = all.map((t) => `<button type="button" class="tchip" aria-pressed="${state.tasks.has(t)}" data-task="${esc(t)}">${icon.check}${esc(t)}</button>`).join('');
}
$('tasks').addEventListener('click', (e) => {
  const b = e.target.closest('.tchip');
  if (!b) return;
  const t = b.dataset.task;
  if (state.tasks.has(t)) state.tasks.delete(t); else state.tasks.add(t);
  b.setAttribute('aria-pressed', String(state.tasks.has(t)));
  updateSummary();
});
const addCustomTask = () => {
  const inp = $('custom-task');
  const t = inp.value.trim();
  if (!t) return;
  if (!DEFAULT_TASKS.includes(t) && !state.extraTasks.includes(t)) state.extraTasks.push(t);
  state.tasks.add(t);
  inp.value = '';
  renderTasks();
  updateSummary();
};
$('add-task').addEventListener('click', addCustomTask);
$('custom-task').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTask(); } });

/* ---------- Fotky ---------- */
function setKind(kind) {
  state.kind = kind;
  document.querySelectorAll('.kind-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
}
document.querySelectorAll('.kind-switch button').forEach((b) => b.addEventListener('click', () => setKind(b.dataset.kind)));

async function addFiles(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(f.name));
  if (!list.length) return;
  const kind = state.kind;
  const items = list.map((file) => ({ id: uuid(), kind, file, processing: true }));
  state.photos.push(...items);
  renderPreviews();
  for (const it of items) {
    try {
      it.blob = await compressImage(it.file);
      it.url = URL.createObjectURL(it.blob);
    } catch (e) {
      toast(`${it.file.name}: ${e.message}`);
      state.photos = state.photos.filter((p) => p !== it);
    }
    it.processing = false;
    delete it.file;
    renderPreviews();
  }
}

['in-camera', 'in-gallery'].forEach((id) => $(id).addEventListener('change', (e) => {
  addFiles(e.target.files);
  e.target.value = '';
}));
const drop = $('drop-gallery');
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer.files); });

function renderPreviews() {
  $('previews').innerHTML = state.photos.map((p) => `
    <div class="preview ${p.processing ? 'processing' : ''}" data-id="${p.id}">
      ${p.url ? `<img src="${p.url}" alt="">` : ''}
      <button type="button" class="kind ${p.kind === 'po' ? 'po' : ''}" data-act="kind" title="Přepnout Před / Po">${p.kind === 'po' ? 'Po' : 'Před'}</button>
      <button type="button" class="rm" data-act="rm" aria-label="Odebrat fotku">${icon.close}</button>
    </div>`).join('');
  updateSummary();
}
$('previews').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = btn.closest('.preview').dataset.id;
  const p = state.photos.find((x) => x.id === id);
  if (!p) return;
  if (btn.dataset.act === 'rm') {
    if (p.url) URL.revokeObjectURL(p.url);
    state.photos = state.photos.filter((x) => x !== p);
  } else {
    p.kind = p.kind === 'po' ? 'pred' : 'po';
  }
  renderPreviews();
});

/* ---------- Shrnutí + uložení ---------- */
function updateSummary() {
  const c = clients.find((x) => x.id === $('f-client').value);
  const p = c?.places.find((x) => x.id === $('f-place').value);
  const st = $('f-start').value;
  const en = $('f-end').value;
  const pred = state.photos.filter((x) => x.kind === 'pred').length;
  const po = state.photos.length - pred;
  const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
  $('summary').innerHTML = [
    row('Klient', c ? esc(c.name) : '—'),
    row('Místo', p ? esc(p.label) : '—'),
    row('Datum', $('f-date').value ? fmt.short($('f-date').value) : '—'),
    row('Čas', st && en ? `${fmt.time(st)} – ${fmt.time(en)}` : st ? `od ${fmt.time(st)}` : '—'),
    row('Délka', st && en ? fmtDuration(minutesBetween(st, en)) : '—'),
    row('Práce', state.tasks.size ? String(state.tasks.size) : '—'),
    row('Fotky', state.photos.length ? `${pred} před · ${po} po` : '—'),
  ].join('');
}

function showFormError(msg) {
  $('form-error').textContent = msg;
  $('form-error').hidden = !msg;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    client_id: $('f-client').value,
    place_id: $('f-place').value,
    date: $('f-date').value,
    start_time: $('f-start').value,
    end_time: $('f-end').value,
    tasks: [...state.tasks],
    note: $('f-note').value.trim(),
  };
  if (!data.client_id) return showFormError('Vyberte klienta.');
  if (!data.place_id) return showFormError('Vyberte místo úklidu.');
  if (!data.date) return showFormError('Vyplňte datum.');
  if (!data.start_time || !data.end_time) return showFormError('Vyplňte začátek i konec úklidu.');
  if (data.end_time === data.start_time) return showFormError('Konec musí být jiný než začátek.');
  if (data.end_time < data.start_time && !confirm('Konec je dřív než začátek – úklid probíhal přes půlnoc?')) return;
  if (state.photos.some((p) => p.processing)) return showFormError('Počkejte prosím, fotky se ještě zpracovávají.');
  if (!data.tasks.length) return showFormError('Označte alespoň jednu provedenou práci.');
  if (!state.photos.length && !confirm('Neukládáte žádné fotky. Klient uvidí jen čas a seznam prací. Pokračovat?')) return;
  showFormError('');

  const btn = $('save');
  const bar = $('progress');
  btn.disabled = true;
  btn.textContent = state.photos.length ? 'Nahrávám fotky…' : 'Ukládám…';
  bar.classList.add('show');
  bar.firstElementChild.style.width = '5%';
  try {
    await s.createCleaning(data, state.photos.map((p) => ({ blob: p.blob, kind: p.kind })), (k) => {
      bar.firstElementChild.style.width = `${Math.max(5, k * 100)}%`;
    });
    const c = clients.find((x) => x.id === data.client_id);
    $('success-text').textContent = `Úklid ${fmt.short(data.date)} (${fmt.time(data.start_time)}–${fmt.time(data.end_time)}) u klienta ${c?.name || ''} je uložený${state.photos.length ? ` i s ${state.photos.length} fotkami` : ''}. Klient ho už vidí ve své kontrole úklidu.`;
    form.hidden = true;
    $('success').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showFormError(err.message || 'Uložení se nepovedlo. Zkuste to prosím znovu.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Uložit úklid';
    setTimeout(() => { bar.classList.remove('show'); bar.firstElementChild.style.width = '0'; }, 400);
  }
});

$('another').addEventListener('click', () => {
  $('success').hidden = true;
  form.hidden = false;
  resetForm();
});
$('show-records').addEventListener('click', () => {
  $('success').hidden = true;
  form.hidden = false;
  resetForm();
  selectTab('records');
});

/* ---------- Záznamy ---------- */
async function loadRecords() {
  $('records').innerHTML = '<div class="empty">Načítám…</div>';
  try {
    records = await s.listCleanings({ limit: 60 });
  } catch (e) {
    $('records').innerHTML = `<div class="alert alert-error">${esc(e.message)}</div>`;
    return;
  }
  if (!records.length) {
    $('records').innerHTML = '<div class="empty"><b>Zatím žádné záznamy</b>První úklid zapíšete v záložce „Nový záznam“.</div>';
    return;
  }
  $('records').innerHTML = records.map((r) => {
    const thumbs = r.photos.slice(0, 5).map((p, i) => `<img src="${esc(p.url)}" alt="" data-rid="${esc(r.id)}" data-i="${i}" loading="lazy" style="cursor:zoom-in">`).join('');
    const more = r.photos.length > 5 ? `<span>+${r.photos.length - 5}</span>` : '';
    return `
    <div class="list-row">
      <div class="ph-date"><div><b>${fmt.day(r.date)}</b><small>${fmt.monthShort(r.date)}</small></div></div>
      <div>
        <h4>${esc(r.client?.name || 'Klient')} · ${esc(r.place?.label || '')}</h4>
        <p>${fmt.time(r.start_time)} – ${fmt.time(r.end_time)} (${fmtDuration(minutesBetween(r.start_time, r.end_time))}) · ${esc(r.employee_name || '')}</p>
        ${r.photos.length ? `<div class="mini-thumbs">${thumbs}${more}</div>` : '<p style="color:var(--muted);font-size:13px;margin-top:4px">Bez fotek</p>'}
      </div>
      <button class="btn btn-sm btn-danger" type="button" data-del="${esc(r.id)}">${icon.trash}Smazat</button>
    </div>`;
  }).join('');
}
$('records').addEventListener('click', async (e) => {
  const img = e.target.closest('img[data-rid]');
  const del = e.target.closest('[data-del]');
  if (img) {
    const r = records.find((x) => x.id === img.dataset.rid);
    openGallery(r.photos.map((p) => ({ url: p.url, caption: `${p.kind === 'pred' ? 'Před' : 'Po'} · ${r.client?.name || ''} · ${fmt.short(r.date)}` })), Number(img.dataset.i));
  } else if (del) {
    const r = records.find((x) => x.id === del.dataset.del);
    if (!confirm(`Opravdu smazat úklid ${fmt.short(r.date)} u klienta ${r.client?.name || ''}? Klient ho přestane vidět.`)) return;
    try {
      await s.deleteCleaning(r.id);
      toast('Záznam smazán');
      loadRecords();
    } catch (err) {
      toast(err.message);
    }
  }
});

/* ---------- Klienti ---------- */
const shareLink = (code) => new URL(`kontrola.html?kod=${encodeURIComponent(code)}`, location.href).href;

function renderClients() {
  const el = $('clients');
  if (!clients.length) {
    el.innerHTML = '<div class="empty"><b>Zatím žádní klienti</b>Založte prvního klienta ve formuláři vedle.</div>';
    return;
  }
  el.innerHTML = clients.map((c) => `
    <div class="client-card" data-id="${esc(c.id)}">
      <div class="client-card-top">
        <h4>${esc(c.name)}</h4>
        <span class="code-pill">${esc(c.access_code)}</span>
      </div>
      <ul>${c.places.map((p) => `<li>${icon.pin}<span><b>${esc(p.label)}</b> – ${esc(p.address)}</span></li>`).join('') || '<li>Žádné místo</li>'}</ul>
      <div class="cl-actions">
        <button class="btn btn-sm" type="button" data-act="copy-code">${icon.copy}Kopírovat kód</button>
        <button class="btn btn-sm" type="button" data-act="copy-link">${icon.link}Kopírovat odkaz</button>
        <button class="btn btn-sm btn-ghost" type="button" data-act="add-place">${icon.plus}Přidat místo</button>
      </div>
      <form class="place-row" data-place-form hidden style="margin-top:12px">
        <label class="field"><span>Název</span><input name="label" placeholder="Byt, kancelář…"></label>
        <label class="field"><span>Adresa</span><input name="address" placeholder="Ulice č., Praha X"></label>
        <button class="btn btn-primary" type="submit" style="min-height:50px">Uložit</button>
      </form>
    </div>`).join('');
}

$('clients').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const card = btn.closest('.client-card');
  const c = clients.find((x) => x.id === card.dataset.id);
  if (btn.dataset.act === 'copy-code') toast((await copyText(c.access_code)) ? 'Kód zkopírován' : c.access_code);
  if (btn.dataset.act === 'copy-link') toast((await copyText(shareLink(c.access_code))) ? 'Odkaz pro klienta zkopírován' : shareLink(c.access_code));
  if (btn.dataset.act === 'add-place') {
    const f = card.querySelector('[data-place-form]');
    f.hidden = !f.hidden;
    if (!f.hidden) f.label.focus();
  }
});
$('clients').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const card = f.closest('.client-card');
  const label = f.label.value.trim();
  const address = f.address.value.trim();
  if (!label || !address) { toast('Vyplňte název i adresu'); return; }
  try {
    await s.addPlace(card.dataset.id, { label, address });
    toast('Místo přidáno');
    await loadClients();
  } catch (err) {
    toast(err.message);
  }
});

function placeRowHTML() {
  return `<div class="place-row">
    <label class="field"><span class="visually-hidden">Název místa</span><input name="p_label" placeholder="Název (Byt, Kancelář…)"></label>
    <label class="field"><span class="visually-hidden">Adresa</span><input name="p_address" placeholder="Adresa"></label>
    <button type="button" class="icon-btn" data-rm-row aria-label="Odebrat místo">${icon.trash}</button>
  </div>`;
}
function renderPlaceRows() {
  $('place-rows').innerHTML = placeRowHTML();
  $('c-name').value = '';
}
$('add-place-row').addEventListener('click', () => $('place-rows').insertAdjacentHTML('beforeend', placeRowHTML()));
$('place-rows').addEventListener('click', (e) => {
  const rm = e.target.closest('[data-rm-row]');
  if (rm && $('place-rows').children.length > 1) rm.closest('.place-row').remove();
});

$('client-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('client-error');
  const name = $('c-name').value.trim();
  const places = [...$('place-rows').querySelectorAll('.place-row')]
    .map((r) => ({ label: r.querySelector('[name=p_label]').value.trim(), address: r.querySelector('[name=p_address]').value.trim() }))
    .filter((p) => p.label || p.address);
  const bad = places.find((p) => !p.label || !p.address);
  err.hidden = true;
  if (!name) { err.textContent = 'Vyplňte jméno klienta.'; err.hidden = false; return; }
  if (!places.length || bad) { err.textContent = 'Každé místo potřebuje název i adresu.'; err.hidden = false; return; }
  try {
    const c = await s.createClient({ name, places });
    renderPlaceRows();
    await loadClients();
    toast(`Klient založen – kód ${c.access_code}`);
  } catch (ex) {
    err.textContent = ex.message;
    err.hidden = false;
  }
});
