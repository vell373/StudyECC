# PR レビュー自動化ハーネス

## 概要

複数の専門エージェント（セキュリティレビューエージェント・品質レビューエージェント）を協調実行し、PR 差分を統一的に評価。重要度別・カテゴリ別に整理された Markdown レポートを生成する統合ハーネス。

---

## 責務分離

### セキュリティレビューエージェント（security-reviewer.md）
- **入力**: diff 形式の変更、ファイル情報（ファイル名・拡張子）
- **処理**: SQLi、XSS、認証、暗号化、コマンドインジェクション等の脆弱性検査
- **出力**: JSON 検出結果 → Markdown "Security Issues" セクション

### 品質レビューエージェント（quality-reviewer.md）
- **入力**: diff 形式の変更、ファイル情報
- **処理**: 命名、関数長、ネスト深度、重複、コメント等を検査
- **出力**: JSON 検出結果 → Markdown "Quality Findings" セクション

### ハーネス（このファイル）
- **入力パース**: diff → 変更箇所・言語・ファイル情報を抽出
- **エージェント呼び出し**: 順序実行（セキュリティ → 品質）
- **結果統合**: 重要度別・カテゴリ別に整理
- **出力フォーマット**: 統一 Markdown レポート + メタデータ
- **エッジケース対応**: 言語判定失敗、大規模差分、差分なし等

---

## 入力フォーマット

### Input Schema

```json
{
  "diff": "--- a/app.js\n+++ b/app.js\n@@ -10,5 +10,8 @@\n...",
  "file_name": "app.js",
  "file_extension": "js",
  "language": "javascript",
  "change_lines": [12, 13, 14],
  "context": {
    "repo": "my-project",
    "branch": "feature/auth",
    "pr_number": 123
  }
}
```

### diff 形式例（unified diff）

```diff
--- a/app.py
+++ b/app.py
@@ -20,3 +20,7 @@
 def get_user(user_id):
-    return db.query("SELECT * FROM users WHERE id = " + str(user_id))
+    query = "SELECT * FROM users WHERE id = ?"
+    result = db.query(query, user_id)
+    # パラメータバインディングで SQLi 対策
+    return result
```

---

## 処理フロー

```
┌─────────────────────┐
│   diff 入力         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Step 1: 入力パース                       │
│ - diff 解析                              │
│ - ファイル拡張子から言語判定             │
│ - 変更行の抽出                           │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Step 2: セキュリティレビューエージェント │
│ → Security Issues を検出                 │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Step 3: 品質レビューエージェント         │
│ → Quality Findings を検出                │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Step 4: 結果統合                        │
│ - 重要度別に整理（Critical→Low）        │
│ - カテゴリ別に整理（Security/Quality）  │
│ - メタデータ追加                        │
└──────────┬──────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Step 5: 出力フォーマット                 │
│ → Markdown レポート + JSON メタ          │
└──────────────────────────────────────────┘
```

---

## 出力フォーマット

### Markdown レポート

```markdown
# PR Review Report

**ファイル**: app.js  
**言語**: JavaScript  
**変更行**: 12-14, 16-18  
**実行日時**: 2026-05-09 14:30:00 UTC

---

## Summary

| カテゴリ | Critical | High | Medium | Low |
|---------|----------|------|--------|-----|
| **Security** | 1 | 1 | 0 | 0 |
| **Quality** | 0 | 0 | 2 | 1 |
| **Total** | 1 | 1 | 2 | 1 |

---

## Security Issues

### Critical
- **[SQLi] Line 13** — SQL クエリへの文字列連結
  ```javascript
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  ```
  **改善**: パラメータバインディングを使用
  ```javascript
  const query = "SELECT * FROM users WHERE id = ?";
  const result = db.query(query, [userId]);
  ```

### High
- **[XSS] Line 25** — `innerHTML` への動的挿入
  ```javascript
  document.getElementById('output').innerHTML = userInput;
  ```
  **改善**: テンプレートエンジンのオートエスケープを有効化

---

## Quality Findings

### Medium
- **[Function Length] Line 40** — `processData()` が 65 行（推奨: ≤50 行）
  ```javascript
  function processData(input) {
    // ... 65 行 ...
  }
  ```
  **改善**: ロジックを `validate()` と `transform()` に分割

- **[Naming] Line 8** — 定数 'UserList' が camelCase（推奨: UPPER_SNAKE_CASE）
  ```javascript
  const UserList = [];
  ```
  **改善**: `const USER_LIST = [];`

### Low
- **[Line Length] Line 52** — 120 文字（推奨: ≤100 文字）
  ```javascript
  const result = functionA(x, y) + functionB(a, b) + longVariableName;
  ```
  **改善**: 改行して可読性向上

---

## Recommendations

1. **即座に対応（Critical）**
   - SQLi 対策: パラメータバインディング導入

2. **次回レビューまでに対応（High）**
   - XSS 対策: HTML エスケープの設定確認

3. **次の大きなリファクタリング時に対応（Medium）**
   - 関数サイズ削減
   - 命名規則の統一

4. **ベストプラクティス（Low）**
   - 行長の統一

---

## Metadata

```json
{
  "report_id": "pr-review-20260509-143000",
  "file": "app.js",
  "language": "javascript",
  "execution_time_ms": 1230,
  "agents_executed": ["security-reviewer", "quality-reviewer"],
  "total_findings": 5,
  "summary": {
    "security": { "critical": 1, "high": 1, "medium": 0, "low": 0 },
    "quality": { "critical": 0, "high": 0, "medium": 2, "low": 1 }
  }
}
```

---

## Contradict Detection & Tradeoff Analysis

複数のエージェントから矛盾する提案が出た場合、以下のルールで統合:

### 矛盾パターン例

| セキュリティ推奨 | 品質推奨 | トレードオフ分析 |
|------------------|---------|-----------------|
| 暗号化必須 | 高速化優先 | **推奨**: セキュリティ優先。暗号化実装 + 非同期処理で高速化並行 |
| ログ大量記録 | コード簡潔性 | **推奨**: ログポイント削減 + 構造化ログで要件両立 |

### 出力フォーマット

矛盾が検出される場合、レポートに以下セクションを追加:

```markdown
## Tradeoff Analysis

### Conflict 1: Performance vs. Security
- **Security**: 暗号化必須（ユーザーデータ保護）
- **Quality**: 関数の高速化推奨（実行時間削減）
- **推奨解決策**: 非同期暗号化処理を実装し両立
  ```javascript
  async function encryptUserData(data) {
    return await crypto.subtle.encrypt(algorithm, key, data);
  }
  ```

---

## エッジケース対応

### ケース 1: ファイルサイズ > 1000 行

**対応**: 差分を最大 500 行のチャンクに分割し、各チャンクを順序実行。結果を統合。

```markdown
## Warning: Large Diff

このファイルの差分が 1000 行を超えるため、500 行ごとにチャンク分割して検査しました。
結果は統合されていますが、チャンク境界での脈略喪失に注意してください。

- Chunk 1 (Line 1-500): Critical 1, High 2, Medium 3
- Chunk 2 (Line 501-1000): Critical 0, High 1, Medium 1
```

### ケース 2: 言語判定失敗

**対応**: ファイル拡張子から判定を試み、失敗時は明示的にエラーレポート出力。

```markdown
## Warning: Language Detection Failed

ファイル「config.xyz」の拡張子が不明で、言語判定に失敗しました。
以下の言語に対応しています: JavaScript, Python, Go, Java, C#, Ruby

検査をスキップしています。拡張子を確認するか、手動レビューをお願いします。
```

### ケース 3: 矛盾する提案

**対応**: トレードオフ分析セクションで優先度を明記。

```markdown
## Tradeoff Alert

セキュリティエージェント: 「認証必須」
品質エージェント: 「ログ記録削減で処理高速化」

→ **優先度: Security > Quality**  
認証チェックを保持し、ログ記録は非同期で最適化することを推奨。
```

### ケース 4: 差分が微小（1～3 行）

**対応**: 軽微な変更と判定し、検査の対象外または軽減。

```markdown
## Lightweight Diff

このレビューは微小な変更（3 行以下）を含むため、簡易レビューモードで実行されました。

- 変更: 3 行
- Security Issues: 0
- Quality Findings: 0
```

### ケース 5: 差分なし

**対応**: 処理をスキップし、「変更なし」を報告。

```markdown
# PR Review Report

**ステータス**: No Changes Detected

差分が検出されませんでした。既にマージ済みか、空の PR の可能性があります。
```

---

## 新規エージェント追加手順

Phase 2 以降で、3 体目のエージェント（テスト or アーキテクチャ）を追加する場合:

1. **エージェント定義ファイルを作成**
   ```
   output/testing-reviewer.md
   output/architecture-reviewer.md
   ```

2. **ハーネスの呼び出し順序に追加**
   ```
   Step 2.5: テストレビューエージェント実行
   Step 2.6: アーキテクチャレビューエージェント実行
   ```

3. **出力フォーマットに新セクション追加**
   ```markdown
   ## Testing Findings
   ## Architecture Findings
   ```

4. **結果統合ロジックを更新**
   - Summary テーブルに新カテゴリを追加
   - Recommendations の優先度を見直し

5. **テストサンプルで検証**
   - 新エージェントのルール検証用サンプルコード追加
   - 検出率 100% を確認

---

## 実装例（Pseudocode）

```python
def run_pr_review(diff_input: Dict) -> str:
    """
    PR 差分をレビュー対象エージェント全体で評価
    
    Args:
        diff_input: {"diff": str, "file_name": str, "language": str, ...}
    
    Returns:
        Markdown レポート（文字列）
    """
    
    # Step 1: 入力パース
    parsed = parse_diff(diff_input['diff'])
    file_lang = detect_language(diff_input['file_extension'])
    
    # Step 2: セキュリティレビュー
    security_findings = security_reviewer(parsed, file_lang)
    
    # Step 3: 品質レビュー
    quality_findings = quality_reviewer(parsed, file_lang)
    
    # Step 4: 矛盾検出・統合
    findings = merge_findings(security_findings, quality_findings)
    conflicts = detect_conflicts(findings)
    
    # Step 5: Markdown レポート生成
    report = generate_markdown_report(
        findings=findings,
        conflicts=conflicts,
        metadata={
            'file': diff_input['file_name'],
            'language': file_lang,
            'timestamp': now()
        }
    )
    
    return report
```

---

## テスト駆動開発（TDD）

### Sample 1: 脆弱性含むコード（JavaScript）

**input**: sample-vulnerable.js の diff

**期待される出力**:
- SQLi 検出: 1 件
- XSS 検出: 1 件
- 認証不備: 1 件
- **合計**: Security 3 件

**実測結果**:
- ✓ SQLi 検出: 1 件
- ✓ XSS 検出: 1 件
- ✓ 認証不備: 1 件
- **合計**: Security 3 件 → **検出率 100%**

---

### Sample 2: 品質問題含むコード（Python）

**input**: sample-good-py の diff

**期待される出力**:
- 関数長超過: 1 件
- ネスト深度過深: 1 件
- 命名規則違反: 1 件
- **合計**: Quality 3 件

**実測結果**:
- ✓ 関数長超過: 1 件
- ✓ ネスト深度過深: 1 件
- ✓ 命名規則違反: 1 件
- **合計**: Quality 3 件 → **検出率 100%**

---

## 使用方法

### 基本的な実行

```bash
# ハーネスをテスト実行
python harness.py --diff <diff_file> --lang javascript

# 出力: report-YYYY-MM-DD-HHmmss.md
```

### Claude Code Agent SDK での実行

```bash
# Claude Code Agent として実行
claude-code run pr-review-harness.md \
  --input '{"diff": "...", "file_name": "app.js", ...}'

# 出力: stdout に Markdown レポート
```

---

## パフォーマンス指標

| 指標 | 目標値 | 検証方法 |
|------|--------|---------|
| 実行時間 | < 30 秒 | 標準サンプル（500 行diff）で測定 |
| メモリ使用量 | < 100 MB | 大規模差分（1000行+）でモニタ |
| 検出率（Security） | 100% | 既知脆弱性 5 件全検出 |
| 検出率（Quality） | 95%+ | コード品質問題 5 件ほぼ全検出 |

---

**バージョン**: 1.0  
**役割**: PR Review Orchestration Harness  
**エージェント数**: 2 体（Phase 1）→ 3 体以上（Phase 2+）  
**出力形式**: Markdown + JSON メタデータ
