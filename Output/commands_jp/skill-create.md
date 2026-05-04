---
description: "git コミット履歴を分析してコーディングパターンを抽出し、SKILL.md テンプレートを自動生成します。"
---

# スキル作成 - パターン抽出

git コミット履歴からコーディングパターンを静的解析により自動抽出し、構造化された SKILL.md ファイルを生成します。

## 使用方法

```
/skill-create <pattern-name> [--repo=<path>] [--commits=<n>] [--output=<path>]
```

### パラメータ

| パラメータ | 説明 | デフォルト |
|----------|------|---------|
| `pattern-name` | スキル名（例: `error-handling`, `auth-flow`） | 必須 |
| `--repo=<path>` | リポジトリパス | `.`（現在のディレクトリ） |
| `--commits=<n>` | 分析するコミット数 | `50` |
| `--output=<path>` | 出力ファイルパス | `./SKILL_{pattern}.md` |
| `--language=<lang>` | 言語でフィルタ | すべて |
| `--extract-tests` | テストパターンも抽出 | `false` |

## 実行フロー

### ステップ 1: 履歴分析

```bash
/skill-create error-handling --commits=100
```

分析ステップ:
```
git 履歴を分析中...
────────────────────────────────
✓ コミット総数: 248
✓ 分析対象: 最新 100 コミット
✓ 修正ファイル: 45 個
✓ 検出パターン: 12 個
```

### ステップ 2: パターン抽出

```
パターン抽出...
────────────────────────────────
1. try-catch ラッパー [出現頻度: 15]
2. カスタム Error クラス [出現頻度: 8]
3. Result<T, E> パターン [出現頻度: 12]
4. 非同期エラーハンドリング [出現頻度: 9]
5. エラーリトライロジック [出現頻度: 6]
```

### ステップ 3: テンプレート生成

```
SKILL.md を生成中...
────────────────────────────────
✓ 出力: ./SKILL_error-handling.md
✓ セクション: 5 個
✓ コード例: 12 個
✓ テスト例: 5 個
```

## 生成される SKILL.md の構成

```markdown
# エラーハンドリング スキル

## 概要
このプロジェクトでエラー処理に採用されているパターン集。

## パターン 1: カスタム Error クラス

### 説明
[git コミットから自動抽出]

### パターン
\`\`\`typescript
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}
\`\`\`

### 出現頻度
8 回（コミット: abc123, def456, ...）

### テスト例
\`\`\`typescript
it("ValidationError を throw する", () => {
  expect(() => validateEmail("invalid")).toThrow(ValidationError);
});
\`\`\`

## パターン 2: Result<T, E> パターン

### 説明
[git コミットから自動抽出]

### パターン
\`\`\`typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division by zero" };
  return { ok: true, value: a / b };
}
\`\`\`

### 出現頻度
12 回（最初: 2023-09-01, 最新: 2024-01-15）

## 関連パターン
- [非同期エラーハンドリング](#パターン-3-非同期エラーハンドリング)
- [エラーリトライロジック](#パターン-5-エラーリトライロジック)

## ベストプラクティス
[抽出されたルールと注記]

## アンチパターン
[避けるべきパターン]
```

## 使用例

### 例 1: 認証フロー パターンを抽出

```bash
/skill-create auth-flow --commits=50 --extract-tests
```

出力:
```
git 履歴を分析中...
✓ 認証フローパターン: 8 個検出
✓ テストパターン: 5 個検出
✓ 出力: SKILL_auth-flow.md
```

生成ファイル（抜粋）:
```markdown
# 認証フロー スキル

## パターン 1: JWT トークン検証

### 説明
httpOnly クッキーに保存された JWT を検証し、ユーザーコンテキストを復元。

### パターン
\`\`\`typescript
async function verifyToken(token: string): Promise<User> {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return db.users.findById(decoded.userId);
}
\`\`\`

### 出現頻度
12 回（最新: 2024-01-10）

### テスト例
\`\`\`typescript
it("有効なトークンを検証", async () => {
  const token = generateToken(user);
  const verified = await verifyToken(token);
  expect(verified.id).toBe(user.id);
});
\`\`\`
```

### 例 2: API ハンドラーパターンを抽出

```bash
/skill-create api-handler --language=typescript --commits=100
```

### 例 3: Python の非同期パターンを抽出

```bash
/skill-create async-pattern --language=python --extract-tests
```

## パターン検出アルゴリズム

### 1. 構文ツリー比較

修正ファイルの AST（抽象構文木）を分析し、類似パターンを検出:

```
修正1: try { ... } catch (e) { ... }
修正2: try { ... } catch (e) { ... }
修正3: try { ... } catch (e) { ... }

→ パターン: try-catch 構文 [頻度: 3]
```

### 2. 関数シグネチャ抽出

```
commit abc123: async function fetchUser(id: string): Promise<User>
commit def456: async function fetchProfile(id: string): Promise<Profile>
commit ghi789: async function fetchSettings(id: string): Promise<Settings>

→ パターン: async (id) => Promise<T> [頻度: 3]
```

### 3. テスト対応

コミットで修正されたテストファイルから対応する実装パターンを抽出:

```
test: "empty array を返す"
impl: items.length === 0 ? [] : ...

test: "null を返す"
impl: user === null ? null : ...

→ パターン: 条件分岐による戻り値 [頻度: 2]
```

## フィルタリングとカスタマイズ

### 言語別フィルタ

```bash
/skill-create validation --language=typescript
/skill-create database --language=sql,python
/skill-create server --language=go,rust
```

### 特定ファイルパスに限定

```bash
/skill-create api-error --path=src/api/ --commits=50
/skill-create component --path=src/components/ --extract-tests
```

### 出力形式のカスタマイズ

```bash
/skill-create pattern --output=./docs/PATTERN_name.md --format=markdown
/skill-create pattern --output=./data/pattern.json --format=json
```

JSON 形式出力例:
```json
{
  "name": "error-handling",
  "description": "...",
  "patterns": [
    {
      "name": "Custom Error",
      "frequency": 8,
      "code": "...",
      "tests": ["..."],
      "commits": ["abc123", "def456"]
    }
  ]
}
```

## 出力ファイルの活用

### ドキュメント化

生成された SKILL.md をプロジェクトドキュメントに含める:

```
docs/
├── SKILL_error-handling.md
├── SKILL_auth-flow.md
├── SKILL_api-handler.md
└── README.md  # SKILL ファイルへのリンク
```

### スキルライブラリの構築

複数のスキルを収集:

```bash
/skill-create error-handling
/skill-create auth-flow
/skill-create api-handler
/skill-create database-query

# 自動的に skills/ ディレクトリに整理
ls skills/
# error-handling.md
# auth-flow.md
# api-handler.md
# database-query.md
```

### チーム知識の共有

生成された SKILL ファイルをチームドキュメントリポジトリに追加:

```bash
git add SKILL_*.md
git commit -m "docs: git 履歴から抽出したスキルドキュメントを追加"
```

## トラブルシューティング

### パターンが検出されない場合

```bash
# より多くのコミットを分析
/skill-create pattern --commits=200

# 全コミット履歴を分析
/skill-create pattern --commits=0  # 0 = すべて
```

### 誤検出が多い場合

```bash
# 最小出現頻度を指定
/skill-create pattern --min-frequency=3

# 特定のファイルパスに限定
/skill-create pattern --path=src/lib/
```

## 関連コマンド

- `/analyze` - 特定パスを深掘り解析
- `/note` - 学習ノートを作成

## 関連

- スキル: `skills/pattern-extraction/`
- エージェント: `agents/skill-generator.md`
