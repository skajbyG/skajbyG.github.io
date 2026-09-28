(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // assets/js/util.js
  var svg = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  var icon = {
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
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')
  };
  var esc = (s2) => String(s2 != null ? s2 : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var MONTHS = ["leden", "\xFAnor", "b\u0159ezen", "duben", "kv\u011Bten", "\u010Derven", "\u010Dervenec", "srpen", "z\xE1\u0159\xED", "\u0159\xEDjen", "listopad", "prosinec"];
  var MONTHS_GEN = ["ledna", "\xFAnora", "b\u0159ezna", "dubna", "kv\u011Btna", "\u010Dervna", "\u010Dervence", "srpna", "z\xE1\u0159\xED", "\u0159\xEDjna", "listopadu", "prosince"];
  var MONTHS_SHORT = ["led", "\xFAno", "b\u0159e", "dub", "kv\u011B", "\u010Dvn", "\u010Dvc", "srp", "z\xE1\u0159", "\u0159\xEDj", "lis", "pro"];
  var DAYS = ["ned\u011Ble", "pond\u011Bl\xED", "\xFAter\xFD", "st\u0159eda", "\u010Dtvrtek", "p\xE1tek", "sobota"];
  var DAYS_SHORT = ["ne", "po", "\xFAt", "st", "\u010Dt", "p\xE1", "so"];
  var parseDate = (iso) => {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  var todayISO = () => toISO(/* @__PURE__ */ new Date());
  var toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  var nowHM = () => {
    const d = /* @__PURE__ */ new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  var fmt = {
    day: (iso) => parseDate(iso).getDate(),
    dayShort: (iso) => DAYS_SHORT[parseDate(iso).getDay()],
    dayName: (iso) => DAYS[parseDate(iso).getDay()],
    monthShort: (iso) => MONTHS_SHORT[parseDate(iso).getMonth()],
    monthKey: (iso) => String(iso).slice(0, 7),
    monthLabel: (key) => {
      const [y, m] = key.split("-").map(Number);
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
      if (!hm) return "";
      const [h, m] = String(hm).split(":");
      return `${Number(h)}:${m}`;
    }
  };
  var minutesBetween = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    let diff = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };
  var fmtDuration = (min) => {
    if (!min) return "\u2014";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (!h) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} h`;
  };
  var firstName = (full) => String(full || "").trim().split(/\s+/)[0] || "";
  var uuid = () => crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
  var makeAccessCode = () => {
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    return `UPM-${chars.slice(0, 4)}-${chars.slice(4)}`;
  };
  var normalizeCode = (s2) => String(s2 || "").trim().toUpperCase().replace(/\s+/g, "");
  var toastTimer;
  var toast = (msg) => {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  };
  var copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
      return ok;
    }
  };
  var storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, val);
      } catch {
      }
    },
    del(key) {
      try {
        localStorage.removeItem(key);
      } catch {
      }
    }
  };
  async function compressImage(file, max = 1600, quality = 0.82) {
    let source;
    let w;
    let h;
    try {
      source = await createImageBitmap(file, { imageOrientation: "from-image" });
      w = source.width;
      h = source.height;
    } catch {
      source = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Soubor se nepoda\u0159ilo na\u010D\xEDst jako obr\xE1zek."));
        };
        img.src = url;
      });
      w = source.naturalWidth;
      h = source.naturalHeight;
    }
    const scale = Math.min(1, max / Math.max(w, h));
    const cw = Math.round(w * scale);
    const ch = Math.round(h * scale);
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, 0, 0, cw, ch);
    if (source.close) source.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("Fotku se nepoda\u0159ilo zpracovat.");
    return blob;
  }

  // assets/js/store.js
  var CONFIG = window.UPM_CONFIG;
  var isDemo = () => CONFIG.backend !== "supabase" || !CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey;
  var DEMO_CODE = "DEMO-2026";
  var DEMO_PIN = "1234";
  var impl;
  async function store() {
    if (!impl) impl = isDemo() ? createDemoStore() : await createSupabaseStore();
    return impl;
  }
  function createDemoStore() {
    const DB_NAME = "upm-demo";
    const STAFF_KEY = "upm_demo_staff";
    const urlCache = /* @__PURE__ */ new Map();
    let dbPromise;
    const open = () => {
      if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
          const req = indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            db.createObjectStore("clients", { keyPath: "id" });
            db.createObjectStore("places", { keyPath: "id" }).createIndex("client_id", "client_id");
            db.createObjectStore("cleanings", { keyPath: "id" }).createIndex("client_id", "client_id");
            db.createObjectStore("photos", { keyPath: "id" }).createIndex("cleaning_id", "cleaning_id");
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
    const tx = (db, names, mode = "readonly") => db.transaction(names, mode);
    const wrap = (req) => new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const done = (t) => new Promise((resolve, reject) => {
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
    const all = async (name, index2, key) => {
      const db = await open();
      const s2 = tx(db, name).objectStore(name);
      return wrap(index2 ? s2.index(index2).getAll(key) : s2.getAll());
    };
    const photoUrl = (p) => {
      if (!urlCache.has(p.id)) urlCache.set(p.id, URL.createObjectURL(p.blob));
      return urlCache.get(p.id);
    };
    const sortCleanings = (list) => list.sort((a, b) => (b.date + b.start_time).localeCompare(a.date + a.start_time));
    const hydrate = async (cleanings) => {
      const [clients2, places, photos] = await Promise.all([all("clients"), all("places"), all("photos")]);
      const cMap = new Map(clients2.map((c) => [c.id, c]));
      const pMap = new Map(places.map((p) => [p.id, p]));
      const byCleaning = /* @__PURE__ */ new Map();
      photos.sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach((p) => {
        if (!byCleaning.has(p.cleaning_id)) byCleaning.set(p.cleaning_id, []);
        byCleaning.get(p.cleaning_id).push({ id: p.id, kind: p.kind, url: photoUrl(p) });
      });
      return sortCleanings(cleanings).map((c) => ({
        ...c,
        client: cMap.get(c.client_id) ? { name: cMap.get(c.client_id).name } : null,
        place: pMap.get(c.place_id) ? { label: pMap.get(c.place_id).label, address: pMap.get(c.place_id).address } : null,
        photos: byCleaning.get(c.id) || []
      }));
    };
    async function seedIfEmpty(db) {
      const count = await wrap(tx(db, "clients").objectStore("clients").count());
      if (count) return;
      const seed = buildSeed();
      const t = tx(db, ["clients", "places", "cleanings", "photos"], "readwrite");
      seed.clients.forEach((x) => t.objectStore("clients").put(x));
      seed.places.forEach((x) => t.objectStore("places").put(x));
      seed.cleanings.forEach((x) => t.objectStore("cleanings").put(x));
      seed.photos.forEach((x) => t.objectStore("photos").put(x));
      await done(t);
    }
    return {
      mode: "demo",
      async clientPortal(code) {
        const c = normalizeCode(code);
        const clients2 = await all("clients");
        const client = clients2.find((x) => normalizeCode(x.access_code) === c);
        if (!client) return null;
        const [places, cleanings] = await Promise.all([
          all("places", "client_id", client.id),
          all("cleanings", "client_id", client.id)
        ]);
        return {
          client: { id: client.id, name: client.name },
          places: places.sort((a, b) => a.label.localeCompare(b.label, "cs")),
          cleanings: await hydrate(cleanings)
        };
      },
      async signIn({ name, pin }) {
        if (!name || !name.trim()) throw new Error("Vypl\u0148te sv\xE9 jm\xE9no.");
        if (pin !== DEMO_PIN) throw new Error("Nespr\xE1vn\xFD PIN. V uk\xE1zce je PIN 1234.");
        const session2 = { name: name.trim() };
        storage.set(STAFF_KEY, JSON.stringify(session2));
        return session2;
      },
      async getSession() {
        try {
          return JSON.parse(storage.get(STAFF_KEY) || "null");
        } catch {
          return null;
        }
      },
      async signOut() {
        storage.del(STAFF_KEY);
      },
      async listClients() {
        const [clients2, places] = await Promise.all([all("clients"), all("places")]);
        return clients2.map((c) => ({ ...c, places: places.filter((p) => p.client_id === c.id).sort((a, b) => a.label.localeCompare(b.label, "cs")) })).sort((a, b) => a.name.localeCompare(b.name, "cs"));
      },
      async createClient({ name, places }) {
        const db = await open();
        const client = { id: uuid(), name: name.trim(), access_code: makeAccessCode(), created_at: (/* @__PURE__ */ new Date()).toISOString() };
        const t = tx(db, ["clients", "places"], "readwrite");
        t.objectStore("clients").put(client);
        const saved = places.map((p) => ({ id: uuid(), client_id: client.id, label: p.label.trim(), address: p.address.trim() }));
        saved.forEach((p) => t.objectStore("places").put(p));
        await done(t);
        return { ...client, places: saved };
      },
      async addPlace(clientId, { label, address }) {
        const db = await open();
        const place = { id: uuid(), client_id: clientId, label: label.trim(), address: address.trim() };
        const t = tx(db, "places", "readwrite");
        t.objectStore("places").put(place);
        await done(t);
        return place;
      },
      async createCleaning(data, photos, onProgress = () => {
      }) {
        const db = await open();
        const session2 = await this.getSession();
        const cleaning = {
          id: uuid(),
          client_id: data.client_id,
          place_id: data.place_id,
          employee_name: (session2 == null ? void 0 : session2.name) || "Zam\u011Bstnanec",
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          tasks: data.tasks,
          note: data.note || "",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const t = tx(db, ["cleanings", "photos"], "readwrite");
        t.objectStore("cleanings").put(cleaning);
        photos.forEach((p, i) => {
          t.objectStore("photos").put({
            id: uuid(),
            cleaning_id: cleaning.id,
            kind: p.kind,
            blob: p.blob,
            created_at: new Date(Date.now() + i).toISOString()
          });
        });
        await done(t);
        onProgress(1);
        return cleaning;
      },
      async listCleanings({ limit = 50 } = {}) {
        const list = await hydrate(await all("cleanings"));
        return list.slice(0, limit);
      },
      async deleteCleaning(id) {
        const db = await open();
        const photos = await all("photos", "cleaning_id", id);
        const t = tx(db, ["cleanings", "photos"], "readwrite");
        t.objectStore("cleanings").delete(id);
        photos.forEach((p) => {
          t.objectStore("photos").delete(p.id);
          if (urlCache.has(p.id)) {
            URL.revokeObjectURL(urlCache.get(p.id));
            urlCache.delete(p.id);
          }
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
      }
    };
  }
  async function createSupabaseStore() {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    const sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
    const BUCKET = "photos";
    const publicUrl = (path) => sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const fail = (error, fallback) => {
      if (error) throw new Error(error.message || fallback);
    };
    const hm = (t) => t ? String(t).slice(0, 5) : "";
    const employeeFor = async (user) => {
      if (!user) return null;
      const { data } = await sb.from("employees").select("name").eq("user_id", user.id).maybeSingle();
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
      note: c.note || "",
      client: c.clients ? { name: c.clients.name } : c.client || null,
      place: c.places ? { label: c.places.label, address: c.places.address } : c.place || null,
      photos: (c.cleaning_photos || c.photos || []).slice().sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || ""))).map((p) => ({ id: p.id, kind: p.kind, url: publicUrl(p.path), path: p.path }))
    });
    return {
      mode: "supabase",
      async clientPortal(code) {
        const { data, error } = await sb.rpc("client_portal", { p_code: normalizeCode(code) });
        fail(error, "Nepoda\u0159ilo se na\u010D\xEDst data.");
        if (!data) return null;
        const places = data.places || [];
        const pMap = new Map(places.map((p) => [p.id, p]));
        return {
          client: data.client,
          places,
          cleanings: (data.cleanings || []).map((c) => mapCleaning({ ...c, place: pMap.get(c.place_id) || null }))
        };
      },
      async signIn({ email, password }) {
        const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error("Nespr\xE1vn\xFD e-mail nebo heslo.");
        const emp = await employeeFor(data.user);
        if (!emp) {
          await sb.auth.signOut();
          throw new Error("Tento \xFA\u010Det nem\xE1 p\u0159\xEDstup do zam\u011Bstnaneck\xE9 sekce.");
        }
        return emp;
      },
      async getSession() {
        var _a;
        const { data } = await sb.auth.getSession();
        return employeeFor((_a = data.session) == null ? void 0 : _a.user);
      },
      async signOut() {
        await sb.auth.signOut();
      },
      async listClients() {
        const { data, error } = await sb.from("clients").select("id, name, access_code, created_at, places(id, label, address)").order("name");
        fail(error, "Nepoda\u0159ilo se na\u010D\xEDst klienty.");
        return data.map((c) => ({ ...c, places: (c.places || []).sort((a, b) => a.label.localeCompare(b.label, "cs")) }));
      },
      async createClient({ name, places }) {
        const { data: client, error } = await sb.from("clients").insert({ name: name.trim(), access_code: makeAccessCode() }).select().single();
        fail(error, "Klienta se nepoda\u0159ilo ulo\u017Eit.");
        let saved = [];
        if (places.length) {
          const res = await sb.from("places").insert(places.map((p) => ({ client_id: client.id, label: p.label.trim(), address: p.address.trim() }))).select();
          fail(res.error, "Adresy se nepoda\u0159ilo ulo\u017Eit.");
          saved = res.data;
        }
        return { ...client, places: saved };
      },
      async addPlace(clientId, { label, address }) {
        const { data, error } = await sb.from("places").insert({ client_id: clientId, label: label.trim(), address: address.trim() }).select().single();
        fail(error, "Adresu se nepoda\u0159ilo ulo\u017Eit.");
        return data;
      },
      async createCleaning(data, photos, onProgress = () => {
      }) {
        const session2 = await this.getSession();
        const { data: row, error } = await sb.from("cleanings").insert({
          client_id: data.client_id,
          place_id: data.place_id,
          employee_name: (session2 == null ? void 0 : session2.name) || "Zam\u011Bstnanec",
          date: data.date,
          start_time: data.start_time,
          end_time: data.end_time,
          tasks: data.tasks,
          note: data.note || ""
        }).select().single();
        fail(error, "Z\xE1znam se nepoda\u0159ilo ulo\u017Eit.");
        const uploaded = [];
        try {
          for (let i = 0; i < photos.length; i++) {
            const path = `${row.id}/${uuid()}.jpg`;
            const up = await sb.storage.from(BUCKET).upload(path, photos[i].blob, { contentType: "image/jpeg", upsert: false });
            fail(up.error, "Fotku se nepoda\u0159ilo nahr\xE1t.");
            uploaded.push(path);
            const ins = await sb.from("cleaning_photos").insert({ cleaning_id: row.id, path, kind: photos[i].kind });
            fail(ins.error, "Fotku se nepoda\u0159ilo ulo\u017Eit.");
            onProgress((i + 1) / photos.length);
          }
        } catch (e) {
          if (uploaded.length) await sb.storage.from(BUCKET).remove(uploaded);
          await sb.from("cleanings").delete().eq("id", row.id);
          throw e;
        }
        onProgress(1);
        return row;
      },
      async listCleanings({ limit = 50 } = {}) {
        const { data, error } = await sb.from("cleanings").select("*, clients(name), places(label, address), cleaning_photos(id, path, kind, created_at)").order("date", { ascending: false }).order("start_time", { ascending: false }).limit(limit);
        fail(error, "Nepoda\u0159ilo se na\u010D\xEDst z\xE1znamy.");
        return data.map(mapCleaning);
      },
      async deleteCleaning(id) {
        const { data: photos } = await sb.from("cleaning_photos").select("path").eq("cleaning_id", id);
        if (photos == null ? void 0 : photos.length) await sb.storage.from(BUCKET).remove(photos.map((p) => p.path));
        const { error } = await sb.from("cleanings").delete().eq("id", id);
        fail(error, "Z\xE1znam se nepoda\u0159ilo smazat.");
      }
    };
  }
  function buildSeed() {
    const now = /* @__PURE__ */ new Date();
    const client = { id: uuid(), name: "Uk\xE1zkov\xFD klient", access_code: DEMO_CODE, created_at: now.toISOString() };
    const byt = { id: uuid(), client_id: client.id, label: "Byt \u2013 Vinohrady", address: "Uk\xE1zkov\xE1 12, Praha 2 \u2013 Vinohrady" };
    const kancl = { id: uuid(), client_id: client.id, label: "Kancel\xE1\u0159 \u2013 Vr\u0161ovice", address: "Vzorov\xE1 45, Praha 10 \u2013 Vr\u0161ovice" };
    const plan = [
      { d: 1, place: byt, who: "Jana Dvo\u0159\xE1kov\xE1", s: "08:00", e: "11:30", scenes: ["kuchyn", "koupelna", "obyvak"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Ut\xEDr\xE1n\xED prachu", "Kuchy\u0148", "Koupelna a WC", "Vynesen\xED odpadk\u016F"], note: "Vym\u011Bn\u011Bno lo\u017En\xED pr\xE1dlo, v lednici chyb\xED jeden odkap\xE1va\u010D \u2013 d\xE1me v\u011Bd\u011Bt p\u0159\xED\u0161t\u011B." },
      { d: 4, place: kancl, who: "Petra Mal\xE1", s: "17:30", e: "19:45", scenes: ["kancelar", "kuchyn"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Ut\xEDr\xE1n\xED prachu", "Kuchy\u0148ka", "Soci\xE1ln\xED za\u0159\xEDzen\xED", "Vynesen\xED odpadk\u016F"], note: "" },
      { d: 8, place: byt, who: "Jana Dvo\u0159\xE1kov\xE1", s: "08:00", e: "11:15", scenes: ["koupelna", "obyvak"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Ut\xEDr\xE1n\xED prachu", "Koupelna a WC", "\u017Dehlen\xED"], note: "" },
      { d: 11, place: kancl, who: "Petra Mal\xE1", s: "17:30", e: "19:30", scenes: ["kancelar"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Ut\xEDr\xE1n\xED prachu", "Soci\xE1ln\xED za\u0159\xEDzen\xED"], note: "" },
      { d: 15, place: byt, who: "Marie Hor\xE1kov\xE1", s: "07:45", e: "13:00", scenes: ["kuchyn", "obyvak", "koupelna"], tasks: ["Gener\xE1ln\xED \xFAklid", "Myt\xED oken", "Trouba a digesto\u0159", "Lednice", "Koupelna a WC", "Vyt\xEDr\xE1n\xED podlah"], note: "Gener\xE1ln\xED \xFAklid v\u010Detn\u011B myt\xED oken z obou stran." },
      { d: 18, place: kancl, who: "Petra Mal\xE1", s: "17:30", e: "19:40", scenes: ["kancelar"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Kuchy\u0148ka", "Vynesen\xED odpadk\u016F"], note: "" },
      { d: 29, place: byt, who: "Jana Dvo\u0159\xE1kov\xE1", s: "08:00", e: "11:20", scenes: ["kuchyn", "obyvak"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Ut\xEDr\xE1n\xED prachu", "Kuchy\u0148"], note: "" },
      { d: 36, place: byt, who: "Jana Dvo\u0159\xE1kov\xE1", s: "08:05", e: "11:10", scenes: ["koupelna"], tasks: ["Vys\xE1v\xE1n\xED", "Vyt\xEDr\xE1n\xED podlah", "Koupelna a WC"], note: "" }
    ];
    const cleanings = [];
    const photos = [];
    plan.forEach((p, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - p.d);
      const c = {
        id: uuid(),
        client_id: client.id,
        place_id: p.place.id,
        employee_name: p.who,
        date: toISO(date),
        start_time: p.s,
        end_time: p.e,
        tasks: p.tasks,
        note: p.note,
        created_at: date.toISOString()
      };
      cleanings.push(c);
      let n = 0;
      p.scenes.forEach((scene, k) => {
        ["pred", "po"].forEach((kind) => {
          photos.push({
            id: uuid(),
            cleaning_id: c.id,
            kind,
            blob: new Blob([sceneSVG(scene, kind, i * 7 + k)], { type: "image/svg+xml" }),
            created_at: new Date(date.getTime() + n++ * 1e3).toISOString()
          });
        });
      });
    });
    return { clients: [client], places: [byt, kancl], cleanings, photos };
  }
  function rng(seed) {
    let s2 = seed * 9301 + 49297;
    return () => {
      s2 = (s2 * 9301 + 49297) % 233280;
      return s2 / 233280;
    };
  }
  function sceneSVG(scene, kind, seed) {
    const r = rng(seed + (kind === "po" ? 0 : 0));
    const dirty = kind === "pred";
    const W = 800;
    const H = 600;
    const palettes = {
      kuchyn: { wall: "#e6eee9", floor: "#c9b89d", accent: "#2f5d62" },
      koupelna: { wall: "#e3edf1", floor: "#b9c7cc", accent: "#3e6d8a" },
      obyvak: { wall: "#efe9df", floor: "#b8966f", accent: "#4a5bb5" },
      kancelar: { wall: "#e9ecf0", floor: "#9aa5ad", accent: "#12a192" }
    };
    const pal = palettes[scene];
    let body = "";
    body += `<rect width="${W}" height="${H}" fill="${pal.wall}"/>`;
    body += `<rect y="430" width="${W}" height="170" fill="${pal.floor}"/>`;
    body += `<rect y="426" width="${W}" height="8" fill="#ffffff" opacity=".55"/>`;
    body += `<g><rect x="70" y="70" width="190" height="220" rx="6" fill="#cfe7f2"/><rect x="70" y="70" width="190" height="220" rx="6" fill="url(#sky)"/>
    <rect x="160" y="70" width="8" height="220" fill="#fff"/><rect x="70" y="175" width="190" height="8" fill="#fff"/>
    <rect x="62" y="62" width="206" height="236" rx="8" fill="none" stroke="#fff" stroke-width="10"/></g>`;
    body += `<polygon points="70,290 260,290 360,430 20,430" fill="#fff" opacity=".18"/>`;
    if (scene === "kuchyn") {
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
    } else if (scene === "koupelna") {
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
    } else if (scene === "obyvak") {
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
      const star = (x, y, s2) => `<path transform="translate(${x} ${y}) scale(${s2})" d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#fff"/>`;
      for (let i = 0; i < 6; i++) body += star((340 + r() * 420).toFixed(0), (120 + r() * 380).toFixed(0), (0.6 + r() * 0.9).toFixed(2));
      body += `<rect width="${W}" height="${H}" fill="#ffffff" opacity=".04"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f0"/><stop offset="1" stop-color="#eef7fb"/></linearGradient></defs>
    ${body}
    <text x="${W - 20}" y="${H - 18}" text-anchor="end" font-family="sans-serif" font-size="16" fill="#000" opacity=".28">Uk\xE1zkov\xE1 ilustrace</text>
  </svg>`;
  }

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
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    let bubbles2 = [];
    const build = (key) => {
      bubbles2.forEach((b) => {
        group.remove(b.mesh);
        b.mesh.material.dispose();
      });
      bubbles2 = layouts[key].map(([x, y, z, r], i) => {
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
      bubbles2.forEach((b) => {
        const s2 = b.speed;
        b.mesh.position.x = b.base.x + Math.sin(time * s2 * 0.8 + b.phase) * 0.18 + pointer.x * (0.25 + b.base.z * 0.04);
        b.mesh.position.y = b.base.y + Math.sin(time * s2 + b.phase) * 0.32 - pointer.y * 0.15;
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
      if (!running && !reduce && visible && !document.hidden) {
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
    if (reduce) render(4e3);
    else start();
    canvas.classList.add("ready");
    return { stop, start };
  }

  // assets/js/lightbox.js
  var box = document.getElementById("lightbox");
  var content = document.getElementById("lb-content");
  var caption = document.getElementById("lb-caption");
  var prev = document.getElementById("lb-prev");
  var next = document.getElementById("lb-next");
  var closeBtn = document.getElementById("lb-close");
  var items = [];
  var index = 0;
  var lastFocus = null;
  if (box) {
    closeBtn.innerHTML = icon.close;
    prev.innerHTML = icon.left;
    next.innerHTML = icon.right;
    closeBtn.addEventListener("click", close);
    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.classList.contains("lb-stage")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && items.length > 1) show(index - 1);
      if (e.key === "ArrowRight" && items.length > 1) show(index + 1);
    });
    let sx = null;
    content.addEventListener("touchstart", (e) => {
      if (items.length > 1) sx = e.touches[0].clientX;
    }, { passive: true });
    content.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }
  function openBox() {
    lastFocus = document.activeElement;
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function close() {
    box.classList.remove("open");
    content.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function show(i) {
    index = (i + items.length) % items.length;
    const it = items[index];
    content.innerHTML = `<img src="${esc(it.url)}" alt="${esc(it.caption)}">`;
    caption.textContent = `${it.caption}${items.length > 1 ? ` \xB7 ${index + 1} / ${items.length}` : ""}`;
  }
  function openGallery(list, start = 0) {
    items = list;
    prev.hidden = next.hidden = list.length < 2;
    show(start);
    openBox();
  }

  // assets/js/zamestnanci.js
  var $ = (id) => document.getElementById(id);
  var DEFAULT_TASKS = [
    "Vys\xE1v\xE1n\xED",
    "Vyt\xEDr\xE1n\xED podlah",
    "Ut\xEDr\xE1n\xED prachu",
    "Kuchy\u0148",
    "Koupelna a WC",
    "Vynesen\xED odpadk\u016F",
    "Myt\xED oken",
    "Lednice",
    "Trouba a digesto\u0159",
    "Lo\u017En\xED pr\xE1dlo",
    "\u017Dehlen\xED",
    "Spole\u010Dn\xE9 prostory",
    "Tepov\xE1n\xED"
  ];
  var s;
  var session = null;
  var clients = [];
  var records = [];
  var bubbles = null;
  var state = {
    tasks: /* @__PURE__ */ new Set(),
    extraTasks: [],
    photos: [],
    // { id, kind, blob, url, processing }
    kind: "pred"
  };
  (async function init() {
    const demo = isDemo();
    $("mode-banner").hidden = !demo;
    $("demo-hint").hidden = !demo;
    $("login-demo").hidden = !demo;
    $("login-live").hidden = demo;
    $("t-new").innerHTML = `${icon.camera}Nov\xFD z\xE1znam`;
    $("t-records").innerHTML = `${icon.list}Z\xE1znamy`;
    $("t-clients").innerHTML = `${icon.users}Klienti`;
    $("ic-camera").innerHTML = icon.camera;
    $("ic-gallery").innerHTML = icon.image;
    $("ok-ic").innerHTML = icon.check;
    $("add-place-row").innerHTML = `${icon.plus}Dal\u0161\xED m\xEDsto`;
    bubbles = initBubbles($("gate-canvas"), { layout: "gate" });
    try {
      s = await store();
      session = await s.getSession();
    } catch (e) {
      showLoginError(`Nepoda\u0159ilo se p\u0159ipojit: ${e.message}`);
      return;
    }
    if (session) showApp();
  })();
  function showLoginError(msg) {
    $("login-error").textContent = msg;
    $("login-error").hidden = !msg;
  }
  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoginError("");
    const f = e.target;
    const btn = $("login-submit");
    btn.disabled = true;
    btn.textContent = "P\u0159ihla\u0161uji\u2026";
    try {
      s = s || await store();
      session = isDemo() ? await s.signIn({ name: f.elements.name.value, pin: f.pin.value.trim() }) : await s.signIn({ email: f.email.value, password: f.password.value });
      showApp();
    } catch (err) {
      showLoginError(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "P\u0159ihl\xE1sit se";
    }
  });
  $("logout").addEventListener("click", async () => {
    await s.signOut();
    session = null;
    $("app").hidden = true;
    $("gate").hidden = false;
    $("logout").hidden = true;
    $("who").hidden = true;
    bubbles == null ? void 0 : bubbles.start();
  });
  async function showApp() {
    $("gate").hidden = true;
    $("app").hidden = false;
    $("logout").hidden = false;
    $("who").hidden = false;
    $("who").textContent = session.name;
    bubbles == null ? void 0 : bubbles.stop();
    const h = (/* @__PURE__ */ new Date()).getHours();
    $("greet-eyebrow").textContent = `${h < 10 ? "Dobr\xE9 r\xE1no" : h < 18 ? "Dobr\xFD den" : "Dobr\xFD ve\u010Der"}, ${firstName(session.name)}`;
    renderTasks();
    renderPlaceRows();
    resetForm();
    await loadClients();
  }
  var TITLES = { new: "Z\xE1pis \xFAklidu", records: "Posledn\xED z\xE1znamy", clients: "Klienti a p\u0159\xEDstupov\xE9 k\xF3dy" };
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => selectTab(t.dataset.tab)));
  function selectTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    $("tab-new").hidden = name !== "new";
    $("tab-records").hidden = name !== "records";
    $("tab-clients").hidden = name !== "clients";
    $("greet").textContent = TITLES[name];
    if (name === "records") loadRecords();
    if (name === "clients") renderClients();
  }
  async function loadClients() {
    try {
      clients = await s.listClients();
    } catch (e) {
      toast(e.message);
      clients = [];
    }
    const sel = $("f-client");
    const prev2 = sel.value;
    sel.innerHTML = clients.length ? `<option value="">Vyberte klienta\u2026</option>${clients.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}` : '<option value="">Nejd\u0159\xEDv zalo\u017Ete klienta v z\xE1lo\u017Ece Klienti</option>';
    if (clients.some((c) => c.id === prev2)) sel.value = prev2;
    else if (clients.length === 1) sel.value = clients[0].id;
    fillPlaces();
    renderClients();
  }
  function fillPlaces() {
    const c = clients.find((x) => x.id === $("f-client").value);
    const sel = $("f-place");
    const places = (c == null ? void 0 : c.places) || [];
    sel.innerHTML = places.length ? (places.length > 1 ? '<option value="">Vyberte m\xEDsto\u2026</option>' : "") + places.map((p) => `<option value="${esc(p.id)}">${esc(p.label)} \u2013 ${esc(p.address)}</option>`).join("") : `<option value="">${c ? "Klient nem\xE1 \u017E\xE1dn\xE9 m\xEDsto" : "\u2014"}</option>`;
    sel.disabled = !places.length;
    updateSummary();
  }
  $("f-client").addEventListener("change", fillPlaces);
  var form = $("cleaning-form");
  function resetForm() {
    form.reset();
    $("f-date").value = todayISO();
    state.tasks = /* @__PURE__ */ new Set();
    state.extraTasks = [];
    state.photos.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    state.photos = [];
    setKind("pred");
    renderTasks();
    renderPreviews();
    if (clients.length) {
      if (clients.length === 1) $("f-client").value = clients[0].id;
      fillPlaces();
    }
    showFormError("");
    updateSummary();
  }
  document.querySelectorAll("[data-now]").forEach((b) => b.addEventListener("click", () => {
    $(b.dataset.now).value = nowHM();
    updateSummary();
  }));
  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);
  function renderTasks() {
    const all = [...DEFAULT_TASKS, ...state.extraTasks];
    $("tasks").innerHTML = all.map((t) => `<button type="button" class="tchip" aria-pressed="${state.tasks.has(t)}" data-task="${esc(t)}">${icon.check}${esc(t)}</button>`).join("");
  }
  $("tasks").addEventListener("click", (e) => {
    const b = e.target.closest(".tchip");
    if (!b) return;
    const t = b.dataset.task;
    if (state.tasks.has(t)) state.tasks.delete(t);
    else state.tasks.add(t);
    b.setAttribute("aria-pressed", String(state.tasks.has(t)));
    updateSummary();
  });
  var addCustomTask = () => {
    const inp = $("custom-task");
    const t = inp.value.trim();
    if (!t) return;
    if (!DEFAULT_TASKS.includes(t) && !state.extraTasks.includes(t)) state.extraTasks.push(t);
    state.tasks.add(t);
    inp.value = "";
    renderTasks();
    updateSummary();
  };
  $("add-task").addEventListener("click", addCustomTask);
  $("custom-task").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTask();
    }
  });
  function setKind(kind) {
    state.kind = kind;
    document.querySelectorAll(".kind-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kind === kind)));
  }
  document.querySelectorAll(".kind-switch button").forEach((b) => b.addEventListener("click", () => setKind(b.dataset.kind)));
  async function addFiles(files) {
    const list = [...files].filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|heic|heif|webp)$/i.test(f.name));
    if (!list.length) return;
    const kind = state.kind;
    const items2 = list.map((file) => ({ id: uuid(), kind, file, processing: true }));
    state.photos.push(...items2);
    renderPreviews();
    for (const it of items2) {
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
  ["in-camera", "in-gallery"].forEach((id) => $(id).addEventListener("change", (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  }));
  var drop = $("drop-gallery");
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("drag");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("drag");
    addFiles(e.dataTransfer.files);
  });
  function renderPreviews() {
    $("previews").innerHTML = state.photos.map((p) => `
    <div class="preview ${p.processing ? "processing" : ""}" data-id="${p.id}">
      ${p.url ? `<img src="${p.url}" alt="">` : ""}
      <button type="button" class="kind ${p.kind === "po" ? "po" : ""}" data-act="kind" title="P\u0159epnout P\u0159ed / Po">${p.kind === "po" ? "Po" : "P\u0159ed"}</button>
      <button type="button" class="rm" data-act="rm" aria-label="Odebrat fotku">${icon.close}</button>
    </div>`).join("");
    updateSummary();
  }
  $("previews").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = btn.closest(".preview").dataset.id;
    const p = state.photos.find((x) => x.id === id);
    if (!p) return;
    if (btn.dataset.act === "rm") {
      if (p.url) URL.revokeObjectURL(p.url);
      state.photos = state.photos.filter((x) => x !== p);
    } else {
      p.kind = p.kind === "po" ? "pred" : "po";
    }
    renderPreviews();
  });
  function updateSummary() {
    const c = clients.find((x) => x.id === $("f-client").value);
    const p = c == null ? void 0 : c.places.find((x) => x.id === $("f-place").value);
    const st = $("f-start").value;
    const en = $("f-end").value;
    const pred = state.photos.filter((x) => x.kind === "pred").length;
    const po = state.photos.length - pred;
    const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
    $("summary").innerHTML = [
      row("Klient", c ? esc(c.name) : "\u2014"),
      row("M\xEDsto", p ? esc(p.label) : "\u2014"),
      row("Datum", $("f-date").value ? fmt.short($("f-date").value) : "\u2014"),
      row("\u010Cas", st && en ? `${fmt.time(st)} \u2013 ${fmt.time(en)}` : st ? `od ${fmt.time(st)}` : "\u2014"),
      row("D\xE9lka", st && en ? fmtDuration(minutesBetween(st, en)) : "\u2014"),
      row("Pr\xE1ce", state.tasks.size ? String(state.tasks.size) : "\u2014"),
      row("Fotky", state.photos.length ? `${pred} p\u0159ed \xB7 ${po} po` : "\u2014")
    ].join("");
  }
  function showFormError(msg) {
    $("form-error").textContent = msg;
    $("form-error").hidden = !msg;
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      client_id: $("f-client").value,
      place_id: $("f-place").value,
      date: $("f-date").value,
      start_time: $("f-start").value,
      end_time: $("f-end").value,
      tasks: [...state.tasks],
      note: $("f-note").value.trim()
    };
    if (!data.client_id) return showFormError("Vyberte klienta.");
    if (!data.place_id) return showFormError("Vyberte m\xEDsto \xFAklidu.");
    if (!data.date) return showFormError("Vypl\u0148te datum.");
    if (!data.start_time || !data.end_time) return showFormError("Vypl\u0148te za\u010D\xE1tek i konec \xFAklidu.");
    if (data.end_time === data.start_time) return showFormError("Konec mus\xED b\xFDt jin\xFD ne\u017E za\u010D\xE1tek.");
    if (data.end_time < data.start_time && !confirm("Konec je d\u0159\xEDv ne\u017E za\u010D\xE1tek \u2013 \xFAklid prob\xEDhal p\u0159es p\u016Flnoc?")) return;
    if (state.photos.some((p) => p.processing)) return showFormError("Po\u010Dkejte pros\xEDm, fotky se je\u0161t\u011B zpracov\xE1vaj\xED.");
    if (!data.tasks.length) return showFormError("Ozna\u010Dte alespo\u0148 jednu provedenou pr\xE1ci.");
    if (!state.photos.length && !confirm("Neukl\xE1d\xE1te \u017E\xE1dn\xE9 fotky. Klient uvid\xED jen \u010Das a seznam prac\xED. Pokra\u010Dovat?")) return;
    showFormError("");
    const btn = $("save");
    const bar = $("progress");
    btn.disabled = true;
    btn.textContent = state.photos.length ? "Nahr\xE1v\xE1m fotky\u2026" : "Ukl\xE1d\xE1m\u2026";
    bar.classList.add("show");
    bar.firstElementChild.style.width = "5%";
    try {
      await s.createCleaning(data, state.photos.map((p) => ({ blob: p.blob, kind: p.kind })), (k) => {
        bar.firstElementChild.style.width = `${Math.max(5, k * 100)}%`;
      });
      const c = clients.find((x) => x.id === data.client_id);
      $("success-text").textContent = `\xDAklid ${fmt.short(data.date)} (${fmt.time(data.start_time)}\u2013${fmt.time(data.end_time)}) u klienta ${(c == null ? void 0 : c.name) || ""} je ulo\u017Een\xFD${state.photos.length ? ` i s ${state.photos.length} fotkami` : ""}. Klient ho u\u017E vid\xED ve sv\xE9 kontrole \xFAklidu.`;
      form.hidden = true;
      $("success").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showFormError(err.message || "Ulo\u017Een\xED se nepovedlo. Zkuste to pros\xEDm znovu.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Ulo\u017Eit \xFAklid";
      setTimeout(() => {
        bar.classList.remove("show");
        bar.firstElementChild.style.width = "0";
      }, 400);
    }
  });
  $("another").addEventListener("click", () => {
    $("success").hidden = true;
    form.hidden = false;
    resetForm();
  });
  $("show-records").addEventListener("click", () => {
    $("success").hidden = true;
    form.hidden = false;
    resetForm();
    selectTab("records");
  });
  async function loadRecords() {
    $("records").innerHTML = '<div class="empty">Na\u010D\xEDt\xE1m\u2026</div>';
    try {
      records = await s.listCleanings({ limit: 60 });
    } catch (e) {
      $("records").innerHTML = `<div class="alert alert-error">${esc(e.message)}</div>`;
      return;
    }
    if (!records.length) {
      $("records").innerHTML = '<div class="empty"><b>Zat\xEDm \u017E\xE1dn\xE9 z\xE1znamy</b>Prvn\xED \xFAklid zap\xED\u0161ete v z\xE1lo\u017Ece \u201ENov\xFD z\xE1znam\u201C.</div>';
      return;
    }
    $("records").innerHTML = records.map((r) => {
      var _a, _b;
      const thumbs = r.photos.slice(0, 5).map((p, i) => `<img src="${esc(p.url)}" alt="" data-rid="${esc(r.id)}" data-i="${i}" loading="lazy" style="cursor:zoom-in">`).join("");
      const more = r.photos.length > 5 ? `<span>+${r.photos.length - 5}</span>` : "";
      return `
    <div class="list-row">
      <div class="ph-date"><div><b>${fmt.day(r.date)}</b><small>${fmt.monthShort(r.date)}</small></div></div>
      <div>
        <h4>${esc(((_a = r.client) == null ? void 0 : _a.name) || "Klient")} \xB7 ${esc(((_b = r.place) == null ? void 0 : _b.label) || "")}</h4>
        <p>${fmt.time(r.start_time)} \u2013 ${fmt.time(r.end_time)} (${fmtDuration(minutesBetween(r.start_time, r.end_time))}) \xB7 ${esc(r.employee_name || "")}</p>
        ${r.photos.length ? `<div class="mini-thumbs">${thumbs}${more}</div>` : '<p style="color:var(--muted);font-size:13px;margin-top:4px">Bez fotek</p>'}
      </div>
      <button class="btn btn-sm btn-danger" type="button" data-del="${esc(r.id)}">${icon.trash}Smazat</button>
    </div>`;
    }).join("");
  }
  $("records").addEventListener("click", async (e) => {
    var _a;
    const img = e.target.closest("img[data-rid]");
    const del = e.target.closest("[data-del]");
    if (img) {
      const r = records.find((x) => x.id === img.dataset.rid);
      openGallery(r.photos.map((p) => {
        var _a2;
        return { url: p.url, caption: `${p.kind === "pred" ? "P\u0159ed" : "Po"} \xB7 ${((_a2 = r.client) == null ? void 0 : _a2.name) || ""} \xB7 ${fmt.short(r.date)}` };
      }), Number(img.dataset.i));
    } else if (del) {
      const r = records.find((x) => x.id === del.dataset.del);
      if (!confirm(`Opravdu smazat \xFAklid ${fmt.short(r.date)} u klienta ${((_a = r.client) == null ? void 0 : _a.name) || ""}? Klient ho p\u0159estane vid\u011Bt.`)) return;
      try {
        await s.deleteCleaning(r.id);
        toast("Z\xE1znam smaz\xE1n");
        loadRecords();
      } catch (err) {
        toast(err.message);
      }
    }
  });
  var shareLink = (code) => new URL(`kontrola.html?kod=${encodeURIComponent(code)}`, location.href).href;
  function renderClients() {
    const el = $("clients");
    if (!clients.length) {
      el.innerHTML = '<div class="empty"><b>Zat\xEDm \u017E\xE1dn\xED klienti</b>Zalo\u017Ete prvn\xEDho klienta ve formul\xE1\u0159i vedle.</div>';
      return;
    }
    el.innerHTML = clients.map((c) => `
    <div class="client-card" data-id="${esc(c.id)}">
      <div class="client-card-top">
        <h4>${esc(c.name)}</h4>
        <span class="code-pill">${esc(c.access_code)}</span>
      </div>
      <ul>${c.places.map((p) => `<li>${icon.pin}<span><b>${esc(p.label)}</b> \u2013 ${esc(p.address)}</span></li>`).join("") || "<li>\u017D\xE1dn\xE9 m\xEDsto</li>"}</ul>
      <div class="cl-actions">
        <button class="btn btn-sm" type="button" data-act="copy-code">${icon.copy}Kop\xEDrovat k\xF3d</button>
        <button class="btn btn-sm" type="button" data-act="copy-link">${icon.link}Kop\xEDrovat odkaz</button>
        <button class="btn btn-sm btn-ghost" type="button" data-act="add-place">${icon.plus}P\u0159idat m\xEDsto</button>
      </div>
      <form class="place-row" data-place-form hidden style="margin-top:12px">
        <label class="field"><span>N\xE1zev</span><input name="label" placeholder="Byt, kancel\xE1\u0159\u2026"></label>
        <label class="field"><span>Adresa</span><input name="address" placeholder="Ulice \u010D., Praha X"></label>
        <button class="btn btn-primary" type="submit" style="min-height:50px">Ulo\u017Eit</button>
      </form>
    </div>`).join("");
  }
  $("clients").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const card = btn.closest(".client-card");
    const c = clients.find((x) => x.id === card.dataset.id);
    if (btn.dataset.act === "copy-code") toast(await copyText(c.access_code) ? "K\xF3d zkop\xEDrov\xE1n" : c.access_code);
    if (btn.dataset.act === "copy-link") toast(await copyText(shareLink(c.access_code)) ? "Odkaz pro klienta zkop\xEDrov\xE1n" : shareLink(c.access_code));
    if (btn.dataset.act === "add-place") {
      const f = card.querySelector("[data-place-form]");
      f.hidden = !f.hidden;
      if (!f.hidden) f.label.focus();
    }
  });
  $("clients").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const card = f.closest(".client-card");
    const label = f.label.value.trim();
    const address = f.address.value.trim();
    if (!label || !address) {
      toast("Vypl\u0148te n\xE1zev i adresu");
      return;
    }
    try {
      await s.addPlace(card.dataset.id, { label, address });
      toast("M\xEDsto p\u0159id\xE1no");
      await loadClients();
    } catch (err) {
      toast(err.message);
    }
  });
  function placeRowHTML() {
    return `<div class="place-row">
    <label class="field"><span class="visually-hidden">N\xE1zev m\xEDsta</span><input name="p_label" placeholder="N\xE1zev (Byt, Kancel\xE1\u0159\u2026)"></label>
    <label class="field"><span class="visually-hidden">Adresa</span><input name="p_address" placeholder="Adresa"></label>
    <button type="button" class="icon-btn" data-rm-row aria-label="Odebrat m\xEDsto">${icon.trash}</button>
  </div>`;
  }
  function renderPlaceRows() {
    $("place-rows").innerHTML = placeRowHTML();
    $("c-name").value = "";
  }
  $("add-place-row").addEventListener("click", () => $("place-rows").insertAdjacentHTML("beforeend", placeRowHTML()));
  $("place-rows").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm-row]");
    if (rm && $("place-rows").children.length > 1) rm.closest(".place-row").remove();
  });
  $("client-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("client-error");
    const name = $("c-name").value.trim();
    const places = [...$("place-rows").querySelectorAll(".place-row")].map((r) => ({ label: r.querySelector("[name=p_label]").value.trim(), address: r.querySelector("[name=p_address]").value.trim() })).filter((p) => p.label || p.address);
    const bad = places.find((p) => !p.label || !p.address);
    err.hidden = true;
    if (!name) {
      err.textContent = "Vypl\u0148te jm\xE9no klienta.";
      err.hidden = false;
      return;
    }
    if (!places.length || bad) {
      err.textContent = "Ka\u017Ed\xE9 m\xEDsto pot\u0159ebuje n\xE1zev i adresu.";
      err.hidden = false;
      return;
    }
    try {
      const c = await s.createClient({ name, places });
      renderPlaceRows();
      await loadClients();
      toast(`Klient zalo\u017Een \u2013 k\xF3d ${c.access_code}`);
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });
})();
