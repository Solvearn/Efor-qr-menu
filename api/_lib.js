// Ortak yardımcılar: depolama (Upstash Redis), oturum ve doğrulama.
const crypto = require("crypto");

// ---------- Depolama ----------
// Vercel'de Upstash Redis (Marketplace) bu değişkenleri otomatik ekler.
function redisConf() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

// Yerelde (Vercel dışında) veritabanı olmadan denemek için bellek içi yedek.
const mem = new Map();
function memCmd(cmd) {
  const [op, key, val] = cmd;
  if (op === "GET") return mem.has(key) ? mem.get(key) : null;
  if (op === "SET") { mem.set(key, val); return "OK"; }
  if (op === "DEL") { mem.delete(key); return 1; }
  if (op === "INCR") { const n = (Number(mem.get(key)) || 0) + 1; mem.set(key, String(n)); return n; }
  if (op === "EXPIRE") return 1;
  throw new Error("STORE_ERROR");
}

async function redis(cmd) {
  const { url, token } = redisConf();
  if (!url || !token) {
    if (process.env.VERCEL) throw new Error("STORE_NOT_CONFIGURED");
    return memCmd(cmd);
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error("STORE_ERROR");
  return j.result;
}

const MENU_KEY = "efor:menu";

async function loadMenu() {
  const raw = await redis(["GET", MENU_KEY]);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

async function saveMenu(menu) {
  await redis(["SET", MENU_KEY, JSON.stringify(menu)]);
}

// ---------- HTTP yardımcıları ----------
function send(res, status, body, headers) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  Object.keys(headers || {}).forEach((k) => res.setHeader(k, headers[k]));
  res.end(JSON.stringify(body));
}

function readBody(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  if (typeof b === "string") { try { return JSON.parse(b); } catch (e) { return null; } }
  return null;
}

function clientIp(req) {
  const xf = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || (req.socket && req.socket.remoteAddress) || "unknown";
}

// Çapraz site isteklerine karşı: Origin varsa bu sitenin kendisi olmalı.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
}

// ---------- Oturum ----------
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (!process.env.VERCEL) return "yerel-gelistirme-anahtari-degistirin";
  throw new Error("SESSION_NOT_CONFIGURED");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function makeToken() {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return exp + "." + sign(exp);
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function isAuthed(req) {
  try {
    const token = parseCookies(req).session;
    if (!token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig || Number(exp) < Date.now()) return false;
    const expected = sign(exp);
    return sig.length === expected.length && safeEqual(sig, expected);
  } catch (e) {
    return false;
  }
}

function cookieHeader(value, maxAgeSec) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return "session=" + value + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=" + maxAgeSec + secure;
}

// ---------- Menü doğrulama ----------
class ValidationError extends Error {}

const KEY_RE = /^[a-z0-9-]{1,40}$/;

function text(v, max, name, opts) {
  const allowEmpty = opts && opts.optional;
  if (v == null || v === "") {
    if (allowEmpty) return "";
    throw new ValidationError(name + " boş olamaz.");
  }
  if (typeof v !== "string") throw new ValidationError(name + " metin olmalı.");
  const t = v.trim();
  if (!t && !allowEmpty) throw new ValidationError(name + " boş olamaz.");
  if (t.length > max) throw new ValidationError(name + " en fazla " + max + " karakter olabilir.");
  return t;
}

function validateMenu(input) {
  if (!input || typeof input !== "object") throw new ValidationError("Geçersiz menü verisi.");

  const allergens = {};
  const aIn = input.allergens;
  if (!aIn || typeof aIn !== "object" || Array.isArray(aIn)) throw new ValidationError("Alerjen listesi geçersiz.");
  const aKeys = Object.keys(aIn);
  if (aKeys.length > 30) throw new ValidationError("En fazla 30 alerjen tanımlanabilir.");
  aKeys.forEach((k) => {
    if (!KEY_RE.test(k)) throw new ValidationError("Geçersiz alerjen kodu: " + k);
    allergens[k] = text(aIn[k], 40, "Alerjen adı");
  });

  if (!Array.isArray(input.categories)) throw new ValidationError("Kategori listesi geçersiz.");
  if (input.categories.length > 40) throw new ValidationError("En fazla 40 kategori olabilir.");

  const seen = new Set();
  const categories = input.categories.map((c) => {
    if (!c || typeof c !== "object") throw new ValidationError("Geçersiz kategori.");
    if (!KEY_RE.test(c.id || "")) throw new ValidationError("Geçersiz kategori kodu.");
    if (seen.has(c.id)) throw new ValidationError("Aynı kategori iki kez var: " + c.id);
    seen.add(c.id);
    const title = text(c.title, 60, "Kategori adı");
    if (!Array.isArray(c.items)) throw new ValidationError("Ürün listesi geçersiz.");
    if (c.items.length > 100) throw new ValidationError("Bir kategoride en fazla 100 ürün olabilir.");

    const items = c.items.map((it) => {
      if (!it || typeof it !== "object") throw new ValidationError("Geçersiz ürün.");
      const n = text(it.n, 80, "Ürün adı");
      const p = Number(it.p);
      if (!Number.isFinite(p) || p < 0 || p > 100000) throw new ValidationError(n + ": fiyat 0 ile 100000 arasında olmalı.");
      const out = { n, p: Math.round(p * 100) / 100 };
      const d = text(it.d, 400, "Açıklama", { optional: true });
      const tag = text(it.tag, 60, "Etiket", { optional: true });
      const note = text(it.note, 60, "Not", { optional: true });
      if (d) out.d = d;
      if (tag) out.tag = tag;
      if (note) out.note = note;
      if (it.a != null) {
        if (!Array.isArray(it.a)) throw new ValidationError(n + ": alerjen listesi geçersiz.");
        const a = [];
        it.a.forEach((k) => {
          if (!Object.prototype.hasOwnProperty.call(allergens, k)) throw new ValidationError(n + ": tanımsız alerjen " + k);
          if (!a.includes(k)) a.push(k);
        });
        if (a.length) out.a = a;
      }
      return out;
    });
    return { id: c.id, title, items };
  });

  return { allergens, categories, updatedAt: new Date().toISOString() };
}

module.exports = {
  redis, loadMenu, saveMenu, send, readBody, clientIp, sameOrigin,
  makeToken, isAuthed, cookieHeader, safeEqual, validateMenu, ValidationError, SESSION_TTL_MS,
};
