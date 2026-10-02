const lib = require("./_lib");

// GET: oturum açık mı? POST: çıkış yap.
module.exports = async function handler(req, res) {
  if (req.method === "POST") {
    if (!lib.sameOrigin(req)) return lib.send(res, 403, { error: "İstek reddedildi." });
    return lib.send(res, 200, { ok: true }, { "Set-Cookie": lib.cookieHeader("", 0), "Cache-Control": "no-store" });
  }
  const ok = lib.isAuthed(req);
  return lib.send(res, ok ? 200 : 401, { ok }, { "Cache-Control": "no-store" });
};
