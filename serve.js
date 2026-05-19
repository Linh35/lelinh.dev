#!/usr/bin/env node
// serve.js — Node stdlib dev server for the static site under src/.
// Single doc root; misses serve src/404.html (matches Cloudflare Pages).
// Run from the repo root: `node serve.js`.
const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE_ROOT = path.join(__dirname, "src");
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function notFound(res) {
  fs.readFile(path.join(SITE_ROOT, "404.html"), (e, data) =>
    e ? send(res, 404, "Not Found")
      : send(res, 404, data, { "Content-Type": "text/html; charset=utf-8" }));
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    return send(res, 400, "Bad Request");
  }

  const filePath = path.join(SITE_ROOT, urlPath);
  if (!filePath.startsWith(SITE_ROOT)) return send(res, 403, "Forbidden");

  fs.stat(filePath, (err, stat) => {
    if (err) return notFound(res);

    if (stat.isDirectory()) {
      if (!urlPath.endsWith("/")) {
        return send(res, 301, null, { Location: urlPath + "/" });
      }
      const indexFile = path.join(filePath, "index.html");
      return fs.readFile(indexFile, (e, data) => {
        if (e) return notFound(res);
        send(res, 200, data, { "Content-Type": "text/html; charset=utf-8" });
      });
    }

    const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`serving ${SITE_ROOT} at http://localhost:${PORT}`);
});
