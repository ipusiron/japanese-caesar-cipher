const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

test('HTML: viewport・CSP・referrer・noscript', () => {
  assert.match(html, /<meta\b[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1\.0"/);
  const csp = html.match(/<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/);
  assert.ok(csp);
  assert.match(csp[1], /script-src 'self'/);
  assert.ok(!csp[1].includes('frame-ancestors'));
  assert.ok(!csp[1].includes("'unsafe-inline'"));
  assert.match(html, /<meta\b[^>]*name="referrer"[^>]*content="no-referrer"/);
  assert.match(html, /<noscript>.*JavaScript.*<\/noscript>/);
});

test('HTML: 古典スクリプトの読込順・インラインコード禁止', () => {
  const scripts = html.match(/<script\b[^>]*>/g) || [];
  assert.equal(scripts.length, 2);
  assert.ok(scripts.every(tag => !/type\s*=\s*["']module["']/.test(tag)));
  assert.ok(html.indexOf('<script src="cipher.js">') >= 0);
  assert.ok(html.indexOf('<script src="cipher.js">') < html.indexOf('<script src="script.js">'));
  assert.ok(!/\son\w+\s*=/i.test(html));
  assert.ok(!/\sstyle\s*=/i.test(html));
});

test('HTML: すべてのlabelの参照先と入力属性', () => {
  const labels = [...html.matchAll(/<label\b[^>]*for="([^"]+)"/g)];
  assert.ok(labels.length >= 6);
  for (const [, id] of labels) assert.ok(html.includes(`id="${id}"`), id);
  const key = html.match(/<input\b[^>]*id="key"[^>]*>/)?.[0];
  assert.ok(key);
  assert.match(key, /min="0"/);
  assert.match(key, /step="1"/);
  assert.match(html, /<textarea\b[^>]*id="input"[^>]*maxlength="100000"/);
  assert.match(html, /<input\b[^>]*id="customOrder"[^>]*maxlength="1000"/);
});

test('HTML: 通知・表見出し・カード見出し', () => {
  assert.match(html, /<div\b[^>]*id="errorMessage"[^>]*role="alert"/);
  assert.match(html, /<div\b[^>]*id="statusMessage"[^>]*role="status"[^>]*aria-live="polite"/);
  const headers = html.match(/<th\b[^>]*>/g) || [];
  assert.equal(headers.length, 2);
  assert.ok(headers.every(tag => tag.includes('scope="col"')));
  assert.match(html, /<caption class="visually-hidden">/);
  assert.ok((html.match(/<h2\b/g) || []).length >= 4);
});

for (const forbidden of ['innerHTML', 'execCommand', 'console.log', 'sanitizeInput', '.style.']) {
  test(`DOM処理は${forbidden}を含まない`, () => assert.ok(!script.includes(forbidden)));
}
