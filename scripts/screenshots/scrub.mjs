// Scrub rules for guide screenshots. The same rules run three ways: on the
// live page's DOM before a capture, on the DOM text after it, and on the OCR
// text of every saved image. A hit after scrubbing fails the run.

export const FAKE = {
  ipv4: '192.0.2.10',
  ipv6: '2001:db8::10',
  host: 'sneakers.example.org',
  fingerprint: '00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF',
  sshFingerprint: 'SHA256:EXAMPLEfingerprintEXAMPLEfingerprint',
  shortFingerprint: '00:11:...:FF',
  mac: '00:00:5E:00:53:01',
  uuid: '00000000-0000-4000-8000-000000000000',
  code: 'XXXX-XXXX-XXXX',
  token: 'EXAMPLE-TOKEN',
  digits: '000000',
  serial: 'EXAMPLE-SERIAL',
};

// Domains that may appear in a screenshot as they are.
const SAFE_DOMAINS = String.raw`(?:^|\.)(?:example\.(?:org|com|net)$|^example$|(?:sneakers-pam\.(?:com|github\.io)|github\.com|githubusercontent\.com)$)`;
// Documentation and loopback addresses (RFC 5737, RFC 3849).
const SAFE_IPV4 = String.raw`^(?:192\.0\.2|198\.51\.100|203\.0\.113)\.\d{1,3}$|^0\.0\.0\.0$|^127\.0\.0\.1$`;

export const RULES = [
  { name: 'ssh-fingerprint', src: String.raw`SHA256:[A-Za-z0-9+/]{16,}={0,2}`, flags: 'g', fake: FAKE.sshFingerprint },
  { name: 'fingerprint', src: String.raw`\b[0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){6,}\b`, flags: 'g', fake: FAKE.fingerprint },
  { name: 'short-fingerprint', src: String.raw`\b[0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2})*:(?:\.\.\.|\u2026):[0-9A-Fa-f]{2}\b`, flags: 'g', fake: FAKE.shortFingerprint },
  { name: 'mac', src: String.raw`(?<![0-9A-Fa-f:-])[0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5}(?![0-9A-Fa-f:-])`, flags: 'g', fake: FAKE.mac },
  {
    name: 'ipv6',
    src: String.raw`(?<![\w:])(?:[0-9a-fA-F]{1,4}:){1,7}:(?:[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4})*)?(?![\w:])|(?<![\w:])(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?![\w:])`,
    flags: 'g',
    fake: FAKE.ipv6,
    allow: String.raw`^2001:db8:`,
  },
  { name: 'uuid', src: String.raw`\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b`, flags: 'g', fake: FAKE.uuid },
  { name: 'serial', src: String.raw`(?<=Serial(?: number)?:?\s{1,3})[A-Za-z0-9][A-Za-z0-9-]{3,}`, flags: 'gi', fake: FAKE.serial },
  { name: 'grouped-code', src: String.raw`\b[A-Za-z0-9]{4,}(?:-[A-Za-z0-9]{4,}){2,}\b`, flags: 'g', fake: FAKE.code, need: [String.raw`\d`] },
  {
    name: 'token',
    src: String.raw`(?<![A-Za-z0-9+/=_-])[A-Za-z0-9+/_-]{20,}={0,2}(?![A-Za-z0-9+/=_-])`,
    flags: 'g',
    fake: FAKE.token,
    need: [String.raw`\d.*\d`, String.raw`[A-Za-z].*[A-Za-z]`],
  },
  {
    name: 'hostname',
    src: String.raw`\b(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+(?:internal|local|lan|corp|home|arpa|example|test|invalid|org|com|net|io|dev)\b`,
    flags: 'g',
    fake: FAKE.host,
    allow: SAFE_DOMAINS,
  },
  { name: 'ipv4', src: String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b`, flags: 'g', fake: FAKE.ipv4, allow: SAFE_IPV4 },
  { name: 'six-digit-code', src: String.raw`(?<![\w.:-])\d{6}(?![\w.:-])`, flags: 'g', fake: FAKE.digits },
];

// Self-contained so it can be serialised into the page with toString().
export function scrubWith(text, rules, literals, replace) {
  let out = String(text);
  for (const [from, to] of replace || []) out = out.split(from).join(to);
  for (const lit of literals || []) if (lit) out = out.split(lit).join(rules.literalFake);
  for (const r of rules.list) {
    const re = new RegExp(r.src, r.flags);
    out = out.replace(re, (m) => {
      if (m === r.fake) return m;
      if (r.allow && new RegExp(r.allow, 'i').test(m)) return m;
      if (r.need && !r.need.every((n) => new RegExp(n).test(m))) return m;
      return r.fake;
    });
  }
  return out;
}

export function detect(text, { literals = [], rules = RULES } = {}) {
  const hits = [];
  const s = String(text);
  for (const lit of literals) if (lit && s.includes(lit)) hits.push({ rule: 'literal', match: lit });
  for (const r of rules) {
    for (const m of s.matchAll(new RegExp(r.src, r.flags))) {
      const v = m[0];
      if (r.fake.includes(v)) continue;
      if (r.allow && new RegExp(r.allow, 'i').test(v)) continue;
      if (r.need && !r.need.every((n) => new RegExp(n).test(v))) continue;
      hits.push({ rule: r.name, match: v });
    }
  }
  return hits;
}

export function scrubText(text, { literals = [], replace = [], rules = RULES } = {}) {
  return scrubWith(text, { list: rules, literalFake: FAKE.host }, literals, replace);
}

// Rewrites every text node, form value and labelled attribute on the page
// (shadow roots and same-origin frames included), and blurs anything drawn as
// pixels (QR codes, canvases), so the capture only ever shows fake values.
export function pageScrubScript({ literals = [], replace = [] } = {}) {
  const rules = { list: RULES, literalFake: FAKE.host };
  return `(() => {
    const scrub = ${scrubWith.toString()};
    const rules = ${JSON.stringify(rules)};
    const lits = ${JSON.stringify(literals)};
    const rep = ${JSON.stringify(replace)};
    const s = (t) => scrub(t, rules, lits, rep);
    const attrs = ['title', 'aria-label', 'placeholder', 'value', 'alt', 'href', 'data-value'];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const walk = (root) => {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) { const v = s(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
      for (const el of root.querySelectorAll('*')) {
        if (el.type === 'hidden') continue;
        for (const a of attrs) if (el.hasAttribute(a)) { const v = s(el.getAttribute(a)); if (v !== el.getAttribute(a)) el.setAttribute(a, v); }
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          if (el.type === 'password' || el.autocomplete === 'one-time-code') { if (el.value) setter.call(el, ''); }
          else if (el.type !== 'hidden' && el.value) { const v = s(el.value); if (v !== el.value) el.value = v; }
        }
        if (el.matches('canvas, img[alt*="QR" i], img[src^="data:"], [data-qr], svg[aria-label*="QR" i]')) el.style.filter = 'blur(14px)';
        if (el.shadowRoot) walk(el.shadowRoot);
        if (el.tagName === 'IFRAME') { try { if (el.contentDocument) walk(el.contentDocument); } catch (e) {} }
      }
    };
    walk(document);
    document.title = s(document.title);
    return true;
  })()`;
}

// Everything a viewer could read off the page: text, form values and the
// labelled attributes, for the post-scrub check.
export const PAGE_TEXT_SCRIPT = `(() => {
  const out = [document.title];
  const attrs = ['title', 'aria-label', 'placeholder', 'value', 'alt', 'href', 'data-value'];
  const walk = (root) => {
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.parentElement && !['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) out.push(n.nodeValue);
    for (const el of root.querySelectorAll('*')) {
      if (el.type === 'hidden') continue;
      for (const a of attrs) if (el.hasAttribute(a)) out.push(el.getAttribute(a));
      if ('value' in el && typeof el.value === 'string' && el.value && el.type !== 'hidden') out.push(el.value);
      if (el.shadowRoot) walk(el.shadowRoot);
      if (el.tagName === 'IFRAME') { try { if (el.contentDocument) walk(el.contentDocument); } catch (e) {} }
    }
  };
  walk(document);
  return out.join('\\n');
})()`;

// OCR misreads the fake values themselves (a letter swapped in the fake host
// name, a dash in place of a colon), so
// an OCR hit that is a near copy of a fake value is not a leak.
const norm = (v) => String(v).toUpperCase().replace(/O/g, '0').replace(/[^A-Z0-9]/g, '');
const dist = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
export function nearFake(match) {
  const m = norm(match);
  if (!m) return true;
  const limit = Math.max(2, Math.floor(m.length / 4));
  for (const f of Object.values(FAKE).map(norm)) {
    if (f.includes(m)) return true;
    for (let w = Math.max(1, m.length - limit); w <= m.length + limit; w++)
      for (let i = 0; i + w <= f.length; i++) if (dist(m, f.slice(i, i + w)) <= limit) return true;
  }
  return false;
}

export function detectOcr(text, opts = {}) {
  return detect(text, opts).filter((h) => !nearFake(h.match));
}
