---
title: サンプル実行例 - ドキュメント自動更新システム
description: |
  実際のコード変更シーン（新機能追加・バグ修正）での
  ハーネス実行と出力レポートのサンプル
---

# サンプル実行例

## シーン1: 新機能追加（multiply 関数）

### 1.1 入力データの準備

**コード変更の diff**:
```diff
--- a/src/math.js
+++ b/src/math.js
@@ -1,11 +1,23 @@
 /**
  * Add two numbers
  * @param {number} a
  * @param {number} b
  * @returns {number} a + b
  */
 function add(a, b) {
   return a + b;
 }
 
+/**
+ * Multiply two numbers
+ * @param {number} a
+ * @param {number} b
+ * @returns {number} a * b
+ */
+function multiply(a, b) {
+  return a * b;
+}
```

**変更属性**: `new-feature`

**既存 API.md テンプレート**:
```markdown
# API リファレンス

## add(a, b)

### シグネチャ
function add(a: number, b: number): number

### 説明
2つの数値を足し合わせます。

### パラメータ
- `a` (number): 第1の数値
- `b` (number): 第2の数値

### 戻り値
- (number): a + b の結果

### 例
```js
const result = add(2, 3);
console.log(result); // 5
```
```

**既存 README.md テンプレート**:
```markdown
# math - シンプルな数学ライブラリ

## 概要
シンプルで使いやすい数学ライブラリです。

## インストール
```bash
npm install math
```

## 基本的な使い方

### 足し算
```js
const { add } = require('math');
const result = add(2, 3);
console.log(result); // 5
```

## ライセンス
MIT
```

### 1.2 ハーネス実行

```javascript
const input = {
  diff: `--- a/src/math.js\n+++ b/src/math.js\n@@ -1,11 +1,23 @@\n...`,
  changeAttribute: 'new-feature',
  templates: {
    api_md: '# API リファレンス\n...',
    readme_md: '# math - シンプルな数学ライブラリ\n...'
  }
};

const harness = new DocumentUpdateHarness();
const result = harness.execute(input);
```

### 1.3 期待される出力レポート

```markdown
# ドキュメント更新提案レポート

## 概要

- **変更属性**: new-feature
- **diff ファイル数**: 1
- **影響するドキュメント**: API.md, README.md
- **矛盾検出**: なし
- **要レビュー**: いいえ

---

## API.md の提案変更

### 追加: multiply(a, b)

**before**: （なし - 新規追加）

**after**:
```
## multiply(a, b)

### シグネチャ
function multiply(a: number, b: number): number

### 説明
2つの数値を乗算します。

### パラメータ
- `a` (number): 第1の数値
- `b` (number): 第2の数値

### 戻り値
- (number): a * b の結果

### 例
```js
const result = multiply(3, 4);
console.log(result); // 12
```
```

**理由**: diff に `+ function multiply(a, b)` が検出されました。新機能のため、API.md に新セクションを追加します。

---

## README.md の提案変更

### 追加: 新機能

**before**: （なし - 新規セクション）

**after**:
```
## 新機能

### 乗算機能 multiply()

v0.2.0 で乗算関数 `multiply()` が追加されました。

#### 使い方

```js
const { multiply } = require('math');
const result = multiply(3, 4);
console.log(result); // 12
```

#### パラメータ

- `a` (number): 第1の数値
- `b` (number): 第2の数値

#### 戻り値

- (number): 乗算結果
```

**理由**: 新機能追加が検出されたため、README.md に「新機能」セクションを追加します。

---

## 矛盾検出結果

- なし

---

## 判定: このドキュメント差分は実行可能か？

✓ **はい**（矛盾なし、自動実行可能）

---

**生成日**: 2026-05-09T14:30:00Z
**生成エージェント**: ドキュメント自動更新ハーネス
```

### 1.4 ハーネス出力（JSON形式）

```json
{
  "report": "[上記Markdownレポート]",
  "metadata": {
    "generatedAt": "2026-05-09T14:30:00Z",
    "changeAttribute": "new-feature",
    "canExecute": true,
    "hasErrors": false,
    "hasWarnings": false,
    "conflictCount": 0,
    "proposedChanges": 2
  },
  "updateProposals": [
    {
      "file": "API.md",
      "changes": [
        {
          "type": "insert",
          "section": "multiply(a, b)",
          "before": null,
          "after": "## multiply(a, b)\n\n### シグネチャ\nfunction multiply(a: number, b: number): number\n..."
        }
      ]
    },
    {
      "file": "README.md",
      "changes": [
        {
          "type": "insert",
          "section": "新機能",
          "before": null,
          "after": "## 新機能\n\n### 乗算機能 multiply()\n..."
        }
      ]
    }
  ],
  "conflicts": []
}
```

---

## シーン2: バグ修正（join 関数のパラメータ追加）

### 2.1 入力データの準備

**コード変更の diff**:
```diff
--- a/src/utils.js
+++ b/src/utils.js
@@ -15,11 +15,16 @@
  * Join items with a separator
  * @param {string[]} items
+ * @param {object} options Optional configuration
+ * @param {string} options.separator Custom separator (default: ',')
  * @returns {string} Joined string
  */
-function join(items) {
-  return items.join(',');
+function join(items, options = {}) {
+  const separator = options.separator || ',';
+  return items.join(separator);
 }
```

**変更属性**: `bug-fix`

### 2.2 期待される出力レポート

```markdown
# ドキュメント更新提案レポート

## 概要

- **変更属性**: bug-fix
- **diff ファイル数**: 1
- **影響するドキュメント**: API.md, README.md
- **矛盾検出**: なし
- **要レビュー**: いいえ

---

## API.md の提案変更

### 修正: join(items, options?)

**before**:
```
## join(items)

### シグネチャ
function join(items: string[]): string

### 説明
複数の要素を結合します。

### パラメータ
- `items` (string[]): 結合対象の配列

### 戻り値
- (string): 結合された文字列

### 例
```js
const result = join(['a', 'b', 'c']);
console.log(result); // 'a,b,c'
```
```

**after**:
```
## join(items, options?)

### シグネチャ
function join(items: string[], options?: { separator?: string }): string

### 説明
複数の要素を結合します。カスタム区切り文字をサポートしています。

### パラメータ
- `items` (string[]): 結合対象の配列
- `options` (object, オプション): 設定オブジェクト
  - `separator` (string, オプション): 区切り文字（デフォルト: ','）

### 戻り値
- (string): 結合された文字列

### 互換性
デフォルト値が指定されているため、既存コードに影響なし。

### 例
```js
// 基本的な使い方（既存）
const result = join(['a', 'b', 'c']);
console.log(result); // 'a,b,c'

// カスタム区切り文字を指定
const customResult = join(['a', 'b', 'c'], { separator: ' - ' });
console.log(customResult); // 'a - b - c'
```
```

**理由**: パラメータが追加されました。既存のコードに影響を与えないオプションパラメータのため、互換性を保ちながら API ドキュメントを更新します。

---

## README.md の提案変更

### 修正: 基本的な使い方

**before**:
```
## 基本的な使い方

### 配列の結合
```js
const { join } = require('utils');
const result = join(['a', 'b', 'c']);
console.log(result); // 'a,b,c'
```
```

**after**:
```
## 基本的な使い方

### 配列の結合
```js
const { join } = require('utils');

// 基本的な使い方（デフォルト動作）
const result = join(['a', 'b', 'c']);
console.log(result); // 'a,b,c'

// カスタム区切り文字を指定
const customResult = join(['a', 'b', 'c'], { separator: ' - ' });
console.log(customResult); // 'a - b - c'
```
```

**理由**: `join()` のオプションパラメータ機能を反映。README の使用例を更新し、新しい機能を紹介します。

---

## 矛盾検出結果

- なし

---

## 判定: このドキュメント差分は実行可能か？

✓ **はい**（矛盾なし、自動実行可能）

---

**生成日**: 2026-05-09T14:35:00Z
**生成エージェント**: ドキュメント自動更新ハーネス
```

---

## シーン3: 廃止予告（セキュリティパッチ関連）

### 3.1 入力データの準備

**コード変更の diff**:
```diff
--- a/src/auth.js
+++ b/src/auth.js
@@ -20,10 +20,15 @@
  * @deprecated Use authenticate() instead
  * @param {string} username
- * @param {string} password
+ * @param {string} password (MD5不使用、セキュリティ脆弱性のため廃止予告)
  * @returns {boolean}
  */
 function login(username, password) {
+  console.warn('DEPRECATED: login() は v1.0 で削除されます。authenticate() をご利用ください。');
   // ...
 }
+
+/**
+ * Authenticate user securely
+ * @param {string} username
+ * @param {string} password
+ * @returns {Promise<{token: string}>}
+ */
+async function authenticate(username, password) {
+  // bcrypt などセキュアなハッシュ関数を使用
+}
```

**変更属性**: `security-patch` + `deprecation`

### 3.2 期待される出力レポート（矛盾あり）

```markdown
# ドキュメント更新提案レポート

## 概要

- **変更属性**: security-patch (with deprecation)
- **diff ファイル数**: 1
- **影響するドキュメント**: API.md, README.md
- **矛盾検出**: あり (1件)
- **要レビュー**: はい (警告)

---

## API.md の提案変更

### 追加: authenticate(username, password)

**before**: （なし - 新規追加）

**after**:
```
## authenticate(username, password)

### シグネチャ
async function authenticate(username: string, password: string): Promise<{ token: string }>

### 説明
ユーザーを認証し、トークンを返します。セキュアなハッシュ関数を使用しています。

### パラメータ
- `username` (string): ユーザー名
- `password` (string): パスワード

### 戻り値
- Promise<{ token: string }>: 認証トークンを含むオブジェクト

### 例
```js
const result = await authenticate('user123', 'password');
console.log(result.token); // eyJhbGc...
```
```

**理由**: セキュアな認証機能が追加されました。新機能として API ドキュメントに記載します。

---

### 修正: login() - 廃止予告セクションへ移動

**before**:
```
## login(username, password)

### シグネチャ
function login(username: string, password: string): boolean

### 説明
ユーザーをログインさせます。

...
```

**after**:
```
## [廃止予告] login(username, password)

### シグネチャ
~~function login(username: string, password: string): boolean~~

### 説明
**このメソッドはセキュリティ上の理由により、v1.0 で削除される予定です。**

代わりに `authenticate()` をご利用ください。

...
```

**理由**: セキュリティ脆弱性のため廃止予告。API ドキュメントを「廃止予告」セクションに移動し、代替案を明記します。

---

## README.md の提案変更

### 追加: セキュリティ更新

**before**: （なし - 新規セクション）

**after**:
```
## セキュリティ更新 - v0.2.0

v0.2.0 でセキュリティパッチが適用されました。

### 廃止予告: login() 関数

`login()` 関数はセキュリティ脆弱性の修正のため、**v1.0 で削除される予定です。**

代わりに新しい `authenticate()` 関数をご利用ください：

```js
// 廃止予定（v1.0で削除）
const result = login('user123', 'password');

// 推奨（新しい方法）
const { token } = await authenticate('user123', 'password');
```

詳細は CHANGELOG.md を参照してください。
```

**理由**: セキュリティパッチに関する廃止予告を README に追加します。

---

## 矛盾検出結果

⚠️ **WARNING**: API.md に新機能 `authenticate()` が追加されるが、README に新機能セクションがありません。
推奨: README.md に `authenticate()` の基本的な使用方法を「新機能」セクション（またはセキュリティ更新セクション）に追加してください。

---

## 判定: このドキュメント差分は実行可能か？

✓ **はい、ただし要確認**（警告あり、確認推奨）

以下の点を確認してください：
- README に新しい `authenticate()` の使用方法を記載
- 既存ユーザーへの通知方法（CHANGELOG で十分か）
- API ドキュメントの廃止予告が明確か

---

**生成日**: 2026-05-09T14:40:00Z
**生成エージェント**: ドキュメント自動更新ハーネス
```

---

## 実行結果のまとめ

| シーン | 変更属性 | エージェント出力数 | 矛盾検出 | 実行可能 |
|--------|---------|-----------------|--------|---------|
| シーン1: 新機能追加 | new-feature | 2 (API + README) | なし | ✓ はい |
| シーン2: バグ修正 | bug-fix | 2 (API + README) | なし | ✓ はい |
| シーン3: セキュリティパッチ | security-patch | 3 (API + README + 警告) | あり | ✓ はい（要確認） |

---

## 実装に必要なコンポーネント

### JavaScript 実装例

```javascript
// harness.js - メインのハーネス実装
class DocumentUpdateHarness {
  constructor() {
    this.apiAgent = new ApiDocAgent();
    this.readmeAgent = new ReadmeAgent();
  }

  async execute(input) {
    // 1. 入力検証
    this.validateInput(input);

    // 2. 複数エージェント並列実行
    const [apiProposal, readmeProposal] = await Promise.all([
      this.apiAgent.process(input),
      this.readmeAgent.process(input)
    ]);

    // 3. 矛盾検出
    const conflicts = this.detectConflicts(
      apiProposal,
      readmeProposal,
      input.changeAttribute
    );

    // 4. マージ
    const mergedProposals = this.mergeProposals(
      apiProposal,
      readmeProposal
    );

    // 5. レポート生成
    const report = this.generateReport(
      input,
      apiProposal,
      readmeProposal,
      conflicts,
      mergedProposals
    );

    return report;
  }

  // ... その他のメソッド
}

// 使用例
const harness = new DocumentUpdateHarness();
const result = await harness.execute({
  diff: '--- a/src/math.js\n+++ b/src/math.js\n...',
  changeAttribute: 'new-feature',
  templates: { ... }
});

console.log(result.report);
```
