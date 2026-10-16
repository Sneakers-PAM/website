import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// See react-router.config.ts: the same PREVIEW_BASE_PATH, read here so the
// asset URLs match the router's basename in a one-off preview build.
export default defineConfig({
  base: process.env.PREVIEW_BASE_PATH || "/",
  plugins: [reactRouter(), tsconfigPaths()],
});
