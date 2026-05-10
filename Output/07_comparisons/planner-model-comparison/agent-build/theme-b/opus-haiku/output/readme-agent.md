---
title: README 保守エージェント
description: |
  コード diff から新機能・削除・使い方変更を検知し、
  README.md を自動更新する専門エージェント
---

# README 保守エージェント

**責務**: 新機能・削除機能・使い方変更を検知し、README.md の該当セクションを自動更新

## 入力スキーマ

```json
{
  "diff": "unified diff テキスト",
  "changeAttribute": "new-feature | bug-fix | deprecation | security-patch",
  "template": {
    "readme_md": "既存の README.md テンプレート"
  }
}
```

## 処理フロー

### ステップ1: Diff 解析・変更検出

diff から以下を検出：

1. **新機能の検出**
   - diff に `+ function newFeature()` が含まれている
   - または `+ class NewClass` が含まれている
   - → README に「新機能」セクションを追加すべき

2. **削除機能の検出**
   - diff に `- function oldFeature()` が含まれている
   - changeAttribute !== "deprecation"
   - → README から該当記述を削除、または「廃止」セクションへ移動

3. **既存機能の修正検出**
   - 関数シグネチャが変更（パラメータ追加・削除・型変更）
   - → README の「基本的な使い方」セクションの例を更新

4. **セキュリティパッチ検出**
   - changeAttribute === "security-patch"
   - → README に「セキュリティ更新」セクション追加

### ステップ2: README セクション特定

README の構造を認識：

```
# プロジェクト名
## 概要
## インストール
## 基本的な使い方
## 新機能（存在しない場合は作成）
## API リファレンス
## トラブルシューティング
## ライセンス
```

変更の種類に応じて対応セクションを特定

### ステップ3: 更新提案生成

```markdown
## [セクション名]: 更新理由

**section**: ## セクション名

**type**: insert | update | delete

**before**: 
```
[変更前のセクション]
```

**after**:
```
[変更後のセクション]
```

**reason**: 変更理由
```

## 出力スキーマ

```json
{
  "agentName": "readme-agent",
  "changes": [
    {
      "type": "insert | update | delete",
      "section": "セクション名（例: 新機能, 基本的な使い方）",
      "before": null or "テキスト",
      "after": "テキスト or null",
      "reason": "説明"
    }
  ],
  "confidence": 0.85,
  "requiresHumanReview": false,
  "warnings": []
}
```

## 判定ロジックの詳細

### 新機能追加時の処理

条件: diff に `+ function/class` + changeAttribute === "new-feature"

生成される README セクション例：

```markdown
### 新しい機能: multiply()

v0.2.0 で乗算関数 `multiply()` が追加されました。

#### 使い方

```js
const { multiply } = require('./math');
const result = multiply(3, 4);
console.log(result); // 12
```

#### パラメータ

- `a` (number): 第1の数値
- `b` (number): 第2の数値

#### 戻り値

- (number): a と b の乗算結果
```

### 既存機能修正時の処理

条件: パラメータ追加 + changeAttribute === "bug-fix"

「基本的な使い方」セクションを検索し、該当する例を更新

```javascript
function updateUsageExample(oldExample, newSignature, newParams) {
  // 例: join() 関数のパラメータが増えた
  // 旧: const result = join(['a', 'b', 'c']);
  // 新: const result = join(['a', 'b', 'c'], { separator: ' - ' });
  
  // 新しい使用例を生成
  const newExample = `const result = join(['a', 'b', 'c']);
// output: 'a,b,c'

// オプションで区切り文字をカスタマイズ可能
const customResult = join(['a', 'b', 'c'], { separator: ' - ' });
// output: 'a - b - c'`;
  
  return newExample;
}
```

### 削除機能の処理

条件: diff に `- function oldFeature()` + changeAttribute !== "deprecation"

1. README で該当セクションを探す（関数名で検索）
2. セクション削除、または「廃止機能」セクションへ移動

条件: diff に `- function oldFeature()` + changeAttribute === "deprecation"

1. 「廃止予告」セクション作成
2. 古い関数の説明 + 「v.X.X で削除予定」+ 代替案記載

```markdown
### 廃止予告: oldFunction()

`oldFunction()` は v0.3.0 で削除される予定です。

代わりに `newFunction()` をご利用ください：

```js
// 廃止予定（v0.3.0で削除）
const result = oldFunction(data);

// 推奨（新しい方法）
const result = newFunction(data);
```
```

### セキュリティパッチ時の処理

条件: changeAttribute === "security-patch"

README に「セキュリティ更新」セクションを追加

```markdown
## セキュリティ更新

v0.1.5 でセキュリティパッチが適用されました。
詳細は CHANGELOG.md を参照してください。

**対応内容**: [diff から脆弱性の説明を抽出]

**アップデート方法**:
```bash
npm update
```
```

## エッジケース処理

### 複数の新機能が同時に追加される場合

各機能を個別のサブセクションとして記載

```markdown
## 新機能 v0.2.0

### 新規: multiply()
[説明]

### 新規: divide()
[説明]
```

### 既存セクションの変更が複数の場所に影響する場合

例：関数パラメータ追加 → インストール手順・基本的な使い方・トラブルシューティングに影響

複数の `update` 提案を生成し、優先度付け

```javascript
function calculateUpdatePriority(change) {
  const priorityMap = {
    "基本的な使い方": 1,    // 最優先
    "新機能": 2,
    "API リファレンス": 3,
    "トラブルシューティング": 4
  };
  return priorityMap[change.section] || 5;
}
```

### README が多言語対応の場合

言語検出：日本語キャラクタ数 / 全体文字数 > 50% → 日本語
言語ごとに別提案を生成（Phase 2 以降）

## 実装上の注意

- README.md の構造は可変（セクション数・順序が異なる）
- Markdown のコードブロック内の変更は重要（diff に反映）
- 既存の使用例がある場合、完全に置き換えるのではなく「追加」を検討
- リンク（#ハッシュ）の更新は慎重に

## テスト用サンプル入力

### サンプル1: 新機能追加

**入力**: changeAttribute = "new-feature"

**diff**:
```diff
--- a/src/math.js
+++ b/src/math.js
@@ -1,5 +1,15 @@
 /**
+ * Multiply two numbers
+ * @param {number} a
+ * @param {number} b
+ * @returns {number} a * b
+ */
+function multiply(a, b) {
+  return a * b;
+}
```

**期待される README 更新提案**:
```json
{
  "changes": [
    {
      "type": "insert",
      "section": "新機能",
      "before": null,
      "after": "## 新機能\n\n### 乗算関数 multiply()\n\nv0.2.0 で乗算機能が追加されました。\n\n#### 使い方\n\n```js\nconst { multiply } = require('./math');\nconst result = multiply(3, 4);\nconsole.log(result); // 12\n```\n\n#### パラメータ\n- a (number): 第1の数値\n- b (number): 第2の数値\n\n#### 戻り値\n- (number): 乗算結果",
      "reason": "新機能追加: multiply() 関数のドキュメント"
    }
  ]
}
```

### サンプル2: パラメータ追加による既存セクション更新

**入力**: changeAttribute = "bug-fix"

**期待される README 更新提案**:
```json
{
  "changes": [
    {
      "type": "update",
      "section": "基本的な使い方",
      "before": "#### join() で複数の値を結合\n\n```js\nconst { join } = require('./utils');\nconst result = join(['a', 'b', 'c']);\nconsole.log(result); // 'a,b,c'\n```",
      "after": "#### join() で複数の値を結合\n\n```js\nconst { join } = require('./utils');\n\n// 基本的な使い方\nconst result = join(['a', 'b', 'c']);\nconsole.log(result); // 'a,b,c'\n\n// カスタム区切り文字を指定\nconst customResult = join(['a', 'b', 'c'], { separator: ' - ' });\nconsole.log(customResult); // 'a - b - c'\n```",
      "reason": "パラメータ追加: join() に options パラメータが追加されました"
    }
  ]
}
```
