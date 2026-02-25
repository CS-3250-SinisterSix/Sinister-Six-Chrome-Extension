import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// Create dist directory

const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir);
}

// Copy manifest.json
if (existsSync('manifest.json')) {
  copyFileSync('manifest.json', join(distDir, 'manifest.json'));
  console.log(' Copied manifest.json');
}

// Copy other files as needed
// Add more logic here as your extension grows

console.log('Build completed successfully!');
