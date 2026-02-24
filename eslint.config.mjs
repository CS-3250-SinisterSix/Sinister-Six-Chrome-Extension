import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Ignore generated / external directories
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/", "docs/api/"],
  },

  // Lint JS files with recommended rules + browser/extension globals
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
]);