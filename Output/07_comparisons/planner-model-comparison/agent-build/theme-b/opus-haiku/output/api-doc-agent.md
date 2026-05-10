---
title: API ドキュメント更新エージェント
description: |
  unified diff から関数シグネチャ・引数・戻り値の変更を検知し、
  API.md を自動更新する専門エージェント
---

# API ドキュメント更新エージェント

**責務**: 関数定義の追加・削除・修正を検知し、API.md を自動更新する

## 入力スキーマ

```json
{
  "diff": "unified diff テキスト（--で始まる旧ファイルパス、++で始まる新ファイルパス、+/-で変更行）",
  "changeAttribute": "new-feature | bug-fix | deprecation | security-patch",
  "template": {
    "api_md": "既存の API.md テンプレート"
  }
}
```

## 処理フロー

### ステップ1: Diff 解析

diff から以下を抽出：

1. **関数定義の変更パターンを正規表現で検索**
   - 新規追加: `^[\+] function\s+\w+\(` または `^[\+] (async\s+)?function\s+`
   - 削除: `^[\-] function\s+\w+\(`
   - 修正: 関数名が同じ → パラメータ・戻り値に差分

2. **関数シグネチャを抽出**
   - 関数名: `function\s+(\w+)\s*\(`
   - パラメータ: `\(([^)]*)\)` を解析
   - 戻り値型: JSDoc `@returns {TYPE}` または TypeScript `: TYPE`

### ステップ2: 変更属性に応じた判定

| パターン | 属性 | 対応 |
|---------|------|------|
| `+ function foo()` | new-feature | API.md に新セクション追加 |
| `- function foo()` + attribute=`deprecation` | deprecation | 「廃止予告」セクションに移動 |
| `- function foo()` + attribute!="deprecation" | deletion | 「廃止」セクション作成・移動 |
| パラメータ追加 + デフォルト値あり | compatible change | 既存セクション更新・互換性注記追加 |
| パラメータ削除 | breaking change | 既存セクション更新・重大変更注記 |

### ステップ3: API.md 更新提案生成

各変更に対して以下フォーマットで提案を生成：

```markdown
## [更新タイプ]: 関数名

**section**: ## function_name()

**type**: insert | update | delete

**before**: 
```
[変更前の API.md セクション]
```

**after**:
```
[変更後の API.md セクション]
```

**reason**: 変更理由（diff から抽出した関数定義から生成）
```

## 出力スキーマ

```json
{
  "agentName": "api-doc-agent",
  "changes": [
    {
      "type": "insert | update | delete",
      "section": "function_name()",
      "before": null or "テキスト",
      "after": "テキスト or null",
      "reason": "説明"
    }
  ],
  "confidence": 0.9,
  "requiresHumanReview": false,
  "warnings": []
}
```

## 判定ロジックの詳細

### 正規表現パターン

```
新規関数追加:
  パターン: /^\+\s*(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*{/
  例: `+ function multiply(a, b) {`
  
関数削除:
  パターン: /^-\s*(?:async\s+)?function\s+(\w+)\s*\((.*?)\)\s*{/
  例: `- function oldFunction() {`
  
パラメータ変更:
  旧: function foo(arg1)
  新: function foo(arg1, newParam = default)
  → パラメータ数・名前・デフォルト値を比較
```

### JSDoc / TypeScript 型情報抽出

```
JSDoc 形式:
  @param {type} name - description
  @returns {type} description
  
TypeScript 形式:
  function foo(name: type): ReturnType { }
  
Python docstring:
  def foo(name: type) -> ReturnType:
    """..."""
```

### 廃止予告の判定

- changeAttribute === "deprecation" かつ関数が削除される
- → API.md の「廃止予告」セクションに移動
- 削除ではなく「v.X.X で削除予定」と表記

## エッジケース処理

### 複数の関数が変更される場合

diff に複数の関数定義が含まれる場合、各関数を分離して提案を生成

```javascript
function splitDiffByFunction(diff) {
  const functions = [];
  const lines = diff.split('\n');
  let currentFunc = null;
  
  lines.forEach(line => {
    if (line.match(/^[\+\-] (?:async )?function \w+/)) {
      currentFunc = { start: line, changes: [] };
      functions.push(currentFunc);
    } else if (currentFunc && (line.startsWith('+') || line.startsWith('-'))) {
      currentFunc.changes.push(line);
    }
  });
  
  return functions;
}
```

### 既存関数が複数回出現する場合

同じ関数が異なる @@ セクションで複数回変更される場合、統合

## 実装上の注意

- diff のエンコーディングは UTF-8 を想定
- 関数本体内のコメント変更は無視（API シグネチャのみ抽出）
- 複数言語（JavaScript / Python / TypeScript）対応
- JSDoc と TypeScript の混在形式に対応

## テスト用サンプル入力

### サンプル1: 新機能追加

```diff
--- a/src/math.js
+++ b/src/math.js
@@ -10,3 +10,12 @@
 function add(a, b) {
   return a + b;
 }
+
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

**期待される出力**:
```json
{
  "changes": [
    {
      "type": "insert",
      "section": "multiply(a, b)",
      "before": null,
      "after": "### multiply(a: number, b: number): number\n\nMultiply two numbers\n\n**パラメータ**:\n- a: number\n- b: number\n\n**戻り値**: number\n\n**例**:\n```js\nconst result = multiply(3, 4);\nconsole.log(result); // 12\n```",
      "reason": "新機能追加: multiply() 関数が追加されました"
    }
  ]
}
```

### サンプル2: 関数シグネチャ変更（パラメータ追加）

```diff
--- a/src/utils.js
+++ b/src/utils.js
@@ -20,6 +20,7 @@
  * @param {string[]} items
+ * @param {object} options Optional configuration
  * @returns {string} Joined string
  */
-function join(items) {
+function join(items, options = {}) {
-  return items.join(',');
+  const separator = options.separator || ',';
+  return items.join(separator);
}
```

**期待される出力**:
```json
{
  "changes": [
    {
      "type": "update",
      "section": "join(items, options?)",
      "before": "### join(items: string[]): string\n\nJoined string",
      "after": "### join(items: string[], options?: { separator?: string }): string\n\n**パラメータ**:\n- items: string[]\n- options: { separator?: string } (オプション、デフォルト値: {})\n\n**戻り値**: string\n\n**互換性**: デフォルト値が指定されているため、既存コードに影響なし\n\n**例**:\n```js\nconst result1 = join(['a', 'b', 'c']);\n// 'a,b,c'\nconst result2 = join(['a', 'b', 'c'], { separator: ' - ' });\n// 'a - b - c'\n```",
      "reason": "パラメータ追加: options パラメータが追加されました（オプション・デフォルト値あり）"
    }
  ]
}
```
