/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The frame (packages/frame) and the brand assets (packages/brand) are the
// website's own; these check that the docs site loads them the way the
// website does.
const config = readFileSync(new URL('../docusaurus.config.ts', import.meta.url), 'utf8');
const fonts = readdirSync(new URL('../../../packages/frame/public/fonts/', import.meta.url));

test('the site config loads the shared frame first, then the docs styles', () => {
  assert.match(config, /const framePackage = '\.\.\/\.\.\/packages\/frame';/);
  assert.match(config, /customCss: \[`\$\{framePackage\}\/site-frame\.css`, '\.\/src\/css\/custom\.css'\]/);
});

test('the site serves the shared fonts and brand assets from the site root', () => {
  assert.match(config, /staticDirectories: \['static', `\$\{framePackage\}\/public`, `\$\{brandPackage\}\/public`\]/);
  for (const name of ['favicon.svg', 'img/mark-light.svg', 'img/mark-dark.svg']) {
    assert.ok(readFileSync(new URL(`../../../packages/brand/public/${name}`, import.meta.url)).length > 0, name);
  }
});

test('the site config preloads the same three fonts as the website', () => {
  const list = config.match(/headTags: \[([^\]]+)\]/);
  assert.ok(list, 'docusaurus.config.ts has no preload list');
  const preloaded = [...list[1].matchAll(/'([^']+\.woff2)'/g)].map((match) => match[1]);
  assert.deepEqual(preloaded, ['bricolage-grotesque-latin.woff2', 'atkinson-hyperlegible-400-latin.woff2', 'jetbrains-mono-latin.woff2']);
  for (const name of preloaded) assert.ok(fonts.includes(name), `${name} is preloaded but not in packages/frame/public/fonts`);
});
