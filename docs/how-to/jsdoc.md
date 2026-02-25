# JSDoc (API Documentation)

## Purpose

JSDoc generates HTML documentation from comments in our JavaScript source files. The output goes to `docs/api/`.

## How it works

- Config file: `jsdoc.json` (repo root)
- Source folder: `src/`
- Output folder: `docs/api/`
- Runs via: `npm run docs:api`

> **Note:** The `docs:api` script and `jsdoc` dependency are defined on the jsdoc feature branch. Once that branch is merged into `develop`, these commands will be available to everyone.

## Steps

### Build the docs

```sh
npm run docs:api
```

This scans all `.js`/`.ts` files in `src/` and generates HTML in `docs/api/`.

### View the docs

Open `docs/api/index.html` in a browser:

```sh
open docs/api/index.html        # macOS
xdg-open docs/api/index.html    # Linux
start docs/api/index.html       # Windows
```

### Write JSDoc comments

Add comments above functions and classes:

```js
/**
 * Apply a theme to the browser.
 * @param {string} themeId - The ID of the theme to apply.
 * @returns {Promise<ThemeApplyResult>} The result of applying the theme.
 */
async function applyTheme(themeId) {
  // ...
}
```

Common tags: `@param`, `@returns`, `@typedef`, `@property`, `@module`, `@throws`.

## Verification commands

```sh
# Install dependencies (if not done already)
npm install

# Build the docs
npm run docs:api

# Check that output was generated
ls docs/api/index.html
```

## Common issues

| Problem                              | Fix                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `npm run docs:api` not found         | The `docs:api` script is only available after the jsdoc branch is merged. Check `package.json` for the script |
| `jsdoc: command not found`           | Run `npm install` to install dev dependencies                                                                 |
| Output is empty or missing functions | Make sure your functions have `/** ... */` comments (not `//`). JSDoc only picks up block comments with `/**` |
| `@param` type shows as `unknown`     | Add the type in curly braces: `@param {string} name`                                                          |
| `docs/api/` is committed by accident | `docs/api/` should be in `.gitignore`. Don't commit generated output                                          |
| Build warning: "unrecognized tag"    | Check for typos in tag names (e.g. `@retuns` instead of `@returns`)                                           |
