// Datová vrstva. Stejné rozhraní pro ukázkový režim (IndexedDB v prohlížeči)
// i pro ostrý provoz nad Supabase – stránky neřeší, kde data leží.
//
// Tvar úklidu:
//   { id, client_id, place_id, employee_name, date:'YYYY-MM-DD', start_time:'HH:MM',
//     end_time:'HH:MM', tasks:[string], note, photos:[{ id, url, kind:'pred'|'po' }],
//     client?:{ name }, place?:{ label, address } }

import { CONFIG } from './config.js';
import { uuid, makeAccessCode, normalizeCode, storage, toISO } from './util.js';

export const isDemo = () => CONFIG.backend !== 'supabase' || !CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey;
export const DEMO_CODE = 'DEMO-2026';
export const DEMO_PIN = '1234';

let impl;
export async function store() {
  if (!impl) impl = isDemo() ? createDemoStore() : await createSupabaseStore();
  return impl;
}

/* ==========================================================================
   Ukázkový režim – IndexedDB
   ========================================================================== */

function createDemoStore() {
  const DB_NAME = 'upm-demo';
  const STAFF_KEY = 'upm_demo_staff';
  const urlCache = new Map();
  let dbPromise;

  const open = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          db.createObjectStore('clients', { keyPath: 'id' });
          db.createObjectStore('places', { keyPath: 'id' }).createIndex('client_id', 'client_id');
          db.createObjectStore('cleanings', { keyPath: 'id' }).createIndex('client_id', 'client_id');
          db.createObjectStore('photos', { keyPath: 'id' }).createIndex('cleaning_id', 'cleaning_id');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }).then(async (db) => {
        await seedIfEmpty(db);
        return db;
      });
    }
    return dbPromise;
  };

  const tx = (db, names, mode = 'readonly') => db.transaction(names, mode);
  const wrap = (req) => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
  const done = (t) => new Promise((resolve, reject) => { t.oncomplete = resolve; t.onerror = () => reject(t.error); t.onabort = () => reject(t.error); });
  const all = async (name, index, key) => {
    const db = await open();
    const s = tx(db, name).objectStore(name);
    return wrap(index ? s.index(index).getAll(key) : s.getAll());
  };

  const photoUrl = (p) => {
    if (!urlCache.has(p.id)) urlCache.set(p.id, URL.createObjectURL(p.blob));
    return urlCache.get(p.id);
  };

  const sortCleanings = (list) =>
    list.sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));

  const hydrate = async (cleanings) => {
    const [clients, places, photos] = await Promise.all([all('clients'), all('places'), all('photos')]);
    const cMap = new Map(clients.map((c) => [c.id, c]));
    const pMap = new Map(places.map((p) => [p.id, p]));
    const byCleaning = new Map();
    photos
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .forEach((p) => {
        if (!byCleaning.has(p.cleaning_id)) byCleaning.set(p.cleaning_id, []);
        byCleaning.get(p.cleaning_id).push({ id: p.id, kind: p.kind, url: photoUrl(p) });
      });
    return sortCleanings(cleanings).map((c) => ({
      ...c,
      client: cMap.get(c.client_id) ? { name: cMap.get(c.client_id).name } : null,
      place: pMap.get(c.place_id) ? { label: pMap.get(c.place_id).label, address: pMap.get(c.place_id).address } : null,
      photos: byCleaning.get(c.id) || [],
    }));
  };

  async function seedIfEmpty(db) {
    const count = await wrap(tx(db, 'clients').objectStore('clients').count());
    if (count) return;
    const seed = buildSeed();
    const t = tx(db, ['clients', 'places', 'cleanings', 'photos'], 'readwrite');
    seed.clients.forEach((x) => t.objectStore('clients').put(x));
    seed.places.forEach((x) => t.objectStore('places').put(x));
    seed.cleanings.forEach((x) => t.objectStore('cleanings').put(x));
    seed.photos.forEach((x) => t.objectStore('photos').put(x));
    await done(t);
  }

  return {
    mode: 'demo',

    async clientPortal(code) {
      const c = normalizeCode(code);
      const clients = await all('clients');
      const client = clients.find((x) => normalizeCode(x.access_code) === c);
      if (!client) return null;
      const [places, cleanings] = await Promise.all([
        all('places', 'client_id', client.id),
        all('cleanings', 'client_id', client.id),
      ]);
      return {
        client: { id: client.id, name: client.name },
        places: places.sort((a, b) => a.label.localeCompare(b.label, 'cs')),
        cleanings: await hydrate(cleanings),
      };
    },

    async signIn({ name, pin }) {
      if (!name || !name.trim()) throw new Error('Vyplňte své jméno.');
      if (pin !== DEMO_PIN) throw new Error('Nesprávný PIN. V ukázce je PIN 1234.');
      const session = { name: name.trim() };
      storage.set(STAFF_KEY, JSON.stringify(session));
      return session;
    },
    async getSession() {
      try { return JSON.parse(storage.get(STAFF_KEY) || 'null'); } catch { return null; }
    },
    async signOut() { storage.del(STAFF_KEY); },

    async listClients() {
      const [clients, places] = await Promise.all([all('clients'), all('places')]);
      return clients
        .map((c) => ({ ...c, places: places.filter((p) => p.client_id === c.id).sort((a, b) => a.label.localeCompare(b.label, 'cs')) }))
        .sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    },

    async createClient({ name, places }) {
      const db = await open();
      const client = { id: uuid(), name: name.trim(), access_code: makeAccessCode(), created_at: new Date().toISOString() };
      const t = tx(db, ['clients', 'places'], 'readwrite');
      t.objectStore('clients').put(client);
      const saved = places.map((p) => ({ id: uuid(), client_id: client.id, label: p.label.trim(), address: p.address.trim() }));
      saved.forEach((p) => t.objectStore('places').put(p));
      await done(t);
      return { ...client, places: saved };
    },

    async addPlace(clientId, { label, address }) {
      const db = await open();
      const place = { id: uuid(), client_id: clientId, label: label.trim(), address: address.trim() };
      const t = tx(db, 'places', 'readwrite');
      t.objectStore('places').put(place);
      await done(t);
      return place;
    },

    async createCleaning(data, photos, onProgress = () => {}) {
      const db = await open();
      const session = await this.getSession();
      const cleaning = {
        id: uuid(),
        client_id: data.client_id,
        place_id: data.place_id,
        employee_name: session?.name || 'Zaměstnanec',
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        tasks: data.tasks,
        note: data.note || '',
        created_at: new Date().toISOString(),
      };
      const t = tx(db, ['cleanings', 'photos'], 'readwrite');
      t.objectStore('cleanings').put(cleaning);
      photos.forEach((p, i) => {
        t.objectStore('photos').put({
          id: uuid(), cleaning_id: cleaning.id, kind: p.kind, blob: p.blob,
          created_at: new Date(Date.now() + i).toISOString(),
        });
      });
      await done(t);
      onProgress(1);
      return cleaning;
    },

    async listCleanings({ limit = 50 } = {}) {
      const list = await hydrate(await all('cleanings'));
      return list.slice(0, limit);
    },

    async deleteCleaning(id) {
      const db = await open();
      const photos = await all('photos', 'cleaning_id', id);
      const t = tx(db, ['cleanings', 'photos'], 'readwrite');
      t.objectStore('cleanings').delete(id);
      photos.forEach((p) => {
        t.objectStore('photos').delete(p.id);
        if (urlCache.has(p.id)) { URL.revokeObjectURL(urlCache.get(p.id)); urlCache.delete(p.id); }
      });
      await done(t);
    },

    async resetDemo() {
      const db = await open();
      db.close();
      dbPromise = null;
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      });
    },
  };
}

/* ==========================================================================
   Ostrý provoz – Supabase
   ========================================================================== */

async function createSupabaseStore() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  const BUCKET = 'photos';
  const publicUrl = (path) => sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const fail = (error, fallback) => {
    if (error) throw new Error(error.message || fallback);
  };
  const hm = (t) => (t ? String(t).slice(0, 5) : '');

  const employeeFor = async (user) => {
    if (!user) return null;
    const { data } = await sb.from('employees').select('name').eq('user_id', user.id).maybeSingle();
    return data ? { name: data.name, email: user.email } : null;
  };

  const mapCleaning = (c) => ({
    id: c.id,
    client_id: c.client_id,
    place_id: c.place_id,
    employee_name: c.employee_name,
    date: c.date,
    start_time: hm(c.start_time),
    end_time: hm(c.end_time),
    tasks: c.tasks || [],
    note: c.note || '',
    client: c.clients ? { name: c.clients.name } : c.client || null,
    place: c.places ? { label: c.places.label, address: c.places.address } : c.place || null,
    photos: (c.cleaning_photos || c.photos || [])
      .slice()
      .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')))
      .map((p) => ({ id: p.id, kind: p.kind, url: publicUrl(p.path), path: p.path })),
  });

  return {
    mode: 'supabase',

    async clientPortal(code) {
      const { data, error } = await sb.rpc('client_portal', { p_code: normalizeCode(code) });
      fail(error, 'Nepodařilo se načíst data.');
      if (!data) return null;
      const places = data.places || [];
      const pMap = new Map(places.map((p) => [p.id, p]));
      return {
        client: data.client,
        places,
        cleanings: (data.cleanings || []).map((c) => mapCleaning({ ...c, place: pMap.get(c.place_id) || null })),
      };
    },

    async signIn({ email, password }) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error('Nesprávný e-mail nebo heslo.');
      const emp = await employeeFor(data.user);
      if (!emp) {
        await sb.auth.signOut();
        throw new Error('Tento účet nemá přístup do zaměstnanecké sekce.');
      }
      return emp;
    },
    async getSession() {
      const { data } = await sb.auth.getSession();
      return employeeFor(data.session?.user);
    },
    async signOut() { await sb.auth.signOut(); },

    async listClients() {
      const { data, error } = await sb.from('clients').select('id, name, access_code, created_at, places(id, label, address)').order('name');
      fail(error, 'Nepodařilo se načíst klienty.');
      return data.map((c) => ({ ...c, places: (c.places || []).sort((a, b) => a.label.localeCompare(b.label, 'cs')) }));
    },

    async createClient({ name, places }) {
      const { data: client, error } = await sb.from('clients').insert({ name: name.trim(), access_code: makeAccessCode() }).select().single();
      fail(error, 'Klienta se nepodařilo uložit.');
      let saved = [];
      if (places.length) {
        const res = await sb.from('places').insert(places.map((p) => ({ client_id: client.id, label: p.label.trim(), address: p.address.trim() }))).select();
        fail(res.error, 'Adresy se nepodařilo uložit.');
        saved = res.data;
      }
      return { ...client, places: saved };
    },

    async addPlace(clientId, { label, address }) {
      const { data, error } = await sb.from('places').insert({ client_id: clientId, label: label.trim(), address: address.trim() }).select().single();
      fail(error, 'Adresu se nepodařilo uložit.');
      return data;
    },

    async createCleaning(data, photos, onProgress = () => {}) {
      const session = await this.getSession();
      const { data: row, error } = await sb.from('cleanings').insert({
        client_id: data.client_id,
        place_id: data.place_id,
        employee_name: session?.name || 'Zaměstnanec',
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        tasks: data.tasks,
        note: data.note || '',
      }).select().single();
      fail(error, 'Záznam se nepodařilo uložit.');

      const uploaded = [];
      try {
        for (let i = 0; i < photos.length; i++) {
          const path = `${row.id}/${uuid()}.jpg`;
          const up = await sb.storage.from(BUCKET).upload(path, photos[i].blob, { contentType: 'image/jpeg', upsert: false });
          fail(up.error, 'Fotku se nepodařilo nahrát.');
          uploaded.push(path);
          const ins = await sb.from('cleaning_photos').insert({ cleaning_id: row.id, path, kind: photos[i].kind });
          fail(ins.error, 'Fotku se nepodařilo uložit.');
          onProgress((i + 1) / photos.length);
        }
      } catch (e) {
        // Nenechávat poloviční záznam – smazat, co se nahrálo, a nahlásit chybu.
        if (uploaded.length) await sb.storage.from(BUCKET).remove(uploaded);
        await sb.from('cleanings').delete().eq('id', row.id);
        throw e;
      }
      onProgress(1);
      return row;
    },

    async listCleanings({ limit = 50 } = {}) {
      const { data, error } = await sb
        .from('cleanings')
        .select('*, clients(name), places(label, address), cleaning_photos(id, path, kind, created_at)')
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(limit);
      fail(error, 'Nepodařilo se načíst záznamy.');
      return data.map(mapCleaning);
    },

    async deleteCleaning(id) {
      const { data: photos } = await sb.from('cleaning_photos').select('path').eq('cleaning_id', id);
      if (photos?.length) await sb.storage.from(BUCKET).remove(photos.map((p) => p.path));
      const { error } = await sb.from('cleanings').delete().eq('id', id);
      fail(error, 'Záznam se nepodařilo smazat.');
    },
  };
}

/* ==========================================================================
   Ukázková data (jen demo režim) – ilustrační „fotky" jako SVG
   ========================================================================== */

function buildSeed() {
  const now = new Date();
  const client = { id: uuid(), name: 'Ukázkový klient', access_code: DEMO_CODE, created_at: now.toISOString() };
  const byt = { id: uuid(), client_id: client.id, label: 'Byt – Vinohrady', address: 'Ukázková 12, Praha 2 – Vinohrady' };
  const kancl = { id: uuid(), client_id: client.id, label: 'Kancelář – Vršovice', address: 'Vzorová 45, Praha 10 – Vršovice' };

  const plan = [
    { d: 1, place: byt, who: 'Jana Dvořáková', s: '08:00', e: '11:30', scenes: ['kuchyn', 'koupelna', 'obyvak'], tasks: ['Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Kuchyň', 'Koupelna a WC', 'Vynesení odpadků'], note: 'Vyměněno ložní prádlo, v lednici chybí jeden odkapávač – dáme vědět příště.' },
    { d: 4, place: kancl, who: 'Petra Malá', s: '17:30', e: '19:45', scenes: ['kancelar', 'kuchyn'], tasks: ['Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Kuchyňka', 'Sociální zařízení', 'Vynesení odpadků'], note: '' },
    { d: 8, place: byt, who: 'Jana Dvořáková', s: '08:00', e: '11:15', scenes: ['koupelna', 'obyvak'], tasks: ['Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Koupelna a WC', 'Žehlení'], note: '' },
    { d: 11, place: kancl, who: 'Petra Malá', s: '17:30', e: '19:30', scenes: ['kancelar'], tasks: ['Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Sociální zařízení'], note: '' },
    { d: 15, place: byt, who: 'Marie Horáková', s: '07:45', e: '13:00', scenes: ['kuchyn', 'obyvak', 'koupelna'], tasks: ['Generální úklid', 'Mytí oken', 'Trouba a digestoř', 'Lednice', 'Koupelna a WC', 'Vytírání podlah'], note: 'Generální úklid včetně mytí oken z obou stran.' },
    { d: 18, place: kancl, who: 'Petra Malá', s: '17:30', e: '19:40', scenes: ['kancelar'], tasks: ['Vysávání', 'Vytírání podlah', 'Kuchyňka', 'Vynesení odpadků'], note: '' },
    { d: 29, place: byt, who: 'Jana Dvořáková', s: '08:00', e: '11:20', scenes: ['kuchyn', 'obyvak'], tasks: ['Vysávání', 'Vytírání podlah', 'Utírání prachu', 'Kuchyň'], note: '' },
    { d: 36, place: byt, who: 'Jana Dvořáková', s: '08:05', e: '11:10', scenes: ['koupelna'], tasks: ['Vysávání', 'Vytírání podlah', 'Koupelna a WC'], note: '' },
  ];

  const cleanings = [];
  const photos = [];
  plan.forEach((p, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - p.d);
    const c = {
      id: uuid(), client_id: client.id, place_id: p.place.id, employee_name: p.who,
      date: toISO(date), start_time: p.s, end_time: p.e, tasks: p.tasks, note: p.note,
      created_at: date.toISOString(),
    };
    cleanings.push(c);
    let n = 0;
    p.scenes.forEach((scene, k) => {
      ['pred', 'po'].forEach((kind) => {
        photos.push({
          id: uuid(), cleaning_id: c.id, kind,
          blob: new Blob([sceneSVG(scene, kind, i * 7 + k)], { type: 'image/svg+xml' }),
          created_at: new Date(date.getTime() + n++ * 1000).toISOString(),
        });
      });
    });
  });

  return { clients: [client], places: [byt, kancl], cleanings, photos };
}

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function sceneSVG(scene, kind, seed) {
  const r = rng(seed + (kind === 'po' ? 0 : 0));
  const dirty = kind === 'pred';
  const W = 800;
  const H = 600;
  const palettes = {
    kuchyn: { wall: '#e6eee9', floor: '#c9b89d', accent: '#2f5d62' },
    koupelna: { wall: '#e3edf1', floor: '#b9c7cc', accent: '#3e6d8a' },
    obyvak: { wall: '#efe9df', floor: '#b8966f', accent: '#4a5bb5' },
    kancelar: { wall: '#e9ecf0', floor: '#9aa5ad', accent: '#12a192' },
  };
  const pal = palettes[scene];
  let body = '';

  // stěna, podlaha, okno se světlem
  body += `<rect width="${W}" height="${H}" fill="${pal.wall}"/>`;
  body += `<rect y="430" width="${W}" height="170" fill="${pal.floor}"/>`;
  body += `<rect y="426" width="${W}" height="8" fill="#ffffff" opacity=".55"/>`;
  body += `<g><rect x="70" y="70" width="190" height="220" rx="6" fill="#cfe7f2"/><rect x="70" y="70" width="190" height="220" rx="6" fill="url(#sky)"/>
    <rect x="160" y="70" width="8" height="220" fill="#fff"/><rect x="70" y="175" width="190" height="8" fill="#fff"/>
    <rect x="62" y="62" width="206" height="236" rx="8" fill="none" stroke="#fff" stroke-width="10"/></g>`;
  body += `<polygon points="70,290 260,290 360,430 20,430" fill="#fff" opacity=".18"/>`;

  if (scene === 'kuchyn') {
    body += `<rect x="330" y="140" width="420" height="120" rx="6" fill="${pal.accent}" opacity=".9"/>`;
    for (let i = 0; i < 3; i++) body += `<rect x="${344 + i * 136}" y="152" width="124" height="96" rx="4" fill="#fff" opacity=".12"/>`;
    body += `<rect x="330" y="262" width="420" height="44" fill="#f6f1e8"/>`;
    for (let x = 330; x < 750; x += 30) body += `<line x1="${x}" y1="262" x2="${x}" y2="306" stroke="#e2dccf" stroke-width="2"/>`;
    body += `<rect x="318" y="306" width="444" height="18" rx="4" fill="#3b3f45"/>`;
    body += `<rect x="330" y="324" width="420" height="106" fill="${pal.accent}"/>`;
    for (let i = 0; i < 4; i++) body += `<rect x="${338 + i * 104}" y="332" width="96" height="90" rx="4" fill="#fff" opacity=".1"/><rect x="${376 + i * 104}" y="340" width="20" height="4" rx="2" fill="#fff" opacity=".6"/>`;
    body += `<rect x="560" y="300" width="90" height="10" rx="5" fill="#9aa3ab"/><path d="M600 300 v-34 h22" stroke="#9aa3ab" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    body += `<g transform="translate(400 262)"><rect x="-18" y="18" width="36" height="26" rx="4" fill="#d98c5f"/><path d="M0 18 C -20 -10, -30 -4, -26 10 M0 18 C 18 -14, 30 -6, 24 8 M0 18 C 2 -18, 8 -20, 6 -2" stroke="#5c8f5a" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    if (dirty) {
      body += `<g opacity=".9"><ellipse cx="470" cy="302" rx="26" ry="5" fill="#8a6a45" opacity=".5"/><rect x="455" y="276" width="30" height="24" rx="4" fill="#fff"/><rect x="505" y="286" width="40" height="14" rx="7" fill="#e8e1d3"/>
        <rect x="700" y="270" width="18" height="32" rx="3" fill="#c96e4a"/><circle cx="680" cy="296" r="8" fill="#e8e1d3"/></g>`;
    }
  } else if (scene === 'koupelna') {
    for (let y = 60; y < 430; y += 46) for (let x = 300; x < 800; x += 46) body += `<rect x="${x}" y="${y}" width="44" height="44" fill="#fff" opacity=".45"/>`;
    body += `<rect x="330" y="300" width="400" height="110" rx="40" fill="#fff"/><rect x="330" y="300" width="400" height="22" rx="11" fill="#f1f5f7"/>`;
    body += `<rect x="320" y="408" width="16" height="22" rx="4" fill="#c7cfd4"/><rect x="724" y="408" width="16" height="22" rx="4" fill="#c7cfd4"/>`;
    body += `<path d="M680 300 v-80 h-40" stroke="#b7c0c7" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="636" cy="220" r="14" fill="#b7c0c7"/>`;
    body += `<rect x="420" y="90" width="150" height="120" rx="60" fill="#d9e8ef" stroke="#fff" stroke-width="8"/>`;
    body += `<rect x="340" y="220" width="70" height="10" rx="5" fill="#b7c0c7"/><rect x="345" y="230" width="60" height="44" rx="4" fill="${pal.accent}" opacity=".85"/>`;
    if (dirty) {
      body += `<g><path d="M360 330 q60 30 120 0 q60 -30 150 10" stroke="#b39b72" stroke-width="5" fill="none" opacity=".45"/>
        <circle cx="460" cy="130" r="5" fill="#9fb1ba" opacity=".7"/><circle cx="520" cy="160" r="4" fill="#9fb1ba" opacity=".7"/><circle cx="480" cy="180" r="6" fill="#9fb1ba" opacity=".6"/>
        <path d="M600 426 q30 -10 60 0" stroke="#7a8a90" stroke-width="10" fill="none" opacity=".4" stroke-linecap="round"/></g>`;
    }
  } else if (scene === 'obyvak') {
    body += `<rect x="560" y="120" width="160" height="110" rx="4" fill="#fff" stroke="#d9cdb8" stroke-width="8"/><rect x="578" y="138" width="124" height="74" fill="${pal.accent}" opacity=".22"/><circle cx="640" cy="175" r="22" fill="${pal.accent}" opacity=".35"/>`;
    body += `<rect x="340" y="300" width="420" height="110" rx="26" fill="${pal.accent}"/><rect x="360" y="260" width="380" height="80" rx="26" fill="${pal.accent}"/><rect x="330" y="310" width="50" height="100" rx="20" fill="#3c4b9a"/><rect x="720" y="310" width="50" height="100" rx="20" fill="#3c4b9a"/>`;
    body += `<rect x="410" y="276" width="70" height="50" rx="14" fill="#f0b453"/><rect x="620" y="276" width="70" height="50" rx="14" fill="#e9e1d2"/>`;
    body += `<ellipse cx="520" cy="505" rx="260" ry="46" fill="#e7dcc8" opacity=".85"/>`;
    body += `<path d="M300 430 v-190" stroke="#3b3f45" stroke-width="5"/><path d="M270 240 h60 l-12 -44 h-36 z" fill="#f6ead0"/>`;
    if (dirty) {
      body += `<g><rect x="450" y="470" width="44" height="30" rx="4" fill="#f4f1ea" transform="rotate(-12 470 485)"/><circle cx="600" cy="500" r="7" fill="#7c6a55" opacity=".55"/><circle cx="380" cy="515" r="5" fill="#7c6a55" opacity=".55"/><circle cx="640" cy="525" r="4" fill="#7c6a55" opacity=".5"/>
        <rect x="660" y="455" width="54" height="16" rx="8" fill="#cfd6db" transform="rotate(18 687 463)"/></g>`;
    }
  } else {
    for (let i = 0; i < 9; i++) body += `<rect x="70" y="${78 + i * 24}" width="190" height="12" fill="#fff" opacity=".55"/>`;
    body += `<rect x="330" y="300" width="420" height="16" rx="4" fill="#d6c3a2"/><rect x="345" y="316" width="10" height="114" fill="#8a929a"/><rect x="725" y="316" width="10" height="114" fill="#8a929a"/>`;
    body += `<rect x="440" y="170" width="200" height="124" rx="8" fill="#2b3036"/><rect x="450" y="180" width="180" height="104" rx="4" fill="${pal.accent}" opacity=".75"/><rect x="530" y="294" width="20" height="8" fill="#2b3036"/>`;
    body += `<rect x="470" y="330" width="140" height="80" rx="18" fill="#3b4148"/><rect x="530" y="410" width="20" height="20" fill="#3b4148"/>`;
    body += `<g transform="translate(700 300)"><rect x="-16" y="-34" width="32" height="34" rx="4" fill="#d98c5f"/><path d="M0 -34 C -24 -70, -34 -60, -30 -44 M0 -34 C 22 -74, 34 -62, 28 -46" stroke="#5c8f5a" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    if (dirty) {
      body += `<g><rect x="360" y="282" width="46" height="20" rx="3" fill="#fff" transform="rotate(-8 383 292)"/><circle cx="660" cy="292" r="10" fill="#fff"/><circle cx="660" cy="292" r="6" fill="#7b5a3c"/>
        <circle cx="420" cy="470" r="6" fill="#56606a" opacity=".5"/><circle cx="600" cy="500" r="4" fill="#56606a" opacity=".5"/><circle cx="700" cy="470" r="5" fill="#56606a" opacity=".5"/></g>`;
    }
  }

  if (dirty) {
    for (let i = 0; i < 26; i++) {
      const x = r() * W;
      const y = 440 + r() * 150;
      body += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.5 + r() * 3).toFixed(1)}" fill="#5b4a38" opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`;
    }
    body += `<rect width="${W}" height="${H}" fill="#8a7f6c" opacity=".16"/>`;
  } else {
    const star = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#fff"/>`;
    for (let i = 0; i < 6; i++) body += star((340 + r() * 420).toFixed(0), (120 + r() * 380).toFixed(0), (0.6 + r() * 0.9).toFixed(2));
    body += `<rect width="${W}" height="${H}" fill="#ffffff" opacity=".04"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f0"/><stop offset="1" stop-color="#eef7fb"/></linearGradient></defs>
    ${body}
    <text x="${W - 20}" y="${H - 18}" text-anchor="end" font-family="sans-serif" font-size="16" fill="#000" opacity=".28">Ukázková ilustrace</text>
  </svg>`;
}
