---
description: "敵対的なデュアルレビューの収束ループを実行し、コード承認を得るために 2 つの独立したモデルレビューアーの両方の同意が必要です。"
---

# Santa Loop - 敵対的デュアルレビュー

コード品質を保証するために、2 つの独立したモデルレビューアーの相互検証により、矛盾を解決し、承認に到達します。

## コンセプト

**Santa Loop** は「NICE（悪い）」と「NAUGHTY（良い）」のアプローチを模倣します:

- **Claude Opus**（厳しい批評家）が `review-strict.md` を生成 - 潜在的な問題をすべて指摘
- **外部モデル**（建設的なレビュー者）が `review-external.md` を生成 - 実装の強みに焦点
- **収束ループ**: 両方が同意するまで、異なる検出結果について議論
- **承認**: 両方の署名で「このコードは承認可能」に同意した場合のみ

## 使用方法

```
/santa-loop <PR番号またはファイルパス>
```

PR が指定されない場合は、現在のブランチの変更をレビューします。

## プロセス

### ステップ 1: Opus レビュー（厳しい）

```bash
Opus レビュー: CRITICAL 問題のみを探す

検出:
1. [CRITICAL] src/auth.ts:45 - 認証トークンが localhost にハードコード
2. [CRITICAL] src/db.ts:12 - SQL インジェクション脆弱性
3. [HIGH] src/api.ts:28 - エラーメッセージが内部ステータスを公開
```

### ステップ 2: 外部レビュー（建設的）

```bash
外部モデル レビュー: 実装の強みと実行可能性に焦点

検出:
1. パターン [GOOD] - リポジトリパターンにより正しくデータベースアクセスを分離
2. テスト [GOOD] - ドメイン層に包括的なユニットテストあり
3. エラー処理 [CONCERN] - 例外が一貫して記録されていない可能性がある
```

### ステップ 3: 発散の特定

```
Opus が見つけたが外部が見落とした:
- [CRITICAL] トークンのハードコード
- [CRITICAL] SQL インジェクション

外部が見つけたが Opus が見落とした:
- [GOOD] リポジトリ分離
- [GOOD] ユニットテスト
- [CONCERN] 例外ログ

合意:
- テストカバレッジが良い
- エラー処理は改善が必要
```

### ステップ 4: マージ判定

**どちらのレビューも 1 つ以上の CRITICAL 問題を含む場合:**
```
Status: BLOCKED
Required: CRITICAL 問題をすべて修正

修正ステップ:
1. localStorage → 環境変数で認証トークンを移動
2. SQL クエリをパラメータバインディングに変更
3. エラーレスポンスから内部情報を削除
```

**CRITICAL 問題がない場合:**
```
Status: APPROVED
両方のレビューアーが同意

署名:
- Opus: ✓ APPROVED（セキュリティリスク認可）
- External: ✓ APPROVED（実装品質）
```

## レビュー基準

### Opus が焦点を当てる（批評家）
- セキュリティ脆弱性（SQL インジェクション、XSS、認証バイパス）
- メモリ/リソースリーク
- エラーハンドリング欠落
- 競合状態・デッドロック
- パフォーマンス低下
- 回帰テスト欠落

### 外部が焦点を当てる（建設的）
- 保守性・可読性
- 既存パターンへの適合性
- テストカバレッジ
- ドキュメント品質
- API 設計
- 段階的な廃止パス

## 設定例

```yaml
# .santa-loop.yml
opus_config:
  model: claude-opus
  focus:
    - security
    - performance
    - error_handling
  severity_threshold: critical

external_config:
  model: external-reviewer  # GPT-4 / Gemini など
  focus:
    - maintainability
    - compatibility
    - test_coverage
  severity_threshold: medium

convergence:
  max_iterations: 3
  agreement_required: true
  blocking_severity: critical
```

## 出力例

````text
レビュー対象: PR #45 - ユーザー認証の実装

════════════════════════════════════════════

## Opus レビュー（厳しい批評家）

### CRITICAL
- src/auth.ts:45: 認証トークンが `localhost` にハードコード
  ```typescript
  const token = "sk-abc123def456";  // 本番環境で危険
  ```
- src/db.ts:12: SQL インジェクション
  ```javascript
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  ```

### HIGH
- src/api.ts:28: エラーが内部詳細を公開
  ```javascript
  catch (e) { res.send(e.stack); }
  ```

════════════════════════════════════════════

## 外部レビュー（建設的）

### GOOD
- リポジトリパターンでデータベースアクセスを適切に分離
- ドメイン層に 85% のテストカバレッジ
- エラーハンドリングの構造は適切

### CONCERN
- ロギング が一貫していない可能性がある
- 認証フローが複雑で、可視化図があると良い

════════════════════════════════════════════

## 収束結果

### Opus が見つけたが外部が見落とした
- SQL インジェクション脆弱性
- トークンのハードコード
- エラーメッセージの公開

### 外部が見つけたが Opus が見落とした
- テストカバレッジの強み
- リポジトリの良い分離

### 両者が同意したこと
- ロギングは改善が必要
- テスト構造は良い

════════════════════════════════════════════

## マージ判定

**Status: BLOCKED - CRITICAL 問題あり**

修正が必要:
1. SQL インジェクション → パラメータバインディングで修正
2. トークンのハードコード → 環境変数に移動
3. エラー公開 → 内部情報を削除

修正後に再レビュー実行

署名:
- Opus: ✗ REJECTED（セキュリティリスク）
- External: ✓ APPROVED（実装は良い）
```

## 衝突解決ガイド

| 衝突シナリオ | 判定 | アクション |
|-----------|------|---------|
| Opus: CRITICAL / External: APPROVED | BLOCKED | Opus の指摘を修正してから merge |
| Opus: APPROVED / External: HIGH | APPROVED | 外部の懸念を注記として記録 |
| Opus: CRITICAL / External: CRITICAL（異なる理由） | BLOCKED | 両方修正が必要 |
| 両者が APPROVED | APPROVED | merge 可能 |

## 関連コマンド

- `/review-pr` - 単一レビューパイプライン
- `/code-review` - 詳細なコード分析

## 関連

- エージェント: `agents/santa-loop-processor.md`
- スキル: `skills/review-comparison/`
