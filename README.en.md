# Japanese Caesar Cipher

English · [日本語](README.md)

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/japanese-caesar-cipher?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/japanese-caesar-cipher?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/japanese-caesar-cipher)
![GitHub license](https://img.shields.io/github/license/ipusiron/japanese-caesar-cipher)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/japanese-caesar-cipher/)

**Day004 - 100 Security Tools with Generative AI**

A Caesar cipher that shifts **Japanese kana** instead of the Latin alphabet.

The Latin version has 26 letters in one obvious order. Japanese does not: the kana can be ordered in at least two traditional ways, and they contain 46 or 48 characters depending on which you pick. That choice becomes part of the cipher.

---

## 🌐 Demo

👉 [https://ipusiron.github.io/japanese-caesar-cipher/](https://ipusiron.github.io/japanese-caesar-cipher/)

---

## ✨ What it does

- **Three orders** — *aiueo* (46 characters), *iroha* (48), or one you type yourself
- **Encrypt and decrypt** with a key of your choosing
- **A substitution table** showing what maps to what; the headings swap when you decrypt
- **Counts** — total characters, how many will be shifted, how many will not
- **Copy the result** to the clipboard
- **Dark mode**, following your OS
- **Several lines at once**
- **Everything else is left alone** — kanji, katakana, punctuation and spaces pass through unchanged
- **Japanese and English** — the button at the top right, `?lang=en`, or your browser's setting

Nothing is installed and nothing is uploaded.

---

## 📖 How to use it

1. Choose **Encrypt** or **Decrypt**.
2. Choose the order: *aiueo*, *iroha*, or your own.
3. If you chose your own, type the characters to use, with no repeats.
4. Enter a key between 0 and (number of characters − 1).
5. Type your text and press **Run**. Ctrl+Enter (⌘+Enter on a Mac) works in the text, key and order fields.
6. Press **Copy the result**. If copying fails, the output is selected for you to copy by hand.

### Examples

| Input | Order | Key | Mode | Result |
| --- | --- | ---: | --- | --- |
| `こんにちは` | aiueo | 3 | encrypt | `すうのとへ` |
| `すうのとへ` | aiueo | 3 | decrypt | `こんにちは` |
| `わをん` | aiueo | 3 | encrypt | `あいう` |
| `いろはにほへと` | iroha | 1 | encrypt | `ろはにほへとち` |
| `がっこうへ いく。` | aiueo | 3 | encrypt | `がっすかみ おさ。` |
| `あかさ` | your own: `あかさたなはまやらわ` | 1 | encrypt | `かさた` |

Look at the fifth row. `が`, `っ` and `。` come through untouched, because none of them is in the *aiueo* list — only `こ`, `う`, `へ`, `い` and `く` move. **That is the weakness of this cipher in Japanese**, and the table makes it visible.

---

## 🔬 How it works

Number the positions in the order from 0. With plaintext position *p*, ciphertext position *c*, key *k* and character count *n*:

- encrypt: `c = (p + k) mod n`
- decrypt: `p = (c − k) mod n`

### The character sets

| Order | Count | Characters |
| --- | ---: | --- |
| aiueo | 46 | `あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん` |
| iroha | 48 | `いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん` |

*Iroha* is the 47 characters of the classical [Iroha poem](https://en.wikipedia.org/wiki/Iroha) — which uses every kana exactly once, including the now-obsolete `ゐ` and `ゑ` — plus `ん` at the end. The *aiueo* order has no `ゐ` or `ゑ`, so those two pass through unchanged there.

The key runs from 0 to *n* − 1, and 0 changes nothing. **That leaves 45 useful keys (47 for iroha), so brute force breaks it immediately.** Internally, negative keys and keys larger than the character count are normalised into the same range.

Input and custom orders are normalised with Unicode NFC before processing, so `か` followed by a combining dakuten is treated as `が` — though the text in the box is left as you typed it. Counts are per code point after normalisation, and a newline or an emoji counts as one character.

---

## ⚠️ What this cipher does not hide

- **Only kana move.** Kanji, katakana, punctuation and spaces stay exactly where they are
- If you want dakuten, small kana or the long vowel mark shifted too, define your own order
- **Because everything else is preserved, the shape of the sentence survives** — word boundaries and phrase breaks can give the content away even when the kana are scrambled

This is a teaching tool. Do not use it to protect anything.

---

## 🧪 Tests

```bash
npm test
```

Node's own test runner. No dependencies. GitHub Actions runs the same tests on every push and pull request.

The tests cover the cipher itself, the examples in the Japanese README (they are recomputed and checked), the character sets, contrast ratios, line lengths, static properties of the HTML, and the Japanese and English dictionaries — that they hold the same keys, that the placeholders match, and that no Japanese is left untranslated in the English side.

Two exceptions are deliberate: the language button shows the *other* language, and the example character order stays in kana, because that is what this tool operates on.

---

## 🎯 Use cases

### Ways of using this tool in particular

- Confirming that shifting by the length of the character set returns to the start (modular and period classes): in the gojuon (46 characters), shifting a by 1 gives i, and shifting by 46 returns to the start. Going once around the ring of characters returns to the start, so the shift is decided by the remainder modulo the length of the set. You can confirm, on the kana order, the same idea as the 26-letter Caesar cipher
- Confirming that a different character set changes the period (modular classes): the gojuon has 46 characters and the iroha order has 48, so the rings differ in length. Shifting the iroha "iroha" by 48 returns to the start, but shifting by 46 does not. You can confirm that the same shift gives a different result depending on the length of the set
- Confirming that only the target characters shift (character-kind classes): shifting "aiu" plus "abc" by the gojuon shifts only the 3 kana, while the 3 Latin letters are out of scope (3 target, 3 other). You can confirm, by the counts, that only characters in the set shift and the rest stay as they are

### General uses

- Learn how a Caesar cipher works in Japanese, on the gojuon or iroha order
- Make a simple cipher that shifts kana for puzzles and games
- Use it as material to show the same modular idea works on a non-Latin character set

## 🔒 Privacy

Nothing is sent anywhere, and nothing you type is stored. The only things kept in `localStorage` are your theme and your language. The page carries a Content Security Policy and a `no-referrer` referrer policy.

---

## 📁 Layout

```text
japanese-caesar-cipher/
├── .github/workflows/     # CI
├── assets/                # screenshots
├── test/
│   ├── cipher.test.js     # the cipher
│   ├── contrast.test.js   # contrast ratios
│   ├── format.test.js     # line lengths
│   ├── html.test.js       # static checks on the HTML
│   ├── i18n.test.js       # the Japanese and English dictionaries
│   └── readme.test.js     # the examples and character sets in the README
├── cipher.js              # the cipher, with no DOM
├── i18n.js                # Japanese and English text
├── index.html
├── script.js
└── style.css
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

## 🛠️ About this project

This tool is part of **100 Security Tools with Generative AI**, in which one security-related tool is built and published each day with the help of generative AI.

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
