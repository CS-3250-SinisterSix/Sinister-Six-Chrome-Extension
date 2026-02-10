# Project Setup

## Purpose

Get the project running on your machine from a fresh clone.

## Steps

### 1. Prerequisites

- **Node.js** v18 or later (check with `node -v`)
- **npm** v9 or later (ships with Node, check with `npm -v`)
- **Git**

### 2. Clone the repo

```sh
git clone https://github.com/CS-3250-SinisterSix/Sinister-Six-Chrome-Extension.git
cd Sinister-Six-Chrome-Extension
```

### 3. Install dependencies

```sh
npm install
```

### 4. Load the extension in Chrome

1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the repo root folder (or the folder containing `manifest.json`).
5. The extension icon should appear in the toolbar.

### 5. Common commands

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm install`          | Install all dependencies         |
| `npm run lint`         | Check code for errors            |
| `npm run lint:fix`     | Auto-fix lint errors             |
| `npm run format`       | Auto-format all files            |
| `npm run format:check` | Check formatting without writing |

## Verification commands

```sh
# Confirm Node and npm are available
node -v
npm -v

# Install dependencies
npm install

# Run all checks
npm run lint
npm run format:check
```

## Common issues

| Problem                                    | Fix                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `npm: command not found`                   | Install Node.js from https://nodejs.org                                            |
| `node -v` shows v16 or lower               | Upgrade Node to v18+ (use [nvm](https://github.com/nvm-sh/nvm) to manage versions) |
| `npm install` fails with permission errors | Don't use `sudo`. Fix npm permissions or use nvm                                   |
| Extension doesn't appear in Chrome         | Make sure Developer mode is on and you selected the correct folder                 |
