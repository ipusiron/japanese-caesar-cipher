const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const I18n = require(path.join(root, 'i18n.js'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

test('i18n: 日本語と英語でキーの集合が同じ', () => {
  const ja = Object.keys(I18n.ja);
  const en = Object.keys(I18n.en);
  assert.deepEqual(ja.filter(k => !(k in I18n.en)), [], '英語に無いキーがある');
  assert.deepEqual(en.filter(k => !(k in I18n.ja)), [], '日本語に無いキーがある');
  assert.ok(ja.length >= 50, `キーが少なすぎる: ${ja.length}`);
});

test('i18n: 差し込みの名前が日英で一致する', () => {
  const holes = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  assert.deepEqual(Object.keys(I18n.ja).filter(k => holes(I18n.ja[k]) !== holes(I18n.en[k])), []);
});

test('i18n: index.html が指すキーはすべて辞書にある', () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(m[1]);
  assert.ok(keys.size >= 25, `data-i18n が少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter(k => !(k in I18n.ja)), []);
});

test('i18n: script.js が呼ぶキーはすべて辞書にある', () => {
  const keys = new Set();
  for (const m of script.matchAll(/\bI18n\.t\(\s*'([\w.]+)'/g)) keys.add(m[1]);
  for (const m of script.matchAll(/(?<!I18n\.)\bt\(\s*'([\w.]+)'/g)) keys.add(m[1]);
  assert.ok(keys.size >= 15, `t() の呼び出しが少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter(k => !(k in I18n.ja)), []);
});

test('i18n: 英語の辞書に訳し忘れの日本語が残っていない', () => {
  const jp = /[぀-ヿ一-鿿]/;
  // 切り替えボタンは相手の言語を出すのが正しい。
  // 文字順序の例は、このツールが扱うのがひらがなである以上、英語表示でもひらがなでよい。
  const expected = new Set(['app.langButton', 'settings.customPlaceholder']);
  assert.deepEqual(Object.keys(I18n.en).filter(k => !expected.has(k) && jp.test(I18n.en[k])), []);
});

test('i18n: t() は差し込みを埋め、知らないキーで throw する', () => {
  assert.match(I18n.t('table.caption', { order: 'あいうえお順', key: 3, mode: '暗号化' }), /3/);
  assert.match(I18n.t('validate.keyMax', { max: 45, order: 'あいうえお順', count: 46 }), /45/);
  assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('i18n: script.js に画面用の日本語が残っていない', () => {
  // コメントとJSDocは対象外。文字列リテラルの中だけを見る
  const withoutComments = script
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const literals = [...withoutComments.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g)]
    .map(m => m[1] ?? m[2] ?? m[3])
    .filter(v => /[぀-ヿ一-鿿]/.test(v));
  assert.deepEqual(literals, [], `画面用の日本語が残っている: ${literals.join(' / ')}`);
});

test('i18n: ボタンの文言を定数で書き戻していない', () => {
  // 1秒タイマーで元の文言に戻す実装だと、その間に言語を変えたときに戻ってしまう。
  // 状態を dataset に持ち、文言は毎回 t() から組み立てる。
  assert.match(script, /dataset\.state/);
  assert.match(script, /setProcessButton\(/);
  assert.match(script, /setCopyButton\(/);
  assert.doesNotMatch(script, /processBtn\.textContent\s*=\s*['"]/);
  assert.doesNotMatch(script, /copyBtn\.textContent\s*=\s*['"]/);
});

test('i18n: 言語を変えたときに描き直す仕掛けがある', () => {
  assert.match(script, /languagechange/);
  assert.match(script, /retranslate\(/);
  assert.match(script, /I18n\.init\(\)/);
});

test('i18n: i18n.js を他のスクリプトより先に読み込む', () => {
  assert.ok(html.indexOf('<script src="i18n.js">') < html.indexOf('<script src="cipher.js">'));
  assert.ok(html.indexOf('<script src="cipher.js">') < html.indexOf('<script src="script.js">'));
});

test('i18n: 切り替えボタンの id は langToggle', () => {
  // 検証用のプローブがこの id を決め打ちで押す
  assert.match(html, /id="langToggle"/);
});

test('i18n: noscript は両方の言語を出す', () => {
  const m = html.match(/<noscript>([\s\S]*?)<\/noscript>/);
  assert.ok(m, 'noscript が無い');
  assert.match(m[1], /JavaScript/);
  assert.match(m[1], /[぀-ヿ一-鿿]/, 'JSが動かないと切り替えられないので日本語も要る');
});

test('i18n: 子要素を持つ要素に data-i18n を付けていない', () => {
  // apply() は textContent を置き換えるので、子要素があると消える
  const bad = [];
  for (const m of html.matchAll(/<(\w+)([^>]*\sdata-i18n="[^"]+"[^>]*)>([\s\S]*?)<\/\1>/g)) {
    if (m[3].includes('<')) bad.push(m[1] + ': ' + m[3].slice(0, 40));
  }
  assert.deepEqual(bad, []);
});

test('cipher.js のかな配列には触っていない', () => {
  // 扱う対象は言語を変えても変わらない。訳すのは画面の文言だけ
  const cipher = fs.readFileSync(path.join(root, 'cipher.js'), 'utf8');
  assert.match(cipher, /あいうえお/);
  assert.match(cipher, /いろはにほへと/);
});
