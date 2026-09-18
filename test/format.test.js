const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const files = ['cipher.js', 'script.js', 'style.css', 'index.html'];
files.push(...fs.readdirSync(__dirname).filter(name => name.endsWith('.js')).map(name => `test/${name}`));

for (const file of files) {
  test(`整形: ${file}の最長行と行数`, () => {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').trimEnd().split(/\r?\n/);
    const limit = file === 'index.html' ? 250 : 160;
    for (const [index, line] of lines.entries()) {
      assert.ok([...line].length <= limit, `${file}:${index + 1} = ${[...line].length}文字（上限${limit}）`);
    }
    if (file === 'script.js') assert.ok(lines.length >= 100);
    if (file === 'style.css') assert.ok(lines.length >= 200);
  });
}
