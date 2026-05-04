---
description: "Pythonコードを包括的にレビューします。PEP 8準拠、型ヒント、セキュリティを検査します。"
---

# Pythonコードレビュー

Pythonコードを包括的にレビューします。

**入力**: `$ARGUMENTS`（レビュー対象のファイル/ディレクトリ）

---

## レビュー項目

### 1. スタイル・構文（PEP 8）

| 項目 | 確認内容 | 例 |
|------|--------|-----|
| **命名規則** | 関数・変数: snake_case / クラス: PascalCase / 定数: UPPER_SNAKE_CASE | `def get_user()`, `class UserRepository`, `MAX_RETRIES` |
| **インポート順序** | 標準 → サードパーティ → ローカル（各セクション内は alfasort） | 正: `import os` / `import django` / `from . import models` |
| **行の長さ** | 79文字以下（コメント・URL除く） | 長い行はbreakして複数行に |
| **ブランク行** | クラス定義前後: 2行 / メソッド間: 1行 | 正しい: `\n\nclass Foo:\n\n  def method()` |
| **インデント** | 4スペース（タブ禁止） | 正: `    def foo():` / 誤: `\t` |
| **末尾の空白** | なし | |
| **ドキュメンテーション文字列** | モジュール・クラス・関数に `"""docstring"""` | 正: `def foo():\n    """説明."""` |

### 2. 型ヒント（Type Hints）

| レベル | 基準 | 対応方法 |
|--------|------|--------|
| **CRITICAL** | 入力・出力に型ヒントなし | `def get_user(id: int) -> User:` |
| **HIGH** | ローカル変数が `Any` 型 | 具体型に変更 |
| **MEDIUM** | 複雑な戻り値が不明確 | `Union`, `Optional` で明示 |

例:

```python
# 誤: 型がない
def get_user(id):
    ...

# 正: 型ヒント付き
from typing import Optional

def get_user(id: int) -> Optional[User]:
    ...
```

### 3. セキュリティ

| カテゴリ | 確認内容 | リスク |
|---------|--------|--------|
| **シークレット** | APIキー・パスワードがコードに直書き | CRITICAL |
| **SQL インジェクション** | 文字列連結でSQL実行 | CRITICAL |
| **入力バリデーション** | 外部入力（request.args等）をバリデーション無し | HIGH |
| **エラーメッセージ** | スタックトレース・DB情報を外部公開 | HIGH |
| **認証・認可** | デフォルト公開エンドポイント | HIGH |
| **依存関係** | 既知の脆弱性パッケージ | MEDIUM |

例:

```python
# 誤: SQLインジェクション脆弱性
query = f"SELECT * FROM users WHERE id = {user_id}"

# 正: パラメータバインディング
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### 4. エラーハンドリング

| パターン | 評価 | 推奨 |
|---------|------|------|
| `try/except:` 空ブロック | CRITICAL | 最低でもログを記録 |
| `except Exception:` 汎用 | HIGH | 具体的な例外型を指定 |
| 予期しないエラーが握りつぶされる | HIGH | ログ記録して再raise |
| 独自例外クラスなし | MEDIUM | ドメイン層に集約 |

例:

```python
# 誤: 握りつぶし
try:
    user = get_user(id)
except:
    pass

# 正: ログを記録
import logging
try:
    user = get_user(id)
except UserNotFoundError as e:
    logging.error(f"User {id} not found: {e}")
    raise
```

### 5. パフォーマンス

| 項目 | 確認内容 | 例 |
|------|--------|-----|
| **N+1 クエリ** | ループ内で DB クエリ | `for user in users: fetch_profile(user.id)` → 悪い |
| **不要なコピー** | リスト・辞書の無駄なコピー | `list(list_var)` は不要か確認 |
| **同期処理のシリアル化** | 並列化できる処理が順序実行 | `await gather()` で並列化 |

### 6. テスト（カバレッジ）

| パターン | 評価 |
|---------|------|
| テスト > ドメイン層カバレッジ 80% | OK |
| テスト < ドメイン層カバレッジ 50% | WARN |
| テストなし | CRITICAL |

### 7. 単一責任・関数設計

| パターン | 評価 | 推奨 |
|---------|------|------|
| 関数 > 50 行 | WARN | 関数分割 |
| クラス > 10 メソッド | WARN | 責務分離 |
| ファイル > 300 行 | WARN | ファイル分割 |

---

## レビュープロセス

### ステップ1: ファイルを走査

```bash
find . -name "*.py" -type f | head -50
```

対象:
- `src/`, `app/`, `backend/` などのメインディレクトリ
- テストファイル（`tests/`, `test_*.py`）は含める

### ステップ2: 各ファイルを解析

ファイルごとに以下をチェック:

1. **ヘッダー**: `from __future__ import annotations` がある？
2. **インポート**: 順序と重複がない？
3. **関数・クラス**: 型ヒント、docstring、サイズは OK？
4. **セキュリティ**: SQL、認証、シークレット問題がない？
5. **エラーハンドリング**: 例外が捕捉・ログされている？

### ステップ3: 問題を分類

| レベル | 判定 | 対応 |
|--------|------|------|
| CRITICAL | セキュリティ / 機能破損 | コミット前に必ず修正 |
| HIGH | スタイル / 型ヒント欠落 | 修正推奨 |
| MEDIUM | 最適化 / テスト不足 | PR コメント |

### ステップ4: レポートを生成

```markdown
# Pythonコードレビュー

**ファイル数:** 24
**問題数:** 3 CRITICAL, 8 HIGH, 5 MEDIUM

## CRITICAL

### 1. `src/auth.py:45` — SQLインジェクション脆弱性
```python
# 誤
query = f"SELECT * FROM users WHERE email = '{email}'"
```
**修正:**
```python
# 正
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```

## HIGH

### 1. `src/services/user.py:12` — 型ヒントなし
```python
def get_user(id):  # 型情報がない
    ...
```
**修正:**
```python
def get_user(id: int) -> Optional[User]:
    ...
```

## MEDIUM

### 1. `tests/test_user.py:5` — テストカバレッジ不足
UserService のカバレッジ: 45%（目標: 80%以上）

---

## 推奨次ステップ
1. CRITICAL 問題を修正
2. テストを追加（カバレッジ 80%目標）
3. 型ヒントを完成させる
```

---

## 使用例

### 例1: 単一ファイルをレビュー

```
ユーザー: /python-review src/auth.py

アシスタント:
# Pythonコードレビュー: src/auth.py

## 分析結果

**ファイル統計:**
- 行数: 142
- 関数: 5
- クラス: 1

## 問題

### CRITICAL (1)

**セキュリティ: SQLインジェクション脆弱性**
```python
# Line 45
query = f"SELECT * FROM users WHERE email = '{email}'"
```
修正: パラメータバインディングを使用

### HIGH (2)

**型ヒント欠落: get_user()**
```python
# Line 12
def get_user(id):
```
修正: `def get_user(id: int) -> Optional[User]:`

**エラーハンドリング: ブロック空白**
```python
# Line 89
except Exception:
    pass
```
修正: ログを記録して再raise

## 推奨
- CRITICAL を修正（セキュリティ）
- 全関数に型ヒントを追加
- エラーハンドリングを改善
```

### 例2: ディレクトリ全体をレビュー

```
ユーザー: /python-review src/

## レビュー完了

**対象:** src/ (24 ファイル)

**結果:**
- CRITICAL: 3
- HIGH: 8
- MEDIUM: 5

[詳細レポート]
```

---

## 出力フォーマット

```markdown
# Pythonコードレビュー: {ファイル/ディレクトリ}

## サマリー
- ファイル数: X
- 行数: Y
- 問題数: CRITICAL X, HIGH Y, MEDIUM Z

## CRITICAL
[各問題のコードブロック + 修正案]

## HIGH
[各問題のコードブロック + 修正案]

## MEDIUM
[推奨項目]

## 推奨次ステップ
1. CRITICAL を修正
2. HIGH を修正
3. テストを追加
4. `mypy --strict` で型チェック
```

---

## ツール連携

```bash
# 自動チェック
mypy --strict .           # 型チェック
pylint src/               # リント
black --check .           # フォーマット（dry-run）
bandit -r src/            # セキュリティスキャン
coverage run -m pytest    # テストカバレッジ
```

---

## 重要ルール

1. **セキュリティ最優先**: CRITICAL レベルの問題は許可しない
2. **型ヒント必須**: `Any` を許さない。`unknown` + 型ガード を使用
3. **テスト必須**: ドメイン層は 80%+ カバレッジ
4. **エラーを握りつぶさない**: 例外は記録して再raise
5. **本番環境への出荷前に**: 必ず完全なレビューを実施
