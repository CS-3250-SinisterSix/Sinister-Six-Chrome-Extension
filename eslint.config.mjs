import eslintJs from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  // Ignored paths
  {
    ignores: ["node_modules/", "dist/", "build/", "coverage/", "docs/api/"],
  },

  // Base recommended rules for all JS files
  eslintJs.configs.recommended,

  // Global settings for extension/browser code
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },

  // Node environment for tooling scripts (so `process` is defined)
  {
    files: ["build.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Prettier must be last to override formatting rules
  prettier,
];