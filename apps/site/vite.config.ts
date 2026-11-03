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
  // React Router's dev plugin pre-bundles react-router-dom whenever it can
  // resolve it, and in this workspace it resolves to the docs' Docusaurus copy
  // (v5), which breaks the dev server. In v7 react-router-dom only re-exports
  // react-router, so point it there. The site itself never imports it.
  resolve: {
    alias: { "react-router-dom": "react-router" },
  },
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
