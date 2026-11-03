/*
Copyright 2026 The Sneakers-PAM Authors
SPDX-License-Identifier: Apache-2.0
*/
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { sharedPublic } from "./shared-public";

// See react-router.config.ts: the same PREVIEW_BASE_PATH, read here so the
// asset URLs match the router's basename in a one-off preview build.
export default defineConfig({
  base: process.env.PREVIEW_BASE_PATH || "/",
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // The fonts (packages/frame) and the marks and icons (packages/brand) are
    // served from the site root, the same as the docs serve them.
    sharedPublic([
      new URL("../../packages/frame/public/", import.meta.url).pathname,
      new URL("../../packages/brand/public/", import.meta.url).pathname,
    ]),
  ],
});
