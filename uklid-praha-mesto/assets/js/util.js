// Drobné sdílené pomůcky: ikony, formátování českých dat a časů, toast.

const svg = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const icon = {
  check: svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  user: svg('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20c1-3.6 3.8-5.6 7.2-5.6s6.2 2 7.2 5.6"/>'),
  camera: svg('<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.4"/>'),
  image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  left: svg('<path d="M15 5l-7 7 7 7"/>'),
  right: svg('<path d="M9 5l7 7-7 7"/>'),
  swap: svg('<path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/>'),
  trash: svg('<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5h9l1-12.5M9.5 7V4.5h5V7"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  copy: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5V6.2a1.7 1.7 0 0 0-1.7-1.7H6.2a1.7 1.7 0 0 0-1.7 1.7v7.6a1.7 1.7 0 0 0 1.7 1.7h2.3"/>'),
  mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7l7.5 6 7.5-6"/>'),
  list: svg('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>'),
  users: svg('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.8-3.2 3.1-5 6-5s5.2 1.8 6 5"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.8c1.6.6 2.8 2.2 3.3 4.7"/>'),
  upload: svg('<path d="M12 16V4.5M7 9.5l5-5 5 5"/><path d="M4.5 15.5v2A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-2"/>'),
  logout: svg('<path d="M14 4.5h3.5A2.5 2.5 0 0 1 20 7v10a2.5 2.5 0 0 1-2.5 2.5H14"/><path d="M10 16l-4-4 4-4M6 12h10"/>'),
  sparkle: svg('<path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
};

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
const MONTHS_GEN = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
const DAYS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const DAYS_SHORT = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];

// 'YYYY-MM-DD' → Date v místním čase (bez posunu časové zóny).
export const parseDate = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const todayISO = () => toISO(new Date());
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const fmt = {
  day: (iso) => parseDate(iso).getDate(),
  dayShort: (iso) => DAYS_SHORT[parseDate(iso).getDay()],
  dayName: (iso) => DAYS[parseDate(iso).getDay()],
  monthShort: (iso) => MONTHS_SHORT[parseDate(iso).getMonth()],
  monthKey: (iso) => String(iso).slice(0, 7),
  monthLabel: (key) => {
    const [y, m] = key.split('-').map(Number);
    const name = MONTHS[m - 1];
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
  },
  long: (iso) => {
    const d = parseDate(iso);
    return `${DAYS[d.getDay()]} ${d.getDate()}. ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;
  },
  short: (iso) => {
    const d = parseDate(iso);
    return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  },
  time: (hm) => {
    if (!hm) return '';
    const [h, m] = String(hm).split(':');
    return `${Number(h)}:${m}`;
  },
};

export const minutesBetween = (start, end) => {
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60; // úklid přes půlnoc
  return diff;
};

export const fmtDuration = (min) => {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

export const fmtHours = (min) => {
  const h = min / 60;
  return (Math.round(h * 10) / 10).toLocaleString('cs-CZ');
};

export const plural = (n, one, few, many) => {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
};

export const firstName = (full) => String(full || '').trim().split(/\s+/)[0] || '';

export const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  }));

// Přístupový kód klienta, např. UPM-7KX4-Q2M9 (bez zaměnitelných znaků 0/O, 1/I/L).
export const makeAccessCode = () => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `UPM-${chars.slice(0, 4)}-${chars.slice(4)}`;
};

export const normalizeCode = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

let toastTimer;
export const toast = (msg) => {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
};

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
};

export const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch { /* ignore */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};

export const mapLink = (address) => `https://mapy.cz/zakladni?q=${encodeURIComponent(address)}`;

// Zmenší fotku z mobilu na rozumnou velikost (max. 1600 px, JPEG), ať se rychle nahrává.
export async function compressImage(file, max = 1600, quality = 0.82) {
  let source;
  let w;
  let h;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
    w = source.width;
    h = source.height;
  } catch {
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Soubor se nepodařilo načíst jako obrázek.')); };
      img.src = url;
    });
    w = source.naturalWidth;
    h = source.naturalHeight;
  }
  const scale = Math.min(1, max / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(source, 0, 0, cw, ch);
  if (source.close) source.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Fotku se nepodařilo zpracovat.');
  return blob;
}

// Potvrzovací dialog přímo ve stránce (systémové confirm() nefunguje všude).
export function askConfirm(message, { ok = 'Pokračovat', cancel = 'Zpět', danger = false } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'confirm-backdrop';
    wrap.innerHTML = `<div class="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-msg">
        <p id="confirm-msg">${esc(message)}</p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-sm" data-v="0">${esc(cancel)}</button>
          <button type="button" class="btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}" data-v="1">${esc(ok)}</button>
        </div>
      </div>`;
    const prevFocus = document.activeElement;
    const done = (v) => {
      document.removeEventListener('keydown', onKey);
      wrap.remove();
      if (prevFocus) prevFocus.focus();
      resolve(v);
    };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) done(b.dataset.v === '1');
      else if (e.target === wrap) done(false);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    wrap.querySelector('[data-v="1"]').focus();
  });
}
