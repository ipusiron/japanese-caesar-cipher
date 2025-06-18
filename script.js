/**
 * 日本語シーザー暗号ツール - JavaScript
 * @version 1.0.0
 * @description 日本語のひらがな文字を対象としたシーザー暗号の実装
 */

// TypeScriptの型定義（JSDocコメントで型情報を表現）

/**
 * @typedef {'encrypt' | 'decrypt'} CipherMode
 * @typedef {'aiueo' | 'iroha' | 'custom'} CharacterOrder
 */

/**
 * 日本語シーザー暗号クラス
 */
class JapaneseCaesarCipher {
  /**
   * @type {readonly string[]}
   */
  static AIUEO = Object.freeze([..."あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん"]);
  
  /**
   * @type {readonly string[]}
   */
  static IROHA = Object.freeze([..."いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん"]);

  /**
   * DOM要素の参照
   * @private
   */
  constructor() {
    this.elements = this.initializeElements();
    this.setupEventListeners();
    this.toggleCustomOrderInput(); // 初期状態を設定
    this.updateCharacterCount(); // 初期文字数カウンターを設定
    this.updateTableOnInput();
  }

  /**
   * 入力値をサニタイズ
   * @param {string} input - サニタイズ対象の文字列
   * @param {Object} options - サニタイズオプション
   * @returns {string} サニタイズ済み文字列
   * @private
   */
  sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') {
      return '';
    }

    const {
      allowHTML = false,
      maxLength = 10000,
      allowedChars = null,
      trimWhitespace = true
    } = options;

    let sanitized = input;

    // 長さ制限
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      this.showWarning(`入力が${maxLength}文字に制限されました。`);
    }

    // 前後の空白文字を削除
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // HTMLタグのエスケープ
    if (!allowHTML) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // 危険なスクリプト関連文字列の除去
    const dangerousPatterns = [
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<script/gi,
      /<\/script>/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        this.showWarning('潜在的に危険な内容が除去されました。');
      }
    });

    // 特定文字のみ許可（カスタム文字順序用）
    if (allowedChars) {
      const allowedSet = new Set(allowedChars);
      sanitized = [...sanitized].filter(char => allowedSet.has(char)).join('');
    }

    // 制御文字の除去（タブ、改行、通常の空白は保持）
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  /**
   * 警告メッセージを表示
   * @param {string} message - 警告メッセージ
   * @private
   */
  showWarning(message) {
    // 既存の警告を削除
    const existingWarning = document.getElementById('warning-message');
    if (existingWarning) {
      existingWarning.remove();
    }

    // 警告メッセージを作成
    const warningDiv = document.createElement('div');
    warningDiv.id = 'warning-message';
    warningDiv.className = 'warning';
    warningDiv.textContent = `⚠️ ${message}`;
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 300px;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(warningDiv);

    // 5秒後に自動削除
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => warningDiv.remove(), 300);
      }
    }, 5000);
  }

  /**
   * 成功メッセージを表示
   * @param {string} message - 成功メッセージ
   * @private
   */
  showSuccess(message) {
    // 既存のメッセージを削除
    const existingMessage = document.getElementById('success-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // 成功メッセージを作成
    const successDiv = document.createElement('div');
    successDiv.id = 'success-message';
    successDiv.className = 'success';
    successDiv.textContent = `✅ ${message}`;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      max-width: 300px;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(successDiv);

    // 3秒後に自動削除
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => successDiv.remove(), 300);
      }
    }, 3000);
  }

  /**
   * すべてをクリア
   * @private
   */
  clearAll() {
    try {
      // 入力・出力をクリア
      this.safeSetValue(this.elements.input, '');
      this.safeSetValue(this.elements.output, '');
      
      // カスタム文字順序もクリア
      if (this.elements.order.value === 'custom') {
        this.safeSetValue(this.elements.customOrder, '');
      }
      
      // 統計をリセット
      this.updateCharacterCount();
      
      // 対応表をクリア
      const tbody = this.elements.mappingTable.querySelector('tbody');
      tbody.innerHTML = '';
      
      // エラーメッセージをクリア
      this.clearError();
      
      // フォーカスを入力欄に移動
      this.elements.input.focus();
      
      this.showSuccess('すべてクリアしました');
      
    } catch (error) {
      this.showError('クリア中にエラーが発生しました');
    }
  }

  /**
   * 出力結果をクリップボードにコピー
   * @private
   */
  async copyOutput() {
    try {
      const outputText = this.elements.output.value;
      
      if (!outputText || outputText.trim() === '') {
        this.showWarning('コピーする内容がありません');
        return;
      }

      // クリップボードAPI使用
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(outputText);
        this.showSuccess('結果をクリップボードにコピーしました');
      } else {
        // フォールバック: 古いブラウザ対応
        this.copyToClipboardFallback(outputText);
      }
      
      // コピーボタンの視覚的フィードバック
      const originalText = this.elements.copyBtn.textContent;
      this.elements.copyBtn.textContent = '✅ コピー完了';
      this.elements.copyBtn.style.background = 'var(--success)';
      
      setTimeout(() => {
        this.elements.copyBtn.textContent = originalText;
        this.elements.copyBtn.style.background = '';
      }, 2000);
      
    } catch (error) {
      this.showError('コピーに失敗しました: ' + error.message);
    }
  }

  /**
   * クリップボードコピーのフォールバック
   * @param {string} text - コピーするテキスト
   * @private
   */
  copyToClipboardFallback(text) {
    // 一時的なテキストエリアを作成
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      
      // 古いブラウザのコピーコマンド
      const successful = document.execCommand('copy');
      if (successful) {
        this.showSuccess('結果をクリップボードにコピーしました');
      } else {
        throw new Error('コピーコマンドが失敗しました');
      }
    } catch (error) {
      // 手動コピーを促す
      this.showWarning('自動コピーに失敗しました。手動で結果を選択してコピーしてください。');
      
      // 出力テキストエリアを選択状態にする
      this.elements.output.focus();
      this.elements.output.select();
    } finally {
      document.body.removeChild(textArea);
    }
  }

  /**
   * 安全にDOM要素にテキストを設定
   * @param {HTMLElement} element - 対象要素
   * @param {string} text - 設定するテキスト
   * @private
   */
  safeSetText(element, text) {
    if (!element) return;
    
    const sanitizedText = this.sanitizeInput(text, { maxLength: 50000 });
    element.textContent = sanitizedText;
  }

  /**
   * 安全にDOM要素に値を設定
   * @param {HTMLElement} element - 対象要素
   * @param {string} value - 設定する値
   * @private
   */
  safeSetValue(element, value) {
    if (!element) return;
    
    const sanitizedValue = this.sanitizeInput(value, { maxLength: 50000 });
    element.value = sanitizedValue;
  }

  /**
   * DOM要素を初期化
   * @returns {Object} DOM要素のオブジェクト
   * @private
   */
  initializeElements() {
    const getElement = (id) => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Element with ID '${id}' not found`);
      }
      return element;
    };

    return {
      mode: getElement('mode'),
      order: getElement('order'),
      key: getElement('key'),
      input: getElement('input'),
      output: getElement('output'),
      processBtn: getElement('processBtn'),
      clearBtn: getElement('clearBtn'),
      copyBtn: getElement('copyBtn'),
      mappingTable: getElement('mappingTable'),
      errorMessage: getElement('errorMessage'),
      customOrderContainer: getElement('customOrderContainer'),
      customOrder: getElement('customOrder'),
      totalChars: getElement('totalChars'),
      targetChars: getElement('targetChars'),
      otherChars: getElement('otherChars')
    };
  }

  /**
   * イベントリスナーを設定
   * @private
   */
  setupEventListeners() {
    this.elements.mode.addEventListener('change', () => this.updateTableOnInput());
    this.elements.order.addEventListener('change', () => {
      this.toggleCustomOrderInput();
      this.updateTableOnInput();
    });
    this.elements.key.addEventListener('input', () => this.updateTableOnInput());
    this.elements.customOrder.addEventListener('input', () => {
      this.updateTableOnInput();
      this.updateCharacterCount(); // カスタム文字順序変更時にカウンター更新
    });
    this.elements.processBtn.addEventListener('click', () => this.processText());
    this.elements.clearBtn.addEventListener('click', () => this.clearAll());
    this.elements.copyBtn.addEventListener('click', () => this.copyOutput());
    
    // 入力テキストの変更時に文字数カウンターを更新
    this.elements.input.addEventListener('input', () => this.updateCharacterCount());
    
    // Enterキーでも実行可能
    this.elements.input.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.processText();
      }
    });

    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      // Ctrl+L: クリア
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.clearAll();
      }
      // Ctrl+Shift+C: コピー
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.copyOutput();
      }
    });
  }

  /**
   * 文字数カウンターを更新
   * @private
   */
  updateCharacterCount() {
    const inputText = this.sanitizeInput(this.elements.input.value, {
      maxLength: 100000,
      trimWhitespace: false
    });
    
    // サニタイズ後の値をフィールドに戻す（必要な場合のみ）
    if (inputText !== this.elements.input.value) {
      this.safeSetValue(this.elements.input, inputText);
    }
    
    const order = this.elements.order.value;
    const characterArray = this.getCharacterArray(order);
    
    const stats = this.getTextStatistics(inputText, characterArray);
    
    this.safeSetText(this.elements.totalChars, stats.totalChars.toString());
    this.safeSetText(this.elements.targetChars, stats.targetChars.toString());
    this.safeSetText(this.elements.otherChars, stats.otherChars.toString());
  }

  /**
   * カスタム文字順序入力欄の表示/非表示を切り替え
   * @private
   */
  toggleCustomOrderInput() {
    const isCustom = this.elements.order.value === 'custom';
    this.elements.customOrderContainer.style.display = isCustom ? 'block' : 'none';
    // カスタム順序の変更時にも文字数カウンターを更新
    this.updateCharacterCount();
  }

  /**
   * 文字配列を取得
   * @param {CharacterOrder} order - 文字の並び順
   * @returns {readonly string[] | string[]} 文字配列
   * @private
   */
  getCharacterArray(order) {
    if (order === 'custom') {
      const sanitizedOrder = this.sanitizeInput(this.elements.customOrder.value, {
        maxLength: 1000,
        allowedChars: null,
        trimWhitespace: true
      });
      
      // サニタイズ後の値をフィールドに戻す（必要な場合のみ）
      if (sanitizedOrder !== this.elements.customOrder.value) {
        this.safeSetValue(this.elements.customOrder, sanitizedOrder);
      }
      
      return [...sanitizedOrder];
    }
    return order === 'aiueo' ? JapaneseCaesarCipher.AIUEO : JapaneseCaesarCipher.IROHA;
  }

  /**
   * カスタム文字順序を検証
   * @param {string} customOrder - カスタム文字順序
   * @returns {boolean} 検証結果
   * @private
   */
  validateCustomOrder(customOrder) {
    // 入力値をサニタイズ
    const sanitizedOrder = this.sanitizeInput(customOrder, {
      maxLength: 1000,
      trimWhitespace: true
    });

    if (!sanitizedOrder || sanitizedOrder.length === 0) {
      this.showError('カスタム文字順序が入力されていません。');
      return false;
    }

    if (sanitizedOrder.length < 2) {
      this.showError('カスタム文字順序は2文字以上である必要があります。');
      return false;
    }

    // 重複文字チェック
    const uniqueChars = new Set([...sanitizedOrder]);
    if (uniqueChars.size !== sanitizedOrder.length) {
      this.showError('カスタム文字順序に重複した文字が含まれています。');
      return false;
    }

    // 空白文字チェック
    if (sanitizedOrder.includes(' ') || sanitizedOrder.includes('　')) {
      this.showError('カスタム文字順序に空白文字は使用できません。');
      return false;
    }

    // 制御文字チェック
    if (/[\x00-\x1F\x7F]/.test(sanitizedOrder)) {
      this.showError('カスタム文字順序に制御文字が含まれています。');
      return false;
    }

    return true;
  }

  /**
   * 入力値を検証
   * @returns {boolean} 検証結果
   * @private
   */
  validateInput() {
    const key = parseInt(this.elements.key.value);
    const order = this.elements.order.value;
    
    if (isNaN(key)) {
      this.showError('鍵（シフト数）は数値である必要があります。');
      return false;
    }

    if (key < 0) {
      this.showError('鍵（シフト数）は0以上である必要があります。');
      return false;
    }

    // カスタム順序の場合は動的に最大値を設定
    if (order === 'custom') {
      if (!this.validateCustomOrder(this.elements.customOrder.value)) {
        return false;
      }
      const maxKey = this.elements.customOrder.value.length - 1;
      if (key > maxKey) {
        this.showError(`カスタム文字順序の場合、鍵（シフト数）は${maxKey}以下である必要があります。`);
        return false;
      }
    } else {
      if (key > 49) {
        this.showError('鍵（シフト数）は49以下である必要があります。');
        return false;
      }
    }

    this.clearError();
    return true;
  }

  /**
   * エラーメッセージを表示
   * @param {string} message - エラーメッセージ
   * @private
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'block';
  }

  /**
   * エラーメッセージをクリア
   * @private
   */
  clearError() {
    this.elements.errorMessage.textContent = '';
    this.elements.errorMessage.style.display = 'none';
  }

  /**
   * 文字を暗号化/復号
   * @param {string} char - 対象文字
   * @param {readonly string[]} base - 文字配列
   * @param {number} shift - シフト数
   * @returns {string} 変換後の文字
   * @private
   */
  transformCharacter(char, base, shift) {
    const index = base.indexOf(char);
    if (index === -1) return char;
    
    const newIndex = (index + shift + base.length) % base.length;
    return base[newIndex];
  }

  /**
   * テキストを処理（暗号化/復号）
   */
  processText() {
    if (!this.validateInput()) return;

    // ボタンを処理中状態に
    const originalText = this.elements.processBtn.textContent;
    this.elements.processBtn.textContent = '⏳ 処理中...';
    this.elements.processBtn.classList.add('processing');
    this.elements.processBtn.disabled = true;

    try {
      const mode = this.elements.mode.value;
      const order = this.elements.order.value;
      const key = parseInt(this.elements.key.value);
      const input = this.elements.input.value;

      const base = this.getCharacterArray(order);
      const shift = mode === 'encrypt' ? key : -key;
      
      const output = [...input]
        .map(char => this.transformCharacter(char, base, shift))
        .join('');

      this.elements.output.value = output;
      this.updateTable(base, key, mode);
      
      // 処理成功のフィードバック
      this.elements.processBtn.textContent = '✅ 完了!';
      setTimeout(() => {
        this.elements.processBtn.textContent = originalText;
        this.elements.processBtn.classList.remove('processing');
        this.elements.processBtn.disabled = false;
      }, 1000);

    } catch (error) {
      this.showError(`処理中にエラーが発生しました: ${error.message}`);
      
      // エラー時のボタン復旧
      this.elements.processBtn.textContent = originalText;
      this.elements.processBtn.classList.remove('processing');
      this.elements.processBtn.disabled = false;
    }
  }

  /**
   * 対応表を更新
   * @param {readonly string[]} base - 文字配列
   * @param {number} key - 鍵
   * @param {CipherMode} mode - モード
   * @private
   */
  updateTable(base, key, mode) {
    const shift = mode === 'encrypt' ? key : -key;
    const tbody = this.elements.mappingTable.querySelector('tbody');
    
    // テーブル内容を安全に生成
    const rows = base.map((char, index) => {
      const originalChar = this.sanitizeInput(char, { maxLength: 10 });
      const mappedChar = this.sanitizeInput(
        this.transformCharacter(originalChar, base, shift), 
        { maxLength: 10 }
      );
      
      // HTMLエスケープ済みの安全な文字列として挿入
      const row = document.createElement('tr');
      const originalCell = document.createElement('td');
      const mappedCell = document.createElement('td');
      
      this.safeSetText(originalCell, originalChar);
      this.safeSetText(mappedCell, mappedChar);
      
      row.appendChild(originalCell);
      row.appendChild(mappedCell);
      
      return row;
    });

    // tbodyをクリアして新しい行を追加
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
  }

  /**
   * 入力変更時のテーブル更新
   */
  updateTableOnInput() {
    if (!this.validateInput()) return;

    const mode = this.elements.mode.value;
    const order = this.elements.order.value;
    const key = parseInt(this.elements.key.value);
    
    const base = this.getCharacterArray(order);
    this.updateTable(base, key, mode);
  }

  /**
   * 統計情報を取得
   * @param {string} text - 分析対象テキスト
   * @param {string[]} characterSet - 使用文字セット
   * @returns {Object} 統計情報
   */
  getTextStatistics(text, characterSet = null) {
    const defaultCharacterSet = [
      ...JapaneseCaesarCipher.AIUEO, 
      ...JapaneseCaesarCipher.IROHA
    ];
    
    const targetCharacterSet = characterSet || defaultCharacterSet;
    const targetCount = [...text].filter(char => 
      targetCharacterSet.includes(char)
    ).length;
    
    return {
      totalChars: text.length,
      targetChars: targetCount,
      otherChars: text.length - targetCount,
      characterSetSize: targetCharacterSet.length
    };
  }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    new JapaneseCaesarCipher();
    console.log('日本語シーザー暗号ツールが初期化されました。');
  } catch (error) {
    console.error('初期化エラー:', error);
    document.body.innerHTML = `<h1>エラー</h1><p>アプリケーションの初期化に失敗しました: ${error.message}</p>`;
  }
});