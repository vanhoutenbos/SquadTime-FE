const fs = require('fs');
const path = require('path');
const base = 'src';
const files = [];
function walk(d) {
  for (const f of fs.readdirSync(d, {withFileTypes: true})) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.ts') || f.name.endsWith('.tsx')) files.push(p);
  }
}
walk(base);
const importRe = /import\s+.*?from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
let bad = [];
for (const f of files) {
  const re = new RegExp(importRe.source, 'g');
  const txt = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = re.exec(txt))) {
    let imp = m[1];
    const resolved = path.resolve(path.dirname(f), imp);
    const tries = imp.endsWith('.ts') || imp.endsWith('.tsx')
      ? [resolved]
      : [resolved + '.ts', resolved + '.tsx', resolved + '.js', resolved + '/index.ts', resolved + '/index.tsx'];
    let found = null;
    for (const t of tries) { if (fs.existsSync(t)) { found = t; break; } }
    if (!found) { bad.push(f + ': missing -> ' + imp); continue; }
    const baseName = imp.replace(/.*\//, '');
    if (baseName && !baseName.includes('.')) {
      const dirPath = path.resolve(path.dirname(f), path.dirname(imp));
      const entry = fs.readdirSync(dirPath).find(x => x.toLowerCase() === baseName.toLowerCase());
      if (entry && entry !== baseName) bad.push(f + ': case mismatch: imported ' + baseName + ' but file is ' + entry);
    }
  }
}
if (bad.length === 0) console.log('NO case mismatches found');
else bad.forEach(x => console.log('  ' + x));
