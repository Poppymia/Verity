/**
 * Zips ../extension into public/verity-extension.zip for the marketing site download.
 */
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const repoRoot = path.join(__dirname, '..', '..');
const extensionDir = path.join(repoRoot, 'extension');
const publicDir = path.join(__dirname, '..', 'public');
const outPath = path.join(publicDir, 'verity-extension.zip');

if (!fs.existsSync(extensionDir)) {
  console.error('package-extension: extension folder not found at', extensionDir);
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });

const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('package-extension: wrote', outPath, `(${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(extensionDir, 'verity-extension');
archive.finalize();
