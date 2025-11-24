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
- `script.js` - Main application logic (encryption/decryption, input handling, DOM manipulation)
- `style.css` - Styling with CSS custom properties, responsive design, dark mode support

### Core Components

**Character Sets** (in `script.js`):
- `AIUEO`: Standard hiragana ordering (50 characters)
- `IROHA`: Traditional iroha poem ordering (47 unique characters + ん)
- Custom ordering: User-defined character sequences

**Key Methods**:
- `sanitizeInput()` - XSS prevention, input validation, dangerous pattern filtering
- `transformCharacter()` - Core cipher logic
- `processText()` - Main encryption/decryption handler
- `validateCustomOrder()` - Custom character set validation

## Development Commands

```bash
# Serve locally (Python 3)
python -m http.server 8000

# Serve locally (Python 2)
python -m SimpleHTTPServer 8000

# Or open index.html directly in browser
```

## Testing

Manual testing - no automated framework. Key test areas:
1. Encryption/decryption modes with all character orderings (aiueo, iroha, custom)
2. Input sanitization with XSS payloads
3. Keyboard shortcuts: `Ctrl+Enter` (execute), `Ctrl+L` (clear), `Ctrl+Shift+C` (copy)
4. Responsive layout and dark mode

## Security Notes

- Input sanitization prevents XSS but provides no cryptographic security
- Character patterns remain visible (frequency analysis possible)
- Input length limited to 10,000 characters by default
