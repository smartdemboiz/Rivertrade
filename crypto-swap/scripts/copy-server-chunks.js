const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const serverDir = path.join(projectRoot, '.next', 'server');
const chunksDir = path.join(serverDir, 'chunks');

if (!fs.existsSync(chunksDir)) {
  console.log('No server chunks directory found, nothing to do.');
  process.exit(0);
}

const files = fs.readdirSync(chunksDir).filter((f) => f.endsWith('.js'));
let count = 0;
for (const f of files) {
  const target = path.join(serverDir, f);
  const rel = `./chunks/${f}`;
  const content = `module.exports = require('${rel}');\n`;
  try {
    fs.writeFileSync(target, content, { encoding: 'utf8' });
    count++;
  } catch (err) {
    console.error('Failed to write wrapper for', f, err);
  }
}
console.log(`Wrote ${count} server chunk wrapper(s) into ${serverDir}`);
