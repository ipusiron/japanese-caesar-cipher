(function () {
  'use strict';

  const AIUEO = Object.freeze([...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん']);
  const IROHA = Object.freeze([...'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん']);

  function normalizeKey(key, length) {
    const numericKey = Number(key);
    if (!Number.isInteger(numericKey) || !Number.isInteger(length) || length <= 0) return 0;
    return ((numericKey % length) + length) % length;
  }

  function parseOrder(value) {
    if (typeof value !== 'string') return { ok: false, code: 'EMPTY', chars: [] };
    const normalized = value.normalize('NFC').trim();
    const chars = [...normalized];
    if (chars.length === 0) return { ok: false, code: 'EMPTY', chars: [] };
    if (chars.length === 1) return { ok: false, code: 'TOO_SHORT', chars };
    if (/\s/u.test(normalized)) return { ok: false, code: 'WHITESPACE', chars };
    if (/[\u0000-\u001F\u007F]/u.test(normalized)) return { ok: false, code: 'CONTROL', chars };
    if (new Set(chars).size !== chars.length) return { ok: false, code: 'DUPLICATE', chars };
    return { ok: true, code: null, chars };
  }

  function shiftText(text, chars, key, options = {}) {
    const source = String(text).normalize('NFC');
    const length = chars.length;
    if (length === 0) return source;
    const normalizedKey = normalizeKey(key, length);
    const shift = options.decrypt ? (length - normalizedKey) % length : normalizedKey;
    const mapping = new Map(chars.map((character, index) => [character, chars[(index + shift) % length]]));
    return [...source].map((character) => mapping.get(character) ?? character).join('');
  }

  function buildTable(chars, key, options = {}) {
    const length = chars.length;
    const normalizedKey = normalizeKey(key, length);
    const shift = options.decrypt ? (length - normalizedKey) % length : normalizedKey;
    return chars.map((character, index) => [character, chars[(index + shift) % length]]);
  }

  function countStats(text, chars) {
    const source = String(text).normalize('NFC');
    const set = new Set(chars);
    const total = [...source].length;
    const target = [...source].filter((character) => set.has(character)).length;
    return { total, target, other: total - target };
  }

  const JapaneseCaesar = { AIUEO, IROHA, normalizeKey, parseOrder, shiftText, buildTable, countStats };
  globalThis.JapaneseCaesar = JapaneseCaesar;
  if (typeof module === 'object' && module.exports) module.exports = JapaneseCaesar;
}());
