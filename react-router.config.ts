import type { Config } from "@react-router/dev/config";

// Prerender every route to static HTML at build time, no Node server at
// request time -- ssr: false plus a prerender list is React Router v7's
// static-site-generation mode.
//
// PREVIEW_BASE_PATH lets a one-off preview build (served from a sub-path on
// someone else's server) set the router's basename without touching this
// file; it's unset in the real build, so basename defaults to "/".
const basename = process.env.PREVIEW_BASE_PATH || "/";

export default {
  ssr: false,
  basename,
  async prerender() {
    return ["/"];
  },
} satisfies Config;
