# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese Caesar Cipher tool that encrypts and decrypts Japanese hiragana characters. It's a single-page web application built with vanilla HTML, CSS, and JavaScript, designed for educational purposes as part of a "100-day AI security tools challenge" (Day 4).

## Architecture

- **Single-page application**: All code is embedded in `index.html`
- **No build process**: Direct browser execution without compilation
- **Vanilla JavaScript**: Uses ES6+ module syntax with class-based architecture
- **CSS Grid/Flexbox layout**: Modern responsive design with CSS custom properties
- **Self-contained**: No external dependencies or build tools

## Key Components

### Core JavaScript Class
- `JapaneseCaesarCipher`: Main application class handling encryption/decryption logic
- Located in `index.html` starting at line 394
- Handles three character orderings: あいうえお順 (aiueo), いろは順 (iroha), and custom ordering

### Character Sets
- `AIUEO`: Standard hiragana ordering (50 characters)
- `IROHA`: Traditional iroha poem ordering (47 unique characters + ん)
- Custom ordering: User-defined character sequences

### Security Features
- Input sanitization with `sanitizeInput()` method
- XSS prevention through HTML escaping
- Character validation for custom ordering
- Input length limits and dangerous pattern filtering

## Development Commands

Since this is a static web application:

```bash
# Serve locally (Python 3)
python -m http.server 8000

# Serve locally (Python 2)
python -SimpleHTTPServer 8000

# Open directly in browser
open index.html
```

## File Structure

- `index.html`: Complete application with embedded CSS and JavaScript
- `style.css`: Additional external stylesheets (currently empty/minimal)
- `README.md`: Project documentation in Japanese
- `LICENSE`: MIT license

## Code Style Conventions

- ES6+ JavaScript with JSDoc type annotations
- CSS custom properties for theming
- Semantic HTML with ARIA accessibility
- Responsive design with mobile-first approach
- Error handling with user-friendly Japanese messages

## Testing

No automated testing framework is configured. Testing should be done manually by:
1. Testing different encryption/decryption modes
2. Validating all three character ordering systems
3. Testing input sanitization with malicious inputs
4. Verifying keyboard shortcuts (Ctrl+Enter, Ctrl+L, Ctrl+Shift+C)
5. Testing responsive layout on different screen sizes

## Security Considerations

- This is an educational tool demonstrating classical cryptography
- Not suitable for protecting sensitive information
- Input sanitization prevents XSS but doesn't provide cryptographic security
- Character patterns remain visible, making frequency analysis possible