---
description: "現在のブランチからGitHub プルリクエストを作成します。未プッシュコミットを自動検出して含めます。"
---

# PRP プルリクエスト作成コマンド

このコマンドは現在のブランチから GitHub プルリクエストを作成します。未プッシュコミット、ファイル変更、プロジェクト設定を自動で検出して PR に含めます。

## このコマンドの機能

1. **ブランチを検証** — 変更があり、ベースブランチと異なることを確認
2. **コミットを分析** — プッシュされていないコミットを検出
3. **ファイル変更を集計** — 追加・修正・削除ファイルを列挙
4. **PRテンプレートを検出** — プロジェクトのPRテンプレート（`.github/pull_request_template.md`）を自動適用
5. **PR タイトルと説明を生成** — コミットメッセージから自動生成、またはユーザー確認を待つ
6. **GitHub CLI で作成** — `gh pr create` でPRを作成
7. **確認URLを提示** — PR確認用URLを表示

## 使用時

```bash
/prp-pr                          # 現在のブランチからPRを作成（タイトル自動生成）
/prp-pr --draft                  # ドラフトPRを作成
/prp-pr --title "カスタムタイトル" # カスタムタイトルで作成
/prp-pr --dry-run                # PRを作成せず内容をプレビュー
```

## 動作方法

### フェーズ1: 検証（VALIDATE）

現在のブランチをチェック:

```bash
git rev-parse --abbrev-ref HEAD
```

以下の場合は停止:
- ブランチが `main` または `master` の場合: 「メインブランチからPRは作成できません。機能ブランチをチェックアウトしてください。」
- 変更がない場合: 「コミットするものがありません。」

### フェーズ2: 発見（DISCOVER）

#### ブランチ情報を取得
```bash
git log --oneline main..HEAD           # ベースブランチからの新コミット
git diff --stat main                  # ファイル変更サマリー
git status --short                    # 未ステージ変更
```

#### ファイル変更を集計

| タイプ | 検出方法 | 例 |
|--------|--------|-----|
| 追加 | `git diff --name-only --diff-filter=A main` | `src/NewComponent.tsx` |
| 修正 | `git diff --name-only --diff-filter=M main` | `src/hooks/useAuth.ts` |
| 削除 | `git diff --name-only --diff-filter=D main` | `src/deprecated.ts` |
| 改名 | `git diff --name-only --diff-filter=R main` | `src/Old.ts → src/New.ts` |

#### PRテンプレートを検出
```bash
ls -la .github/pull_request_template.md
```

存在する場合はテンプレートを読み込む。

### フェーズ3: プッシュ（PUSH）

未プッシュコミットが存在する場合、確認後にプッシュ:

```bash
git push -u origin <branch-name>
```

プッシュ前:
```
未プッシュコミット:
  - abc1234: feat: 認証機能を追加
  - def5678: fix: ログインバグを修正

リモートにプッシュしますか?（はい/いいえ）
```

### フェーズ4: 作成（CREATE）

#### PR タイトルと説明を生成

**タイトルソース（優先順）:**
1. ユーザーがカスタムタイトルを指定 → そのまま使用
2. 単一コミット → そのコミットメッセージを使用
3. 複数コミット → 最初のコミットまたは機能名を検出

例:

```
単一コミット:
  commit: feat: 認証機能を追加
  → PR title: feat: 認証機能を追加

複数コミット:
  - feat: 認証機能を追加
  - fix: ログインバグを修正
  - docs: 認証ドキュメント更新
  → PR title: feat: 認証機能を追加（最初のコミットから）
```

**説明の構成:**

テンプレートがある場合 → テンプレート + 自動填充
テンプレートがない場合 → デフォルト形式:

```markdown
## 概要
[コミットメッセージから抽出]

## 変更内容
- ファイル数: X
- 追加行: Y
- 削除行: Z

## 変更ファイル
- `src/auth/useAuth.ts` (修正)
- `src/components/LoginForm.tsx` (追加)
- `tests/auth.test.ts` (追加)

## 関連Issue
[Issue番号あれば自動検出]

## 確認項目
- [ ] テストが通っている
- [ ] ドキュメントが更新されている
- [ ] PR説明が明確である
```

#### `gh pr create` で作成

```bash
gh pr create \
  --title "タイトル" \
  --body "説明" \
  --base main
```

オプション:
- `--draft`: ドラフトPRを作成
- `--label bug,enhancement`: ラベルを追加

### フェーズ5: 確認（VERIFY）

PR作成後、以下をAPIで確認:
```bash
gh pr view --json number,url
```

### フェーズ6: 出力（OUTPUT）

ユーザーに報告:

```
## PRが作成されました

**PR情報:**
- 番号: #42
- タイトル: feat: 認証機能を追加
- ベース: main ← 現在のブランチ
- URL: https://github.com/org/repo/pull/42

**変更サマリー:**
- ファイル数: 3
- 追加: 2 / 修正: 1 / 削除: 0

**コミット:**
- feat: 認証機能を追加
- fix: ログインバグを修正

**次のステップ:**
- レビューを待つ
- `git push` でさらに変更をプッシュ
- `/code-review` でさらにレビュー実施
```

## 使用例

### 例1: 通常のPR作成

```
ユーザー: /prp-pr

アシスタント:
## PRを作成しています

**ブランチ:** feature/auth
**ベース:** main

**未プッシュコミット:**
- abc1234: feat: 認証機能を追加
- def5678: fix: ログインバグを修正

**変更ファイル:**
- `src/auth/useAuth.ts` (修正)
- `src/components/LoginForm.tsx` (追加)
- `tests/auth.test.ts` (追加)

確認項目:
- [ ] テストが通っている
- [ ] ドキュメントが更新されている

プッシュしてPRを作成しますか?（はい/いいえ）

(ユーザーが「はい」と回答)

## PRが作成されました

PR#42: feat: 認証機能を追加
URL: https://github.com/org/repo/pull/42
```

### 例2: ドラフトPRを作成

```
ユーザー: /prp-pr --draft

(同様の処理でドラフトPRを作成)

## ドラフトPRが作成されました

PR#43: feat: 認証機能を追加 (DRAFT)
URL: https://github.com/org/repo/pull/43
```

## 重要な注意事項

**必ずプッシュする**: PRを作成するにはコミットがリモートにプッシュされている必要があります。ローカルオンリーの場合、アシスタントが確認を取ってからプッシュします。

**テンプレート自動適用**: プロジェクトにPRテンプレートがある場合、自動で適用されます。

**GitHub CLI 必須**: このコマンドには `gh` コマンドがインストール済み、かつ認証済みである必要があります。

## 他のコマンドとの統合

PR作成前:
- `/prp-commit` → コミットを作成
- `/plan` / `/prp-plan` → 実装プランを確認
- `/prp-implement` → プランを実行

PR作成後:
- `/code-review` → PRの変更をレビュー
- GitHub Web UI → レビュー・マージ
