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
   * DOM要素の参照
   * @private
   */
  constructor() {
    this.elements = this.initializeElements();
    this.statusTimer = null;
    this.processTimer = null;
    this.copyTimer = null;
    this.setupEventListeners();
    this.toggleCustomOrderInput(); // 初期状態を設定
    this.updateCharacterCount(); // 初期文字数カウンターを設定
    this.updateTableOnInput();
  }

  /**
   * 警告メッセージを表示
   * @param {string} message - 警告メッセージ
   * @private
   */
  showWarning(message) {
    this.showStatus(message, 'warning', 5000);
  }

  /**
   * 成功メッセージを表示
   * @param {string} message - 成功メッセージ
   * @private
   */
  showSuccess(message) {
    this.showStatus(message, 'success', 3000);
  }

  /**
   * 常設の通知領域を更新（前の通知タイマーは取り消す）
   * @param {string} message - 通知内容
   * @param {'warning' | 'success'} type - 通知種別
   * @param {number} duration - 表示時間（ミリ秒）
   * @private
   */
  showStatus(message, type, duration) {
    clearTimeout(this.statusTimer);
    this.elements.statusMessage.className = `toast toast--${type}`;
    this.elements.statusMessage.textContent = message;
    this.statusTimer = setTimeout(() => {
      this.elements.statusMessage.textContent = '';
      this.elements.statusMessage.className = 'toast';
    }, duration);
  }

  /**
   * すべてをクリア
   * @private
   */
  clearAll() {
    try {
      // 入力・出力をクリア
      this.elements.input.value = '';
      this.elements.output.value = '';

      // 並び順にかかわらず、カスタム文字順序もクリア
      this.elements.customOrder.value = '';

      // 統計と対応表を現在の設定で更新
      this.updateCharacterCount();
      this.updateTableOnInput();
      clearTimeout(this.processTimer);
      this.elements.processBtn.textContent = '🚀 実行';

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
      await navigator.clipboard.writeText(outputText);
      this.showSuccess('結果をクリップボードにコピーしました');

      // コピーボタンの視覚的フィードバック
      clearTimeout(this.copyTimer);
      this.elements.copyBtn.textContent = '✅ コピー完了';
      this.elements.copyBtn.classList.add('copy-success');
      this.copyTimer = setTimeout(() => {
        this.elements.copyBtn.textContent = '📋 結果をコピー';
        this.elements.copyBtn.classList.remove('copy-success');
      }, 2000);
    } catch (error) {
      this.showWarning('コピーできませんでした。出力欄を選択してコピーしてください。');
      this.elements.output.focus();
      this.elements.output.select();
    }
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
      statusMessage: getElement('statusMessage'),
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

    // Ctrl+Enter（Macは⌘+Enter）で実行可能
    [this.elements.input, this.elements.key, this.elements.customOrder].forEach(element => {
      element.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.processText();
        }
      });
    });
  }

  /**
   * 文字数カウンターを更新
   * @private
   */
  updateCharacterCount() {
    const inputText = this.elements.input.value;
    const order = this.elements.order.value;
    const characterArray = this.getCharacterArray(order);
    const stats = JapaneseCaesar.countStats(inputText, characterArray);

    this.elements.totalChars.textContent = stats.total.toString();
    this.elements.targetChars.textContent = stats.target.toString();
    this.elements.otherChars.textContent = stats.other.toString();
  }

  /**
   * カスタム文字順序入力欄の表示/非表示を切り替え
   * @private
   */
  toggleCustomOrderInput() {
    const isCustom = this.elements.order.value === 'custom';
    this.elements.customOrderContainer.hidden = !isCustom;
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
      const result = JapaneseCaesar.parseOrder(this.elements.customOrder.value);
      return result.ok ? result.chars : [];
    }
    return order === 'aiueo' ? JapaneseCaesar.AIUEO : JapaneseCaesar.IROHA;
  }

  /**
   * カスタム文字順序を検証
   * @param {string} customOrder - カスタム文字順序
   * @returns {boolean} 検証結果
   * @private
   */
  validateCustomOrder(customOrder) {
    const result = JapaneseCaesar.parseOrder(customOrder);
    if (!result.ok) {
      const messages = {
        EMPTY: 'カスタム文字順序が入力されていません。',
        TOO_SHORT: 'カスタム文字順序は2文字以上である必要があります。',
        WHITESPACE: 'カスタム文字順序に空白文字は使用できません。',
        CONTROL: 'カスタム文字順序に制御文字が含まれています。',
        DUPLICATE: 'カスタム文字順序に重複した文字が含まれています。'
      };
      this.showError(messages[result.code], this.elements.customOrder);
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
    this.clearError();
    const rawKey = this.elements.key.value;
    const key = Number(rawKey);
    const order = this.elements.order.value;
    const chars = this.getCharacterArray(order);

    // すべての並び順で文字数に応じて最大値を設定
    this.elements.key.max = String(Math.max(0, chars.length - 1));
    if (order === 'custom' && !this.validateCustomOrder(this.elements.customOrder.value)) {
      return false;
    }
    if (rawKey.trim() === '' || !Number.isFinite(key)) {
      this.showError('鍵（シフト数）は数値である必要があります。', this.elements.key);
      return false;
    }
    if (!Number.isInteger(key)) {
      this.showError('鍵（シフト数）は整数である必要があります。', this.elements.key);
      return false;
    }
    if (key < 0) {
      this.showError('鍵（シフト数）は0以上である必要があります。', this.elements.key);
      return false;
    }

    const maxKey = chars.length - 1;
    if (key > maxKey) {
      const orderName = this.elements.order.selectedOptions[0].textContent;
      this.showError(
        `鍵（シフト数）は${maxKey}以下である必要があります（${orderName}は${chars.length}文字）。`,
        this.elements.key
      );
      return false;
    }
    return true;
  }

  /**
   * エラーメッセージを表示
   * @param {string} message - エラーメッセージ
   * @param {HTMLInputElement | null} field - エラーのある入力欄
   * @private
   */
  showError(message, field = null) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.hidden = false;
    if (field) field.setAttribute('aria-invalid', 'true');
  }

  /**
   * エラーメッセージをクリア
   * @private
   */
  clearError() {
    this.elements.errorMessage.textContent = '';
    this.elements.errorMessage.hidden = true;
    this.elements.key.removeAttribute('aria-invalid');
    this.elements.customOrder.removeAttribute('aria-invalid');
  }

  /**
   * テキストを処理（暗号化/復号）
   */
  processText() {
    if (!this.validateInput()) {
      this.updateTableOnInput();
      return;
    }

    try {
      const mode = this.elements.mode.value;
      const order = this.elements.order.value;
      const key = Number(this.elements.key.value);
      const input = this.elements.input.value;
      const base = this.getCharacterArray(order);
      const output = JapaneseCaesar.shiftText(input, base, key, { decrypt: mode === 'decrypt' });

      this.elements.output.value = output;
      this.updateTable(base, key, mode);
      this.updateCharacterCount();

      // 処理成功のフィードバック（ボタンは無効にせずフォーカスを維持）
      clearTimeout(this.processTimer);
      this.elements.processBtn.textContent = '✅ 完了!';
      this.showSuccess(mode === 'encrypt' ? '暗号化しました' : '復号しました');
      this.processTimer = setTimeout(() => {
        this.elements.processBtn.textContent = '🚀 実行';
      }, 1000);
    } catch (error) {
      this.showError(`処理中にエラーが発生しました: ${error.message}`);
      clearTimeout(this.processTimer);
      this.elements.processBtn.textContent = '🚀 実行';
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
    const tbody = this.elements.mappingTable.querySelector('tbody');

    // テーブル内容を安全に生成
    const rows = JapaneseCaesar.buildTable(base, key, { decrypt: mode === 'decrypt' })
      .map(([originalChar, mappedChar]) => {
        const row = document.createElement('tr');
        const originalCell = document.createElement('td');
        const mappedCell = document.createElement('td');

        originalCell.textContent = originalChar;
        mappedCell.textContent = mappedChar;
        row.appendChild(originalCell);
        row.appendChild(mappedCell);
        return row;
      });

    // tbodyをクリアして新しい行を追加
    tbody.replaceChildren(...rows);
  }

  /**
   * 入力変更時のテーブル更新
   */
  updateTableOnInput() {
    const mode = this.elements.mode.value;
    const headers = this.elements.mappingTable.querySelectorAll('th');
    headers[0].textContent = mode === 'encrypt' ? '平文文字' : '暗号文文字';
    headers[1].textContent = mode === 'encrypt' ? '暗号文文字' : '平文文字';
    const caption = this.elements.mappingTable.querySelector('caption');

    if (!this.validateInput()) {
      this.elements.mappingTable.querySelector('tbody').replaceChildren();
      caption.textContent = '設定が無効なため対応表を表示できません。';
      return;
    }

    const order = this.elements.order.value;
    const key = Number(this.elements.key.value);
    const orderName = this.elements.order.selectedOptions[0].textContent;
    const modeName = mode === 'encrypt' ? '暗号化' : '復号';
    caption.textContent = `${orderName}・鍵${key}・${modeName}の対応表`;
    const base = this.getCharacterArray(order);
    this.updateTable(base, key, mode);
  }

}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    new JapaneseCaesarCipher();
  } catch (error) {
    console.error('初期化エラー:', error);

    // 安全なエラー表示: DOM要素を直接作成
    const container = document.createElement('div');
    container.className = 'initialization-error';

    const heading = document.createElement('h1');
    heading.textContent = 'エラー';
    container.appendChild(heading);

    const message = document.createElement('p');
    message.textContent = `アプリケーションの初期化に失敗しました: ${error.message}`;
    container.appendChild(message);

    document.body.textContent = ''; // 既存コンテンツをクリア
    document.body.appendChild(container);
  }
});
