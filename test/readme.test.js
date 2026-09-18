const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { AIUEO, IROHA, parseOrder, shiftText } = require('../cipher.js');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

test('READMEの使い方の例6行が暗号ロジックと一致', () => {
  const section = readme.split('### 使い方の例')[1]?.split('\n##')[0];
  assert.ok(section, '使い方の例セクションが必要');
  const rows = [...section.matchAll(/^\| `([^`]*)` \| (.*?) \| (\d+) \| (暗号化|復号) \| `([^`]*)` \|$/gm)];
  assert.equal(rows.length, 6);
  for (const [, input, order, key, mode, expected] of rows) {
    let chars;
    if (order === 'あいうえお順') chars = AIUEO;
    else if (order === 'いろは順') chars = IROHA;
    else {
      const match = order.match(/^任意: `([^`]+)`$/);
      assert.ok(match, `不明な並び順: ${order}`);
      const parsed = parseOrder(match[1]);
      assert.ok(parsed.ok, order);
      chars = parsed.chars;
    }
    assert.equal(shiftText(input, chars, Number(key), { decrypt: mode === '復号' }), expected, input);
  }
});

test('READMEの文字セット2行は文字数・全文字が一致', () => {
  const rows = [...readme.matchAll(/^\| (あいうえお順|いろは順) \| (\d+) \| `([^`]+)` \|$/gm)];
  assert.equal(rows.length, 2);
  for (const [, name, length, text] of rows) {
    const chars = name === 'あいうえお順' ? AIUEO : IROHA;
    assert.equal(Number(length), chars.length);
    assert.equal(text, chars.join(''));
  }
});

test('READMEの相対画像参照がすべて実在する', () => {
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
  assert.ok(images.length >= 5, 'バッジを含む画像参照が必要');
  const local = images.map(match => match[1]).filter(url => !/^https?:\/\//.test(url));
  for (const filename of local) assert.ok(fs.existsSync(path.join(root, filename)), filename);
  if (readme.includes('## 📸 スクリーンショット')) {
    assert.deepEqual(local, ['assets/screenshot.png', 'assets/screenshot2.png', 'assets/screenshot3.png']);
  }
});

test('READMEのYAMLはHTMLコメント内のブロック形式と識別値を保持', () => {
  const match = readme.match(/^<!--\r?\n---\r?\n([\s\S]*?)\r?\n---\r?\n-->/);
  assert.ok(match, 'HTMLコメントとYAMLの境界が必要');
  const yaml = match[1];
  for (const key of ['category_ja', 'category_en', 'tags']) {
    assert.match(yaml, new RegExp(`^${key}:\\r?\\n  - `, 'm'));
  }
  const values = {
    id: 'day004', slug: 'japanese-caesar-cipher',
    repo_url: 'https://github.com/ipusiron/japanese-caesar-cipher',
    demo_url: 'https://ipusiron.github.io/japanese-caesar-cipher/', hub: 'true'
  };
  for (const [key, expected] of Object.entries(values)) {
    const value = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].replace(/^"|"$/g, '');
    assert.equal(value, expected, key);
  }
});
