const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');

function variables(block) {
  assert.ok(block, 'CSS変数ブロックが必要');
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
}
const light = variables(css.match(/:root\s*\{([^}]+)\}/)?.[1]);
const darkBlock = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]+)\}/)?.[1];
const dark = { ...light, ...variables(darkBlock) };

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i, '色は#rrggbbで定義する');
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
const pairs = [
  ['primary-text', 'white'], ['primary-text', 'gray-100'], ['on-primary', 'primary'],
  ['on-primary', 'primary-light'], ['gray-800', 'white'], ['gray-800', 'gray-100'],
  ['gray-800', 'gray-200'], ['gray-800', 'gray-300'], ['gray-800', 'gray-400'],
  ['gray-600', 'white'], ['gray-600', 'gray-100'], ['danger-text', 'danger-bg']
];
for (const [mode, palette] of [['light', light], ['dark', dark]]) {
  for (const [foreground, background] of pairs) {
    test(`コントラスト: ${mode} --${foreground} / --${background}`, () => {
      const a = luminance(palette[`--${foreground}`]);
      const b = luminance(palette[`--${background}`]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, `${ratio.toFixed(2)}:1（4.5:1以上が必要）`);
    });
  }
}
