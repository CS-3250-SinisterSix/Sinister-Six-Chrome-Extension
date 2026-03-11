# Troubleshooting

## Purpose

Quick fixes for common problems. Check here before asking for help.

---

## Node / npm issues

### `npm: command not found`

Node.js is not installed or not in your PATH.

```sh
# Check if Node is installed
node -v

# If not, install from https://nodejs.org (LTS version)
# Or use nvm:
nvm install --lts
nvm use --lts
```

### Node version mismatch

Some dependencies need Node 18+.

```sh
# Check your version
node -v

# If below v18, upgrade:
nvm install 18
nvm use 18
```

### `npm install` fails

Try a clean install:

```sh
rm -rf node_modules package-lock.json
npm install
```

If you still get errors, check that your Node version is v18+.

---

## Lint errors

### Finding and fixing lint errors

```sh
# See all errors with file paths and line numbers
npm run lint

# Auto-fix what ESLint can handle
npm run lint:fix

# Then fix remaining errors manually
npm run lint
```

### Understanding a rule

Error output includes the rule name (e.g. `no-unused-vars`). Look it up:

```
https://eslint.org/docs/latest/rules/no-unused-vars
```

---

## Prettier vs ESLint conflicts

This should not happen in our setup. We use `eslint-config-prettier` which disables all ESLint formatting rules.

If you see ESLint errors about indentation, quotes, or semicolons:

1. Open `eslint.config.mjs`.
2. Confirm `prettier` is the **last** entry in the config array.
3. Run `npm install` to make sure `eslint-config-prettier` is installed.

```sh
# Verify both pass without conflicts
npm run format
npm run lint
```

---

## JSDoc build errors

### Missing tags or types

JSDoc warnings are not fatal but indicate incomplete documentation.

```sh
# Build and look for warnings
npm run docs:api
```

Common fixes:

- Use `@param {string} name` not `@param name`.
- Use `/** */` comments, not `//`.
- Spell tags correctly: `@returns` not `@retuns`.

---

## Git issues

### `Author identity unknown`

Git doesn't know who you are:

```sh
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Push rejected / branch behind

Your local branch is behind the remote:

```sh
# If your branch is behind, pull first
git pull origin your-branch-name

# If develop has moved ahead, merge it in
git checkout your-branch-name
git merge origin/develop
```

### Merge conflicts

1. Open the files listed in the conflict message.
2. Look for conflict markers:
   ```
   <<<<<<< HEAD
   your changes
   =======
   their changes
   >>>>>>> develop
   ```
3. Edit the file to keep the correct code. Remove all markers.
4. Stage and commit:

```sh
git add resolved-file.js
git commit -m "Resolve merge conflicts"
```

**Tip:** For conflicts in `package-lock.json`, delete it and regenerate:

```sh
rm package-lock.json
npm install
git add package-lock.json
```

---

## "Works locally but not in CI"

Common causes:

| Cause                                     | Fix                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| Forgot to commit formatted files          | Run `npm run format`, commit, push                                        |
| Different Node version                    | Check the CI config for the Node version. Match it locally with `nvm use` |
| Missing `npm install` step in CI          | Make sure the CI pipeline runs `npm install` before lint/format checks    |
| Cached `node_modules` in CI               | Clear the CI cache and re-run                                             |
| New dependency not in `package-lock.json` | Run `npm install` locally, commit `package-lock.json`                     |

## Verification commands

```sh
# Full project health check — run all of these in order
npm install
npm run lint
npm run format:check
```

If all three pass, your local environment is in good shape.
