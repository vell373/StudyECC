# 実装サマリー（haiku-opus パターン: マークダウン ライブプレビュー エディター）

## 実装した要件

### Must-Have
- [x] **マークダウン入力フィールド**: `<textarea id="markdown-input">` で改行を含む入力を受け付ける（`index.html` / `script.js` の `onInput`）
- [x] **リアルタイムプレビュー表示**: `input` イベント + 100ms デバウンスで `renderPreview()` を呼び出す（`script.js` の `debounce` / `debouncedRender`）
- [x] **基本的なマークダウン解析**: 正規表現ベースの自作パーサー `parseMarkdown` / `parseInline`
  - 見出し H1～H6、段落、太字（`**`/`__`）、イタリック（`*`/`_`）、順序なし/順序付きリスト、インラインコード、コードブロック、リンク
- [x] **LocalStorage 自動保存・復元**: `saveText` / `safeGet` / `safeSet` でラップし、`init()` で起動時に復元

### Should-Have
- [x] **ライト/ダークモード切替**: CSS カスタムプロパティ + `data-theme` 属性、設定は LocalStorage に保存（`applyTheme`）
- [x] **入力エリアのフォント選択**: Google Fonts から Courier Prime / Lato / Noto Sans JP を読み込み、`data-input-font` 属性で切替（`applyFont`）
- [x] **プレビューエリアのスタイリング**: H1～H6 の段階的サイズ、段落マージン、行高、コードブロック背景、blockquote、テーブル罫線などを `style.css` に定義

### Nice-to-Have
- [x] **テーブル対応**: `| col | col |` + 区切り行 を検出して `<table>/<thead>/<tbody>` に変換（`buildTable`）
- [x] **HTML コピーボタン**: Clipboard API 使用、未対応環境では `execCommand('copy')` にフォールバック（`onCopyHtml`）
- [x] **リセットボタン**: `confirm()` ダイアログで確認したうえで初期化（`onResetText`）

## 設計上の判断

spec.md に明記がなかった、または曖昧だった点での判断:

- **デフォルトテキスト**: 初回起動時に対応記法の例を含むサンプル文書を表示する。空の状態だとアプリの機能が分かりにくいため UX を優先（`DEFAULT_TEXT`）。
- **コードブロック保護**: 正規表現の競合を避けるため、コードブロックとインラインコードは「プレースホルダで退避 → 他の変換 → 復元」という 2 段階方式を採用。仕様の「ネスト要素は初版では無視」を満たしつつ、コード内の `*` などが誤変換される事故を防ぐ。
- **XSS 対策**: 入力全体を最初に `escapeHtml` し、リンクの `javascript:` / `data:` スキームは `#` に置換。`textContent` ではなくエスケープ済み文字列を `innerHTML` する方式（プレビュー機能性とのトレードオフでこちらを選択）。
- **複数タブ同期**: `storage` イベントで他タブからの変更を取り込む実装を追加（仕様は「最後の保存が優先」だが、簡単に追加できる範囲で UX を改善）。
- **保存タイミング**: プレビュー再描画は 100ms、LocalStorage 書き込みは 250ms と別デバウンスにし、書き込み回数を抑制。
- **レスポンシブ**: 800px 以下で上下分割に切替。仕様に「右側または下側」とあったため明示。
- **保存ステータス表示**: ヘッダ右に「入力中… / 保存済み / 復元しました」を `aria-live="polite"` で通知。アクセシビリティとフィードバックの両立。

## 既知の問題・制限

- **ネストしたインライン要素**: `**bold *italic***` のような交差ネストは正しく描画されない。仕様の方針に従い初版では非対応。
- **ネストしたリスト**: `  - サブ項目` のようなインデントネストは未対応（フラットなリストのみ）。
- **コードブロックのシンタックスハイライト**: 言語識別子は `class="language-xxx"` を付与するのみで、色付け処理は行わない（外部ライブラリ禁止のため）。
- **LocalStorage 上限**: 5MB 程度を上限とする想定だが、明示的な閾値警告 UI は未実装。`QuotaExceededError` は console.warn でサイレント通知。
- **印刷スタイル**: `@media print` の専用スタイルは未追加（Should-Have 範囲外）。

## 実行方法

ビルド不要、サーバー不要です。

1. `output/index.html` をブラウザで直接開く
   - Mac: `open output/index.html`
   - Windows: `start output\index.html`
   - Linux: `xdg-open output/index.html`
2. 左の入力欄にマークダウンを入力すると、右にプレビューが表示される
3. ヘッダのトグルでテーマ・フォントを切替
4. 「HTMLコピー」で生成 HTML をクリップボードにコピー、「リセット」で初期化
5. ページをリロードしても入力内容・テーマ・フォントは復元される
6. DevTools → Application → Local Storage で `mdEditor.text` / `mdEditor.theme` / `mdEditor.font` を確認できる

任意でローカルサーバーを使う場合:

```
python3 -m http.server 8080
# → http://localhost:8080/output/
```

## 技術スタック（最終版）

- **HTML5**: セマンティック要素 + Grid レイアウト
- **CSS3**: カスタムプロパティ（CSS Variables）でテーマ切替、`@media` でレスポンシブ
- **Vanilla JavaScript（ES2017+）**: `async/await`、テンプレートリテラル、IIFE で名前空間を分離
- **Google Fonts CDN**: Courier Prime / Lato / Noto Sans JP
- **LocalStorage API**: `try/catch` で保護した `safeGet` / `safeSet`
- **Clipboard API**: `navigator.clipboard.writeText` + `execCommand('copy')` フォールバック

外部 JavaScript ライブラリは一切使用していません（仕様の制約を遵守）。
