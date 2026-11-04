/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";

import { OG_IMAGE, SITE_URL, pageMeta } from "./meta.ts";

type Tag = { title?: string; name?: string; property?: string; content?: string };

const tag = (tags: Tag[], key: string) =>
  tags.find((entry) => entry.property === key || entry.name === key)?.content;

const home = pageMeta({ title: "Sneakers-PAM — home", description: "The pitch.", path: "/" }) as Tag[];

test("every page gets a full Open Graph card with the share image", () => {
  assert.equal(tag(home, "og:site_name"), "Sneakers-PAM");
  assert.equal(tag(home, "og:title"), "Sneakers-PAM — home");
  assert.equal(tag(home, "og:description"), "The pitch.");
  assert.equal(tag(home, "og:type"), "website");
  assert.equal(tag(home, "og:url"), "https://www.sneakers-pam.com/");
  assert.equal(tag(home, "og:image"), `${SITE_URL}${OG_IMAGE.path}`);
  assert.equal(tag(home, "og:image:width"), "1200");
  assert.equal(tag(home, "og:image:height"), "630");
  assert.equal(tag(home, "og:image:type"), "image/png");
  assert.ok(tag(home, "og:image:alt"));
});

test("every page gets a large-image Twitter card with the same image and alt text", () => {
  assert.equal(tag(home, "twitter:card"), "summary_large_image");
  assert.equal(tag(home, "twitter:title"), "Sneakers-PAM — home");
  assert.equal(tag(home, "twitter:description"), "The pitch.");
  assert.equal(tag(home, "twitter:image"), tag(home, "og:image"));
  assert.equal(tag(home, "twitter:image:alt"), tag(home, "og:image:alt"));
});

test("the title and description are the page's own, and URLs are absolute", () => {
  const trust = pageMeta({ title: "Trust center · Sneakers-PAM", description: "Controls.", path: "/trust" }) as Tag[];
  assert.equal(trust.find((entry) => entry.title)?.title, "Trust center · Sneakers-PAM");
  assert.equal(tag(trust, "description"), "Controls.");
  assert.equal(tag(trust, "og:url"), "https://www.sneakers-pam.com/trust");
  assert.match(tag(trust, "og:image") ?? "", /^https:\/\//);
});

test("the share image is the brand's card, served from the site root", () => {
  assert.ok(existsSync(new URL(`../../../../packages/brand/public${OG_IMAGE.path}`, import.meta.url)));
});
