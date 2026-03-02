// build.js
import { promises as fs } from "node:fs";
import path from "node:path";

const DIST_DIR = "dist";

// Add whatever your extension actually needs at runtime:
const COPY_TARGETS = [
  "manifest.json",
  "popup.html",
  "popup.js",
  "icon.png",
  "icons",        // folder (recommended)
  "assets",       // folder (if you have one)
  "styles",       // folder (if you have one)
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  // file
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function cleanDist() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });
}

async function main() {
  await cleanDist();

  const copied = [];
  const missing = [];

  for (const target of COPY_TARGETS) {
    if (await exists(target)) {
      await copyRecursive(target, path.join(DIST_DIR, target));
      copied.push(target);
    } else {
      missing.push(target);
    }
  }

  console.log(`Build complete. Copied: ${copied.join(", ") || "(none)"}`);
  if (missing.length) {
    console.log(`Note: Not found (skipped): ${missing.join(", ")}`);
  }
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});