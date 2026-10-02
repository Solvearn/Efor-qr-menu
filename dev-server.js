// Yerelde denemek için: node dev-server.js  ->  http://localhost:3000  ve  http://localhost:3000/panel
// Vercel dışında veritabanı yerine bellek kullanılır; kapatınca kayıtlar silinir.
// Giriş bilgileri için: ADMIN_USER=admin ADMIN_PASSWORD=deneme node dev-server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const routes = { "/api/menu": "menu", "/api/login": "login", "/api/session": "session" };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const route = routes[url.pathname];

  if (route) {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : undefined; } catch (e) { req.body = undefined; }
      require("./api/" + route)(req, res);
    });
    return;
  }

  let file = url.pathname === "/" ? "/index.html" : url.pathname === "/panel" ? "/admin.html" : url.pathname;
  file = path.join(__dirname, path.normalize(file));
  if (!file.startsWith(__dirname) || path.basename(file).startsWith(".") || file.includes(path.sep + "api" + path.sep)) {
    res.statusCode = 404; return res.end("Not found");
  }
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(buf);
  });
}).listen(PORT, () => console.log("http://localhost:" + PORT));
