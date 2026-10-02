const lib = require("./_lib");

const MAX_ATTEMPTS = 8;
const WINDOW_SEC = 15 * 60;

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return lib.send(res, 405, { error: "Yöntem desteklenmiyor." });
    }
    if (!lib.sameOrigin(req)) return lib.send(res, 403, { error: "İstek reddedildi." });

    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASSWORD;
    if (!user || !pass) return lib.send(res, 503, { error: "Yönetici hesabı ayarlanmamış (ADMIN_USER / ADMIN_PASSWORD)." });

    // Deneme sınırı: IP başına 15 dakikada 8 yanlış deneme
    const rlKey = "efor:rl:" + lib.clientIp(req);
    try {
      const n = await lib.redis(["INCR", rlKey]);
      if (n === 1) await lib.redis(["EXPIRE", rlKey, WINDOW_SEC]);
      if (n > MAX_ATTEMPTS) return lib.send(res, 429, { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." });
    } catch (e) {
      if (e.message === "STORE_NOT_CONFIGURED") return lib.send(res, 503, { error: "Veritabanı bağlı değil." });
      throw e;
    }

    const body = lib.readBody(req) || {};
    // İki karşılaştırma da her zaman yapılır (zamanlama farkı sızdırmamak için)
    const okUser = lib.safeEqual(body.username || "", user);
    const okPass = lib.safeEqual(body.password || "", pass);
    if (!(okUser && okPass)) return lib.send(res, 401, { error: "Kullanıcı adı veya şifre hatalı." });

    await lib.redis(["DEL", rlKey]);
    return lib.send(res, 200, { ok: true }, {
      "Set-Cookie": lib.cookieHeader(lib.makeToken(), lib.SESSION_TTL_MS / 1000),
      "Cache-Control": "no-store",
    });
  } catch (e) {
    if (e.message === "SESSION_NOT_CONFIGURED") return lib.send(res, 503, { error: "SESSION_SECRET ayarlı değil (en az 16 karakter)." });
    console.error(e);
    return lib.send(res, 500, { error: "Sunucu hatası." });
  }
};
