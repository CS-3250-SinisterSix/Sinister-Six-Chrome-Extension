# Prettier (Code Formatting)

## Purpose

Prettier auto-formats code so the team has a consistent style without debating tabs vs. spaces.

## How it works

- Config file: `.prettierrc.json` (repo root)
- Ignored paths: `.prettierignore` (repo root)
- Targets: `**/*.{js,ts,json,md,css,html}`

Our settings (`.prettierrc.json`):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

## Steps

### Check if files are formatted

```sh
npm run format:check
```

This exits with code 1 if any file is unformatted. Use this before committing.

### Auto-format all files

```sh
npm run format
```

This rewrites files in place. Review the changes with `git diff` before committing.

### Format a single file

```sh
npx prettier --write path/to/file.js
```

## Verification commands

```sh
# Install dependencies (if not done already)
npm install

# Check formatting (CI-friendly, exits 1 if unformatted)
npm run format:check

# Auto-fix formatting
npm run format

# Verify everything passes after formatting
npm run format:check
```

## Common issues

| Problem                                       | Fix                                                                                                                                                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format:check` fails in CI but passes locally | Run `npm run format`, commit the changes, and push                                                                                                                                             |
| Prettier and ESLint disagree on a rule        | We use `eslint-config-prettier` to disable conflicting ESLint rules. ESLint should never complain about formatting. If it does, check that `prettier` is the last entry in `eslint.config.mjs` |
| A file is being formatted that shouldn't be   | Add the path to `.prettierignore`                                                                                                                                                              |
| `npx prettier: command not found`             | Run `npm install` first                                                                                                                                                                        |
| Formatting changes look wrong                 | Check `.prettierrc.json` for the current settings. Do not override them in your editor without team agreement                                                                                  |
