// 日本語と英語のメッセージ。UI側のスクリプトは言語ごとの文字列を持たない。
// 扱う対象（ひらがな）は言語を変えても変わらない。訳すのは画面の文言だけ。
const I18n = (() => {
  const ja = {
    'app.title': '日本語シーザー暗号（Japanese Caesar Cipher）',
    'app.description':
      'ひらがな専用のシーザー暗号ツール。あいうえお順・いろは順・任意の文字順序で暗号化と復号ができる',
    'app.heading': '日本語シーザー暗号ツール（Japanese Caesar Cipher）',
    'app.langButton': 'English',
    'app.langAria': '言語を切り替える',

    'settings.header': '⚙️ 設定',
    'settings.mode': 'モード:',
    'mode.encrypt': '🔒 暗号化',
    // 対応表の説明に差し込む用。選択肢と違って絵文字を付けない
    'mode.encryptPlain': '暗号化',
    'mode.decryptPlain': '復号',
    'mode.decrypt': '🔓 復号',
    'settings.order': '並び順:',
    'order.aiueo': 'あいうえお順',
    'order.iroha': 'いろは順',
    'order.custom': '任意',
    'settings.customOrder': '文字順序:',
    'settings.customPlaceholder': '例: あかさたなはまやらわ',
    'settings.customHint': '使用したい文字を重複なく並べて入力してください',
    'settings.key': '鍵（シフト数）:',

    'input.header': '📝 入力',
    'input.label': '入力テキスト（複数行可）:',
    'input.placeholder': 'ここに暗号化/復号したいテキストを入力してください',
    'stats.total': '総文字数:',
    'stats.target': '変換対象:',
    'stats.other': '変換対象外:',

    'button.process': '🚀 実行',
    'button.done': '✅ 完了!',
    'button.clear': '🗑️ すべてクリア',
    'button.copy': '📋 結果をコピー',
    'button.copied': '✅ コピー完了',

    'output.header': '📤 出力結果',
    'output.label': '出力:',
    'output.placeholder': '結果がここに表示されます',

    'table.header': '📊 暗号表（対応表）',
    'table.plain': '平文文字',
    'table.cipher': '暗号文文字',
    'table.caption': '{order}・鍵{key}・{mode}の対応表',
    'table.unavailable': '設定が無効なため対応表を表示できません。',

    'security.title': '🔒 セキュリティに関する注意:',
    'security.body':
      'このツールは教育・学習目的で作成されています。重要な機密情報の保護には使用しないでください。' +
      '古典暗号は現代の暗号学的標準を満たしておらず、容易に解読される可能性があります。',

    'shortcut.summary': '⌨️ キーボードショートカット',
    'shortcut.runPrefix': '（Macは',
    'shortcut.runSuffix': '）: 暗号化/復号実行',

    'msg.cleared': 'すべてクリアしました',
    'msg.clearError': 'クリア中にエラーが発生しました',
    'msg.nothingToCopy': 'コピーする内容がありません',
    'msg.copied': '結果をクリップボードにコピーしました',
    'msg.copyFailed': 'コピーできませんでした。出力欄を選択してコピーしてください。',
    'msg.encrypted': '暗号化しました',
    'msg.decrypted': '復号しました',
    'msg.processError': '処理中にエラーが発生しました: {message}',
    'msg.initError': 'アプリケーションの初期化に失敗しました: {message}',
    'msg.errorLabel': 'エラー',

    'validate.customEmpty': 'カスタム文字順序が入力されていません。',
    'validate.customShort': 'カスタム文字順序は2文字以上である必要があります。',
    'validate.customSpace': 'カスタム文字順序に空白文字は使用できません。',
    'validate.customControl': 'カスタム文字順序に制御文字が含まれています。',
    'validate.customDuplicate': 'カスタム文字順序に重複した文字が含まれています。',
    'validate.keyNumber': '鍵（シフト数）は数値である必要があります。',
    'validate.keyInteger': '鍵（シフト数）は整数である必要があります。',
    'validate.keyMin': '鍵（シフト数）は0以上である必要があります。',
    'validate.keyMax':
      '鍵（シフト数）は{max}以下である必要があります（{order}は{count}文字）。',

    'noscript': 'このツールの利用にはJavaScriptが必要です。'
  };

  const en = {
    'app.title': 'Japanese Caesar Cipher',
    'app.description':
      'A Caesar cipher for Japanese kana. Shift along the aiueo order, the iroha order, or an order you define.',
    'app.heading': 'Japanese Caesar Cipher',
    'app.langButton': '日本語',
    'app.langAria': 'Switch language',

    'settings.header': '⚙️ Settings',
    'settings.mode': 'Mode:',
    'mode.encrypt': '🔒 Encrypt',
    'mode.encryptPlain': 'encryption',
    'mode.decryptPlain': 'decryption',
    'mode.decrypt': '🔓 Decrypt',
    'settings.order': 'Order:',
    'order.aiueo': 'aiueo order',
    'order.iroha': 'iroha order',
    'order.custom': 'your own',
    'settings.customOrder': 'Character order:',
    'settings.customPlaceholder': 'e.g. あかさたなはまやらわ',
    'settings.customHint': 'List the characters you want to use, with no repeats.',
    'settings.key': 'Key (shift):',

    'input.header': '📝 Input',
    'input.label': 'Text (several lines are fine):',
    'input.placeholder': 'Type the text you want to encrypt or decrypt',
    'stats.total': 'Characters:',
    'stats.target': 'Will be shifted:',
    'stats.other': 'Left as they are:',

    'button.process': '🚀 Run',
    'button.done': '✅ Done!',
    'button.clear': '🗑️ Clear everything',
    'button.copy': '📋 Copy the result',
    'button.copied': '✅ Copied',

    'output.header': '📤 Result',
    'output.label': 'Output:',
    'output.placeholder': 'The result appears here',

    'table.header': '📊 Substitution table',
    'table.plain': 'Plaintext',
    'table.cipher': 'Ciphertext',
    'table.caption': 'Table for {order}, key {key}, {mode}',
    'table.unavailable': 'The settings are not valid, so there is no table to show.',

    'security.title': '🔒 A note on security:',
    'security.body':
      'This tool is for learning. Do not use it to protect anything that matters. ' +
      'Classical ciphers fall far short of modern standards and are broken easily.',

    'shortcut.summary': '⌨️ Keyboard',
    'shortcut.runPrefix': ' (on a Mac, ',
    'shortcut.runSuffix': '): run encrypt or decrypt',

    'msg.cleared': 'Cleared everything',
    'msg.clearError': 'Something went wrong while clearing',
    'msg.nothingToCopy': 'There is nothing to copy',
    'msg.copied': 'Copied the result to the clipboard',
    'msg.copyFailed': 'Could not copy. Select the output and copy it by hand.',
    'msg.encrypted': 'Encrypted',
    'msg.decrypted': 'Decrypted',
    'msg.processError': 'Something went wrong: {message}',
    'msg.initError': 'The tool failed to start: {message}',
    'msg.errorLabel': 'Error',

    'validate.customEmpty': 'Type the character order you want to use.',
    'validate.customShort': 'The character order needs at least two characters.',
    'validate.customSpace': 'The character order cannot contain spaces.',
    'validate.customControl': 'The character order contains a control character.',
    'validate.customDuplicate': 'The character order contains a repeated character.',
    'validate.keyNumber': 'The key has to be a number.',
    'validate.keyInteger': 'The key has to be a whole number.',
    'validate.keyMin': 'The key cannot be negative.',
    'validate.keyMax':
      'The key has to be {max} or less ({order} has {count} characters).',

    'noscript': 'This tool needs JavaScript.'
  };

  let language = 'ja';
  const STORAGE_KEY = 'japanese-caesar-cipher-language';

  function t(key, values = {}) {
    const dictionary = language === 'en' ? en : ja;
    const message = dictionary[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (match, name) =>
      (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.description'));
    root.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });
    for (const attribute of ['aria-label', 'title', 'placeholder']) {
      root.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
      });
    }
  }

  function setLanguage(value) {
    if (!['ja', 'en'].includes(value)) return;
    language = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // ストレージが使えない環境では記憶しない
    }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function init() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // ストレージが使えない環境では既定に従う
    }
    const query = new URLSearchParams(location.search).get('lang');
    language = [query, saved].find(value => value === 'ja' || value === 'en')
      || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
