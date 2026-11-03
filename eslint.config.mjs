import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["**/build", "**/node_modules", "**/.react-router", "**/.docusaurus"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React Router's createRoot handles this; no React import needed per file.
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    // Build scripts run on Node, not in the browser.
    files: ["**/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        URL: "readonly",
        WebSocket: "readonly",
        console: "readonly",
        fetch: "readonly",
        process: "readonly",
        setTimeout: "readonly",
      },
    },
    // A failed best-effort cleanup (killing Chrome, removing a temp folder)
    // is ignored on purpose.
    rules: { "no-empty": ["error", { allowEmptyCatch: true }] },
  },
);
