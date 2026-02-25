import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: {...globals.browser,  ...globals.webextensions } }},
]);
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // Ignored paths
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/', 'docs/api/'],
  },

  // Base recommended rules for all JS files
  js.configs.recommended,

  // Global settings
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },

  // Prettier must be last to override formatting rules
  prettier,
];
