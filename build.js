const fs = require('fs');
const path = require('path');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy manifest.json
if (fs.existsSync('manifest.json')) {
  fs.copyFileSync('manifest.json', path.join(distDir, 'manifest.json'));
  console.log(' Copied manifest.json');
}

// Copy other files as needed
// Add more logic here as your extension grows

console.log('Build completed successfully!');