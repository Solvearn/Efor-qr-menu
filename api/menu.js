const lib = require("./_lib");

// GET: herkese açık menü verisi. PUT: sadece giriş yapmış yönetici.
module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const menu = await lib.loadMenu();
      return lib.send(res, 200, { menu }, {
        "Cache-Control": "public, max-age=0, s-maxage=20, stale-while-revalidate=60",
      });
    }

    if (req.method === "PUT") {
      if (!lib.sameOrigin(req)) return lib.send(res, 403, { error: "İstek reddedildi." });
      if (!lib.isAuthed(req)) return lib.send(res, 401, { error: "Oturum süresi doldu, tekrar giriş yapın." });
      const body = lib.readBody(req);
      const clean = lib.validateMenu(body && body.menu);
      await lib.saveMenu(clean);
      return lib.send(res, 200, { ok: true, updatedAt: clean.updatedAt }, { "Cache-Control": "no-store" });
    }

    res.setHeader("Allow", "GET, PUT");
    return lib.send(res, 405, { error: "Yöntem desteklenmiyor." });
  } catch (e) {
    if (e instanceof lib.ValidationError) return lib.send(res, 400, { error: e.message });
    if (e.message === "STORE_NOT_CONFIGURED") return lib.send(res, 503, { error: "Veritabanı bağlı değil." });
    if (e.message === "SESSION_NOT_CONFIGURED") return lib.send(res, 503, { error: "SESSION_SECRET ayarlı değil." });
    console.error(e);
    return lib.send(res, 500, { error: "Sunucu hatası." });
  }
};
