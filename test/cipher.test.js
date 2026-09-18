const test = require('node:test');
const assert = require('node:assert/strict');
const { AIUEO, IROHA, normalizeKey, parseOrder, shiftText, buildTable, countStats } = require('../cipher.js');

const knownAnswers = [
  ['あいうえお・挨拶', AIUEO, 3, false, 'こんにちは', 'すうのとへ'],
  ['あいうえお・句読点', AIUEO, 3, false, 'こんにちは、せかい。', 'すうのとへ、ちけお。'],
  ['句読点の復号', AIUEO, 3, true, 'すうのとへ、ちけお。', 'こんにちは、せかい。'],
  ['末尾から先頭', AIUEO, 3, false, 'わをん', 'あいう'],
  ['先頭から末尾', AIUEO, 3, true, 'あいう', 'わをん'],
  ['鍵0', AIUEO, 0, false, 'こんにちは', 'こんにちは'],
  ['鍵45', AIUEO, 45, false, 'こんにちは', 'けをなたの'],
  ['いろは・鍵1', IROHA, 1, false, 'いろはにほへと', 'ろはにほへとち'],
  ['いろは・回り込み', IROHA, 2, false, 'せすん', 'んいろ'],
  ['いろは・鍵5', IROHA, 5, false, 'いろは', 'へとち'],
  ['いろは・復号', IROHA, 5, true, 'へとち', 'いろは'],
  ['いろは・先頭の復号', IROHA, 5, true, 'いろは', 'ひもせ'],
  ['対象外の保持', AIUEO, 3, false, 'がっこうへ いく。ABC123 カタカナ 漢字', 'がっすかみ おさ。ABC123 カタカナ 漢字'],
  ['あいうえお・ゐゑ', AIUEO, 3, false, 'ゐゑ', 'ゐゑ'],
  ['いろは・ゐゑ', IROHA, 3, false, 'ゐゑ', 'くせ'],
  ['改行', AIUEO, 3, false, 'あ\nい', 'え\nお'],
  ['欠落回帰・鍵47', AIUEO, 47, true, 'あいう', 'んあい'],
  ['欠落回帰・鍵49', IROHA, 49, true, 'い', 'ん'],
  ['NFDの濁点', AIUEO, 3, false, 'か\u3099', 'が'],
  ['旧エスケープ対象', AIUEO, 3, false, `a&b<c>"d'e/f data: onload=x`, `a&b<c>"d'e/f data: onload=x`],
  ['空文字', AIUEO, 3, false, '', ''],
  ['任意・暗号化', [...'あかさたなはまやらわ'], 1, false, 'あかさ わ', 'かさた あ'],
  ['任意・復号', [...'あかさたなはまやらわ'], 1, true, 'かさた あ', 'あかさ わ'],
  ['任意・絵文字', [...'あ😀い'], 1, false, 'あ😀い', '😀いあ'],
  ['任意・NFD', [...'がぎぐげご'], 1, false, 'か\u3099き\u3099', 'ぎぐ']
];

for (const [name, chars, key, decrypt, input, expected] of knownAnswers) {
  test(`既知解答: ${name}`, () => {
    assert.equal(shiftText(input, chars, key, { decrypt }), expected);
  });
}

test('文字セットは46/48文字・重複なし・末尾ん・いろは固有はゐゑ', () => {
  assert.equal(AIUEO.length, 46);
  assert.equal(IROHA.length, 48);
  for (const chars of [AIUEO, IROHA]) {
    assert.equal(new Set(chars).size, chars.length);
    assert.equal(chars.at(-1), 'ん');
    assert.ok(Object.isFrozen(chars));
  }
  assert.deepEqual(IROHA.filter(char => !AIUEO.includes(char)), ['ゐ', 'ゑ']);
});

const invalidOrders = [
  ['非文字列', null, 'EMPTY'], ['空', '', 'EMPTY'], ['空白のみ', '   ', 'EMPTY'],
  ['1文字', 'あ', 'TOO_SHORT'], ['重複', 'ああ', 'DUPLICATE'],
  ['半角空白', 'あ い', 'WHITESPACE'], ['全角空白', 'あ　い', 'WHITESPACE'],
  ['タブ', 'あ\tい', 'WHITESPACE'], ['改行', 'あ\nい', 'WHITESPACE'],
  ['制御文字', 'あ\u0001い', 'CONTROL'], ['DEL', 'あ\u007fい', 'CONTROL'],
  ['NFC後の重複', 'か\u3099が', 'DUPLICATE']
];
for (const [name, value, code] of invalidOrders) {
  test(`parseOrder: ${name}は${code}`, () => {
    const result = parseOrder(value);
    assert.equal(result.ok, false);
    assert.equal(result.code, code);
    assert.ok(Array.isArray(result.chars));
  });
}
test('parseOrder: 前後の空白・絵文字・NFCを扱う', () => {
  assert.deepEqual(parseOrder('  あい  '), { ok: true, code: null, chars: ['あ', 'い'] });
  assert.deepEqual(parseOrder('あ😀い'), { ok: true, code: null, chars: ['あ', '😀', 'い'] });
  assert.deepEqual(parseOrder('か\u3099き\u3099'), { ok: true, code: null, chars: ['が', 'ぎ'] });
});

const keys = [
  [-1, 46, 45], [46, 46, 0], [49, 46, 3], [-47, 46, 45], [100, 48, 4],
  ['7', 46, 7], [3.5, 46, 0], ['abc', 46, 0], [NaN, 46, 0], [3, 0, 0],
  [3, -1, 0], [3, 2.5, 0], [Infinity, 46, 0]
];
for (const [key, length, expected] of keys) {
  test(`normalizeKey(${key}, ${length}) = ${expected}`, () => {
    assert.equal(normalizeKey(key, length), expected);
  });
}

test('countStats: 句読点・絵文字・改行・NFCをコードポイントで数える', () => {
  assert.deepEqual(countStats('こんにちは、せかい。', AIUEO), { total: 10, target: 8, other: 2 });
  assert.deepEqual(countStats('あ😀\nい', AIUEO), { total: 4, target: 2, other: 2 });
  assert.deepEqual(countStats('か\u3099', AIUEO), { total: 1, target: 0, other: 1 });
});

test('buildTable: 暗号化の先頭・末尾と復号の先頭', () => {
  const table = buildTable(AIUEO, 3);
  assert.equal(table.length, 46);
  assert.deepEqual(table.slice(0, 3), [['あ', 'え'], ['い', 'お'], ['う', 'か']]);
  assert.deepEqual(table.slice(-3), [['わ', 'あ'], ['を', 'い'], ['ん', 'う']]);
  assert.deepEqual(buildTable(AIUEO, 3, { decrypt: true }).slice(0, 3), [['あ', 'わ'], ['い', 'を'], ['う', 'ん']]);
});

const source = AIUEO.join('') + IROHA.join('') + '、。ABC漢字カタカナ😀\n';
const alphabets = [AIUEO, IROHA, [...'あかさたなはまやらわ'], [...'あ😀い']];
for (const [index, chars] of alphabets.entries()) {
  test(`文字セット${index + 1}: 鍵-100〜100の往復と相補鍵`, () => {
    for (let key = -100; key <= 100; key++) {
      const encrypted = shiftText(source, chars, key);
      assert.equal(shiftText(encrypted, chars, key, { decrypt: true }), source, `往復 key=${key}`);
      assert.equal(
        shiftText(source, chars, key, { decrypt: true }),
        shiftText(source, chars, chars.length - normalizeKey(key, chars.length)),
        `相補鍵 key=${key}`
      );
    }
  });
  test(`文字セット${index + 1}: 復号の鍵0〜200で文字を欠落させない`, () => {
    for (let key = 0; key <= 200; key++) {
      const output = shiftText(source, chars, key, { decrypt: true });
      assert.equal([...output].length, [...source].length, `文字数 key=${key}`);
      assert.ok(!output.includes('undefined'), `undefined key=${key}`);
    }
  });
}
