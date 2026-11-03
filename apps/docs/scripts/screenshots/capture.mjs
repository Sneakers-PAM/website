#!/usr/bin/env node
// Captures the guide screenshots from a running appliance with headless
// Chrome, scrubs every page before the capture, checks the DOM text and the
// OCR text of every image afterwards, and writes static/img/guides/ plus
// captions.yaml. See scripts/screenshots/README.md.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STEPS, REUSED } from './guides.mjs';
import { detect, detectOcr, scrubText, pageScrubScript, PAGE_TEXT_SCRIPT } from './scrub.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const env = process.env;
const need = (k) => { if (!env[k]) { console.error(`missing ${k}`); process.exit(2); } return env[k]; };
const log = (...a) => console.log(new Date().toISOString(), ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const host = need('SHOTS_HOST');
const build = need('SHOTS_BUILD');
const out = env.SHOTS_OUT || join(repo, 'static', 'img', 'guides');
const only = env.SHOTS_ONLY ? env.SHOTS_ONLY.split(',') : null;
const literals = [host, ...(env.SHOTS_LITERALS || '').split(',')].map((s) => s.trim()).filter(Boolean);
const replace = (env.SHOTS_REPLACE || '').split(',').filter(Boolean).map((p) => p.split('='));
const base = { admin: `https://${host}:8443`, product: `https://${host}` };
const secretFile = (k) => readFileSync(need(k), 'utf8').trim();
const totp = (k) => execFileSync('sh', ['-c', need(k)], { encoding: 'utf8' }).trim();

// Read-only requests pass. Connect/gRPC-web reads are POSTs, so a POST passes
// only when its method name starts with a read verb, or during a sign-in.
const READ_VERB = /\/(Get|List|Watch|Read|Describe|Check|Status|Health|Whoami|Version)[A-Za-z]*$/;
const SIGN_IN = /(sign-?in|log-?in|self-service\/login|\/sessions?\b|verify)/i;
let allowSignIn = false;
const blocked = [];

const tmp = mkdtempSync(join(tmpdir(), 'shots-'));
const chromeArgs = [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${tmp}`, '--no-first-run',
  '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,900',
  ...(env.SHOTS_SPKI ? [`--ignore-certificate-errors-spki-list=${env.SHOTS_SPKI}`] : []),
  'about:blank',
];
const chromeEnv = { ...env }; delete chromeEnv.DISPLAY; delete chromeEnv.WAYLAND_DISPLAY; delete chromeEnv.BROWSER;
const chrome = spawn(env.CHROME || 'google-chrome', chromeArgs, { env: chromeEnv, stdio: 'ignore' });
const stop = () => { try { chrome.kill('SIGTERM'); } catch {} };
const cleanup = () => { try { rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {} };
process.on('exit', () => { stop(); cleanup(); });

let port;
for (let i = 0; i < 50 && !port; i++) {
  await sleep(200);
  const f = join(tmp, 'DevToolsActivePort');
  if (existsSync(f)) port = readFileSync(f, 'utf8').split('\n')[0];
}
if (!port) { console.error('chrome did not start'); process.exit(1); }
const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let seq = 0; const pending = {};
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending[id] = r; ws.send(JSON.stringify({ id, method, params })); });
ws.onmessage = async (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending[d.id]) { pending[d.id](d.result ?? { error: d.error }); delete pending[d.id]; return; }
  if (d.method === 'Fetch.requestPaused') {
    const { requestId, request } = d.params;
    const path = new URL(request.url).pathname;
    const ok = ['GET', 'HEAD', 'OPTIONS'].includes(request.method) || READ_VERB.test(path) || (allowSignIn && SIGN_IN.test(path));
    if (ok) send('Fetch.continueRequest', { requestId });
    else { blocked.push(`${request.method} ${path}`); send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }); }
  }
};
await send('Page.enable');
await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`page script failed: ${r.exceptionDetails.text}`);
  return r.result?.value;
};
const page = {
  sleep,
  goto: async (url, wait = 4000) => { await send('Page.navigate', { url }); await sleep(wait); },
  click: (sel) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return false; e.click(); return true})()`),
  clickText: (re) => evaluate(`(()=>{const b=[...document.querySelectorAll('button')].filter(b=>${re}.test(b.textContent.trim())&&!b.disabled).pop(); if(!b) return false; b.click(); return true})()`),
  type: async (index, text) => {
    await evaluate(`(()=>{const i=[...document.querySelectorAll('input')].filter(i=>i.type!=='hidden'&&i.type!=='file')[${index}]; i.focus(); i.select&&i.select(); return true})()`);
    await send('Input.insertText', { text });
  },
  text: () => evaluate('document.body ? document.body.innerText : ""'),
};

const signedIn = { admin: false, product: false };
async function signInAdmin() {
  log('admin: sign in');
  await page.goto(`${base.admin}/home`, 5000);
  if (!/Authenticator code/.test(await page.text())) { signedIn.admin = true; return; }
  allowSignIn = true;
  await page.type(0, need('SHOTS_ADMIN_USER'));
  await page.type(1, secretFile('SHOTS_ADMIN_PASSWORD_FILE'));
  await page.type(2, totp('SHOTS_ADMIN_TOTP_CMD'));
  await page.clickText('/^Sign in$/');
  await sleep(6000);
  allowSignIn = false;
  if (/Authenticator code/.test(await page.text())) throw new Error('admin sign-in failed');
  signedIn.admin = true;
}
async function productPassword() {
  log('product: password step');
  await page.goto(`${base.product}/sign-in`, 5000);
  allowSignIn = true;
  await page.type(0, need('SHOTS_PRODUCT_USER'));
  await page.type(1, secretFile('SHOTS_PRODUCT_PASSWORD_FILE'));
  await page.clickText('/^Sign in$/');
  await sleep(5000);
  allowSignIn = false;
}
async function productCode() {
  log('product: code step');
  allowSignIn = true;
  // A code typed at the end of its 30-second window can expire in flight, so
  // one more try with the next code.
  for (let i = 0; i < 2; i++) {
    await page.type(0, totp('SHOTS_PRODUCT_TOTP_CMD'));
    await page.clickText('/^Verify/');
    await sleep(6000);
    if (!/\/sign-in/.test(await evaluate('location.pathname'))) break;
  }
  allowSignIn = false;
  if (/\/sign-in/.test(await evaluate('location.pathname'))) throw new Error(`product sign-in failed: ${scrubText(await page.text(), { literals, replace }).slice(0, 400)}`);
  signedIn.product = true;
}

function ocr(file) {
  try { return execFileSync('tesseract', [file, '-', '--psm', '11'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch (e) { if (e.code === 'ENOENT') throw new Error('tesseract is required for the OCR check'); throw e; }
}
const failures = [];
const checkImage = (name, file) => {
  for (const h of detectOcr(ocr(file), { literals })) failures.push(`${name}: OCR shows a ${h.rule} (${h.match.slice(0, 3)}...)`);
};

mkdirSync(out, { recursive: true });
const captions = [];
const wanted = (s) => !only || only.includes(s.guide);
try {
  for (const s of STEPS) {
    if (!wanted(s)) continue;
    const name = `${s.guide}-${s.step}`;
    if (s.auth === 'admin' && !signedIn.admin) await signInAdmin();
    if (s.auth === 'product' && !signedIn.product) { await productPassword(); await productCode(); }
    if (s.auth === 'product-password') await productPassword();
    if (s.path) await page.goto(`${base[s.app]}${s.path}`, 5000);
    if (s.before) await s.before(page);
    await evaluate(pageScrubScript({ literals, replace }));
    for (const h of detect(await evaluate(PAGE_TEXT_SCRIPT), { literals })) failures.push(`${name}: DOM still shows a ${h.rule} (${h.match.slice(0, 3)}...)`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const staged = join(tmp, `${name}.png`);
    writeFileSync(staged, Buffer.from(shot.data, 'base64'));
    const before = failures.length;
    checkImage(name, staged);
    if (failures.length === before) copyFileSync(staged, join(out, `${name}.png`));
    captions.push({ file: `${name}.png`, guide: s.guide, step: s.step, alt: s.alt, source: 'live', build });
    log('captured', name);
    // The scrubbed page is not reused for input: sign-in starts again cleanly.
  }
  const reuseDir = env.SHOTS_REUSE_DIR;
  for (const r of REUSED) {
    if (!wanted(r)) continue;
    const name = `${r.guide}-${r.step}`;
    const file = join(out, `${name}.png`);
    const src = reuseDir ? join(reuseDir, r.src) : file;
    if (!existsSync(src)) { failures.push(`${name}: no image (set SHOTS_REUSE_DIR)`); continue; }
    const before = failures.length;
    checkImage(name, src);
    if (failures.length === before && src !== file) copyFileSync(src, file);
    captions.push({ file: `${name}.png`, guide: r.guide, step: r.step, alt: r.alt, source: 'reused', build: env.SHOTS_REUSE_BUILD || 'earlier build' });
  }
} catch (e) {
  console.error(e.message);
  if (blocked.length) console.error('blocked:', [...new Set(blocked)].join(', '));
  stop();
  process.exit(1);
} finally {
  stop();
}

const q = (v) => JSON.stringify(String(v));
const yaml = [
  '# Generated by scripts/screenshots/capture.mjs; re-run it, don\'t edit by hand.',
  `build: ${q(build)}`,
  `captured: ${q(new Date().toISOString().slice(0, 10))}`,
  'blocked_requests:',
  ...(blocked.length ? [...new Set(blocked)].map((b) => `  - ${q(b)}`) : ['  []']),
  'images:',
  ...captions.sort((a, b) => a.file.localeCompare(b.file)).flatMap((c) => [
    `  - file: ${q(c.file)}`, `    guide: ${q(c.guide)}`, `    step: ${q(c.step)}`, `    source: ${c.source}`, `    build: ${q(c.build)}`, `    alt: ${q(c.alt)}`,
  ]),
].join('\n').replace('blocked_requests:\n  []', 'blocked_requests: []');
if (!only) writeFileSync(join(out, 'captions.yaml'), `${yaml}\n`);

if (blocked.length) log('blocked writes:', [...new Set(blocked)].join(', '));
if (failures.length) { console.error('SCRUB CHECK FAILED'); for (const f of failures) console.error(' ', f); process.exit(1); }
log(`scrub check passed: ${captions.length} images, build ${build}`);
process.exit(0);
