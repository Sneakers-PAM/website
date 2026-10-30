/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
// Prints the prerendered /trust/security-review page to a PDF with headless
// Chrome, as the last step of `npm run build`. The PDF lands in
// build/client/trust/, so the trust center's download link ships with the site.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("build/client");
const outDir = resolve("build/client/trust");
const out = join(outDir, "sneakers-security-review.pdf");
const page = "/trust/security-review";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

function log(level, msg) {
  console.log(`${new Date().toISOString()} ${level} build-security-pdf: ${msg}`);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS app bundle path, not a host. scrub:allow=fqdn
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

if (!existsSync(join(root, "trust/security-review/index.html"))) {
  log("error", `no prerendered ${page} in build/client; run react-router build first`);
  process.exit(1);
}

const chrome = findChrome();
if (!chrome) {
  log("error", "no Chrome or Chromium found; set CHROME_PATH");
  process.exit(1);
}
log("debug", `chrome at ${chrome}`);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let file = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    log("warn", `404 ${url.pathname}`);
    res.writeHead(404).end();
    return;
  }
  log("trace", `200 ${url.pathname}`);
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  const target = `http://127.0.0.1:${port}${page}`;
  mkdirSync(outDir, { recursive: true });
  log("info", `printing ${target} to ${out}`);
  const started = Date.now();
  const profile = mkdtempSync(join(tmpdir(), "sneakers-pdf-"));
  // Async on purpose: a synchronous spawn would block this process's own
  // server from answering Chrome.
  execFile(
    chrome,
    [
      "--headless=new",
      // A throwaway profile keeps the print away from any Chrome already open.
      `--user-data-dir=${profile}`,
      "--disable-gpu",
      // Ubuntu 24.04 runners block the sandbox's user namespaces; the page is
      // this build's own static output.
      ...(process.env.CI ? ["--no-sandbox"] : []),
      "--no-first-run",
      "--no-default-browser-check",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=15000",
      `--print-to-pdf=${out}`,
      target,
    ],
    { timeout: 120_000 },
    (err, _stdout, stderr) => {
      server.close();
      rmSync(profile, { recursive: true, force: true });
      if (err || !existsSync(out)) {
        log("error", `chrome failed: ${err?.message ?? "no output"} ${stderr.trim()}`);
        process.exit(1);
      }
      log("info", `wrote ${out} (${statSync(out).size} bytes) in ${Date.now() - started} ms`);
    },
  );
});
