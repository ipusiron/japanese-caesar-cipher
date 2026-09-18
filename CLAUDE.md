# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Japanese Caesar Cipher tool for encrypting/decrypting hiragana characters. Part of "100-day AI security tools challenge" (Day 4). Educational tool demonstrating classical cryptography - not suitable for protecting sensitive information.

## Architecture

- **Static web application**: HTML + external CSS/JS files, no build process
- **Vanilla JavaScript**: ES6+ with class-based architecture (`JapaneseCaesarCipher` class in `script.js`)
- **Self-contained**: No external dependencies

### File Structure

- `index.html` - HTML structure with form controls and layout
- `cipher.js` - DOM-independent cipher logic, shared by classic scripts and CommonJS tests
- `script.js` - Input handling and DOM manipulation in the JapaneseCaesarCipher class
- `style.css` - Styling with CSS custom properties, responsive design, dark mode support
- `assets/` - Three README screenshots (light, decryption table, dark)
- `test/` - Cipher, README, HTML, contrast, and formatting tests
- `package.json` - Dependency-free npm test command
- `.github/workflows/test.yml` - Node.js 22 tests on push and pull_request

### Core Components

**Character Sets** (in `cipher.js`):
- `AIUEO`: Standard hiragana ordering (46 characters)
- `IROHA`: Traditional iroha poem ordering (47 unique characters + ん)
- Custom ordering: User-defined character sequences

**Key Methods**:
- `normalizeKey()` - Normalize any integer key modulo the alphabet length
- `parseOrder()` - Validate NFC-normalized custom characters by code point
- `shiftText()` - Encrypt/decrypt NFC-normalized text, preserving characters outside the alphabet
- `buildTable()` - Build input/output character pairs
- `countStats()` - Count total, target, and other code points after NFC normalization

## Development Commands

```bash
# Serve locally (Python 3)
python -m http.server 8000

# Serve locally (Python 2)
python -m SimpleHTTPServer 8000

# Or open index.html directly in browser
```

## Testing

Run `npm test` (Node.js 22 or later, `node --test`). No npm dependencies. Key test areas:
1. Encryption/decryption modes with all character orderings (aiueo, iroha, custom)
2. Known answers, round trips, input preservation, and custom ordering validation
3. Keyboard shortcut: `Ctrl+Enter` / `Cmd+Enter` (execute from input, key, or custom order)
4. Responsive layout and dark mode
5. README examples, metadata, character sets and images; HTML, contrast, and formatting

Keep source files readable: two-space indentation, JSDoc and class method order.
Use classic scripts rather than ES modules so file:// remains supported.

## Security Notes

- Values are inserted only with textContent and value, never as HTML
- Do not rewrite input/custom order values (except the explicit Clear action)
- Keep the meta CSP and no-referrer policy; no network calls, localStorage, or cookies
- Character patterns remain visible (frequency analysis possible)
- HTML maxlength: input 100,000 and custom order 1,000 UTF-16 code units
- UI key limits: aiueo 0-45, iroha 0-47, custom 0-(code point count-1)
