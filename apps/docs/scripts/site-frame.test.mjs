import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';

// src/css/site-frame.css and static/fonts/ are copies of the website's
// (Sneakers-PAM/website app/site-frame.css and public/fonts/), which is the
// source of truth. These are the website's checksums: when its frame
// changes, copy the files over unchanged and update both checksums here.
const SITE_FRAME_SHA256 = 'aafef473b65e159a5e1ce0bb269d4ea7f358f7d6ea85b786d323f919b7c5be6c';
const FONTS_SHA256 = '27abdef0193b7fea3d84736891e15649aa403c45e3e66b060728faa96a35e69a';

const framePath = new URL('../src/css/site-frame.css', import.meta.url);
const fontsDir = new URL('../static/fonts/', import.meta.url);
const frame = readFileSync(framePath, 'utf8');
const fonts = readdirSync(fontsDir).filter((name) => name.endsWith('.woff2')).sort();

const sha256 = (data) => createHash('sha256').update(data).digest('hex');

test("site-frame.css is the website's copy, byte for byte", () => {
  assert.equal(
    sha256(readFileSync(framePath)),
    SITE_FRAME_SHA256,
    "src/css/site-frame.css differs from the website's: copy the website's file over, never edit it here",
  );
});

test("the font files are the website's, byte for byte", () => {
  const hash = createHash('sha256');
  for (const name of fonts) {
    hash.update(`${name}\n`);
    hash.update(readFileSync(new URL(name, fontsDir)));
  }
  assert.equal(hash.digest('hex'), FONTS_SHA256, "static/fonts differs from the website's public/fonts");
});

test('every font the frame declares is a file in static/fonts', () => {
  const urls = [...frame.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.deepEqual([...new Set(urls)].sort(), fonts);
});

test('the site config loads the frame first and preloads the same fonts as the website', () => {
  const config = readFileSync(new URL('../docusaurus.config.ts', import.meta.url), 'utf8');
  assert.match(config, /customCss: \['\.\/src\/css\/site-frame\.css', '\.\/src\/css\/custom\.css'\]/);
  const list = config.match(/headTags: \[([^\]]+)\]/);
  assert.ok(list, 'docusaurus.config.ts has no preload list');
  const preloaded = [...list[1].matchAll(/'([^']+\.woff2)'/g)].map((match) => match[1]);
  assert.deepEqual(preloaded, ['bricolage-grotesque-latin.woff2', 'atkinson-hyperlegible-400-latin.woff2', 'jetbrains-mono-latin.woff2']);
});
