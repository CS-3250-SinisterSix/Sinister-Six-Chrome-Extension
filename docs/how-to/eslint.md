# ESLint (Code Linting)

## Purpose

ESLint catches bugs and enforces code quality rules before they reach code review.

## How it works

- Config file: `eslint.config.mjs` (repo root, flat config format)
- Rule set: `@eslint/js` recommended rules
- Globals: `browser` + `webextensions` (Chrome extension APIs)
- Prettier integration: `eslint-config-prettier` disables formatting rules so ESLint and Prettier never conflict

Ignored paths (defined in `eslint.config.mjs`):

- `node_modules/`
- `dist/`, `build/`
- `coverage/`
- `docs/`

## Steps

### Check for lint errors

```sh
npm run lint
```

This exits with code 1 if there are errors. The output shows the file, line number, and rule name.

### Auto-fix lint errors

```sh
npm run lint:fix
```

This fixes what ESLint can fix automatically (unused imports, spacing, etc.). Not all errors are auto-fixable.

### Lint a single file

```sh
npx eslint src/themes.js
```

### Understand an error

ESLint errors include the rule name, e.g. `no-unused-vars`. To learn what a rule means:

```
https://eslint.org/docs/latest/rules/RULE_NAME
```

Replace `RULE_NAME` with the actual rule (e.g. `no-unused-vars`).

## Verification commands

```sh
# Install dependencies (if not done already)
npm install

# Run the linter
npm run lint

# Auto-fix issues
npm run lint:fix

# Confirm no remaining errors
npm run lint
```

## Common issues

| Problem                                                       | Fix                                                                                                                                                      |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-unused-vars` error                                        | Remove the unused variable, or prefix it with `_` if intentional (e.g. `_unused`)                                                                        |
| `no-undef` error for `chrome`                                 | The `webextensions` globals are already configured. If you see this, make sure `eslint.config.mjs` includes `globals.webextensions`                      |
| ESLint complains about formatting (indentation, quotes, etc.) | This shouldn't happen — `eslint-config-prettier` disables those rules. Make sure `prettier` is the last entry in the config array in `eslint.config.mjs` |
| `ESLint couldn't find an eslint.config`                       | You're running ESLint from outside the project folder. `cd` into the repo root first                                                                     |
| Too many errors to fix at once                                | Run `npm run lint:fix` first to auto-fix what's possible, then fix remaining errors manually one file at a time                                          |
