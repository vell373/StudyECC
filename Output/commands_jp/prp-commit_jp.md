---
description: "自然言語ファイル対象を使用したスマートコミット — 何をコミットするかを平文英語で説明"
argument-hint: "[対象説明]（空白 = すべての変更）"
---

# Smart Commit

> PRPs-agentic-engから適応。Wirasm著。PRP ワークフローシリーズの一部。

**入力**: $ARGUMENTS

---

## フェーズ1 — 評価

```bash
git status --short
```

出力が空の場合 → 停止: 「コミットするものがありません。」

変更内容の要約を表示（追加、修正、削除、未追跡）。

---

## フェーズ2 — 解釈とステージング

`$ARGUMENTS`を解釈してステージ対象を決定:

| 入力 | 解釈 | Gitコマンド |
|---|---|---|
| *（空白/空）* | すべてをステージ | `git add -A` |
| `staged` | 既にステージされているものを使用 | *（git add なし）* |
| `*.ts` または `*.py` 等 | マッチングglobをステージ | `git add '*.ts'` |
| `except tests` | すべてをステージしてからテストを取り消す | `git add -A && git reset -- '**/*.test.*' '**/*.spec.*' '**/test_*' 2>/dev/null \|\| true` |
| `only new files` | 未追跡ファイルのみをステージ | `git ls-files --others --exclude-standard \| grep . && git ls-files --others --exclude-standard \| xargs git add` |
| `the auth changes` | ステータス/差分から解釈 — auth関連ファイルを検出 | `git add <マッチしたファイル>` |
| 特定ファイル名 | それらのファイルをステージ | `git add <ファイル>` |

自然言語入力（「auth変更」など）の場合、`git status`出力と`git diff`をクロス参照して関連ファイルを特定。ステージするファイルと理由をユーザーに表示。

```bash
git add <決定されたファイル>
```

ステージ後、確認:
```bash
git diff --cached --stat
```

何もステージされていない場合は停止: 「説明にマッチするファイルはありません。」

---

## フェーズ3 — コミット

命令法で単一行コミットメッセージを作成:

```
{type}: {説明}
```

タイプ:
- `feat` — 新機能または機能
- `fix` — バグ修正
- `refactor` — 動作変更なしのコード再構成
- `docs` — ドキュメント変更
- `test` — テストの追加または更新
- `chore` — ビルド、設定、依存関係
- `perf` — パフォーマンス改善
- `ci` — CI/CD変更

ルール:
- 命令法（「added feature」ではなく「add feature」）
- タイププレフィックス後は小文字
- 最後にピリオドなし
- 72文字以下
- 変更の「何か」を説明し、「どのように」ではなく

```bash
git commit -m "{type}: {説明}"
```

---

## フェーズ4 — 出力

ユーザーに報告:

```
コミット: {hash_short}
メッセージ:   {type}: {説明}
ファイル:     {数} ファイル変更

次のステップ:
  - git push           → リモートにプッシュ
  - /prp-pr            → プルリクエストを作成
  - /code-review       → プッシュ前にレビュー
```

---

## 例

| あなたが言う | 何が起きるか |
|---|---|
| `/prp-commit` | すべてをステージし、自動メッセージを生成 |
| `/prp-commit staged` | 既にステージされているもののみをコミット |
| `/prp-commit *.ts` | すべてのTypeScriptファイルをステージしてコミット |
| `/prp-commit except tests` | テストファイルを除くすべてをステージ |
| `/prp-commit the database migration` | ステータスからDBマイグレーションファイルを検出してステージ |
| `/prp-commit only new files` | 未追跡ファイルのみをステージ |
