---
description: "自然言語ファイルターゲティングによるクイックコミット — コミットする内容を平文英語で説明する"
argument-hint: "[ターゲット説明]（空白 = すべての変更）"
---

# Smart Commit

> Wirasm による PRPs-agentic-eng から適応。PRP ワークフローシリーズの一部。

**入力**: $ARGUMENTS

---

## フェーズ1 — 評価

```bash
git status --short
```

出力が空の場合 → 停止: 「コミットするものがありません。」

変更内容のサマリーをユーザーに表示（追加、変更、削除、未追跡）。

---

## フェーズ2 — 解釈とステージ

`$ARGUMENTS` を解釈してステージするものを決定:

| 入力 | 解釈 | Git コマンド |
|---|---|---|
| *（空白/空）* | すべてをステージ | `git add -A` |
| `staged` | 既にステージされている内容を使用 | *（git add なし）* |
| `*.ts` または `*.py` など | マッチするグロブをステージ | `git add '*.ts'` |
| `except tests` を除く | すべてをステージ、その後テストをアンステージ | `git add -A && git reset -- '**/*.test.*' '**/*.spec.*' '**/test_*' 2>/dev/null \|\| true` |
| `only new files` | 未追跡ファイルのみをステージ | `git ls-files --others --exclude-standard \| grep . && git ls-files --others --exclude-standard \| xargs git add` |
| `the auth changes` のような | ステータス/diff から解釈 — 認証関連ファイルを検出 | `git add <マッチされたファイル>` |
| 特定のファイル名 | それらのファイルをステージ | `git add <ファイル>` |

自然言語入力（「認証の変更」など）については、`git status` 出力と `git diff` をクロスリファレンスして関連ファイルを特定します。ステージするファイルとその理由をユーザーに表示してください。

```bash
git add <決定されたファイル>
```

ステージ後、検証:
```bash
git diff --cached --stat
```

ステージされたものがない場合、停止: 「説明に一致するファイルがありません。」

---

## フェーズ3 — コミット

命令型の単一行コミットメッセージを作成:

```
{type}: {description}
```

タイプ:
- `feat` — 新機能または機能
- `fix` — バグ修正
- `refactor` — 動作の変更なしでのコード再構成
- `docs` — ドキュメント変更
- `test` — テストの追加または更新
- `chore` — ビルド、コンフィグ、依存関係
- `perf` — パフォーマンス改善
- `ci` — CI/CD 変更

ルール:
- 命令型（「機能を追加」ではなく「機能を追加」）
- タイプ接尾辞の後は小文字
- 最後にピリオドなし
- 72 文字以下
- 変更が何か説明（どうやって変更したか説明ではなく）

```bash
git commit -m "{type}: {description}"
```

---

## フェーズ4 — 出力

ユーザーに報告:

```
コミット: {hash_short}
メッセージ:   {type}: {description}
ファイル:     {count} ファイル変更

次のステップ:
  - git push           → リモートへプッシュ
  - /prp-pr            → プルリクエストを作成
  - /code-review       → プッシュ前にレビュー
```

---

## 例

| 入力 | 動作 |
|---|---|
| `/prp-commit` | すべてをステージし、メッセージを自動生成 |
| `/prp-commit staged` | ステージされているもののみをコミット |
| `/prp-commit *.ts` | すべての TypeScript ファイルをステージしてコミット |
| `/prp-commit except tests` | テストファイルを除くすべてをステージ |
| `/prp-commit the database migration` | ステータスから DB マイグレーションファイルを検出、ステージ |
| `/prp-commit only new files` | 未追跡ファイルのみをステージ |
