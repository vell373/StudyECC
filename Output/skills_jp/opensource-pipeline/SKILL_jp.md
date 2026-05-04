---
name: opensource-pipeline
description: "オープンソース公開パイプライン: プライベートプロジェクトをフォーク・サニタイズ・パッケージ化して安全に公開リリース。3つのエージェント（forker、sanitizer、packager）を連鎖。トリガー: '/opensource'、'open source this'、'make this public'、'prepare for open source'。"
origin: ECC
---

# オープンソース公開パイプライン スキル

3段階パイプラインを通じて任意のプロジェクトを安全にオープンソース化: **フォーク**（シークレットを削除）→ **サニタイズ**（クリーン状態を確認）→ **パッケージ化**（CLAUDE.md + setup.sh + README）。

## アクティベートするタイミング

- ユーザーが「このプロジェクトをオープンソース化して」または「公開したい」と言う場合
- プライベートリポジトリを公開リリース向けに準備したい場合
- GitHubにプッシュする前にシークレットを削除する必要がある場合
- ユーザーが `/opensource fork`、`/opensource verify`、または `/opensource package` を呼び出した場合

## コマンド

| コマンド | アクション |
|---------|--------|
| `/opensource fork PROJECT` | フルパイプライン: フォーク + サニタイズ + パッケージ化 |
| `/opensource verify PROJECT` | 既存リポジトリでサニタイザーを実行 |
| `/opensource package PROJECT` | CLAUDE.md + setup.sh + README を生成 |
| `/opensource list` | ステージング済みプロジェクトを全表示 |
| `/opensource status PROJECT` | ステージング済みプロジェクトのレポートを表示 |

## プロトコル

### /opensource fork PROJECT

**フルパイプライン — メインワークフロー。**

#### ステップ1: パラメーターの収集

プロジェクトパスを解決する。PROJECT に `/` が含まれる場合はパス（絶対パスまたは相対パス）として扱う。そうでない場合は: カレントディレクトリ、`$HOME/PROJECT` の順に確認し、見つからなければユーザーに確認する。

```
SOURCE_PATH="<解決された絶対パス>"
STAGING_PATH="$HOME/opensource-staging/${PROJECT_NAME}"
```

ユーザーに以下を確認:
1. 「どのプロジェクトですか？」（見つからない場合）
2. 「ライセンスは？ (MIT / Apache-2.0 / GPL-3.0 / BSD-3-Clause)」
3. 「GitHubのorgまたはユーザー名は？」（デフォルト: `gh api user -q .login` で検出）
4. 「GitHubリポジトリ名は？」（デフォルト: プロジェクト名）
5. 「READMEの説明文は？」（プロジェクトを分析して提案）

#### ステップ2: ステージングディレクトリの作成

```bash
mkdir -p $HOME/opensource-staging/
```

#### ステップ3: Forkerエージェントの実行

`opensource-forker` エージェントをスポーン:

```
Agent(
  description="Fork {PROJECT} for open-source",
  subagent_type="opensource-forker",
  prompt="""
Fork project for open-source release.

Source: {SOURCE_PATH}
Target: {STAGING_PATH}
License: {chosen_license}

Follow the full forking protocol:
1. Copy files (exclude .git, node_modules, __pycache__, .venv)
2. Strip all secrets and credentials
3. Replace internal references with placeholders
4. Generate .env.example
5. Clean git history
6. Generate FORK_REPORT.md in {STAGING_PATH}/FORK_REPORT.md
"""
)
```

完了を待つ。`{STAGING_PATH}/FORK_REPORT.md` を読む。

#### ステップ4: Sanitizerエージェントの実行

`opensource-sanitizer` エージェントをスポーン:

```
Agent(
  description="Verify {PROJECT} sanitization",
  subagent_type="opensource-sanitizer",
  prompt="""
Verify sanitization of open-source fork.

Project: {STAGING_PATH}
Source (for reference): {SOURCE_PATH}

Run ALL scan categories:
1. Secrets scan (CRITICAL)
2. PII scan (CRITICAL)
3. Internal references scan (CRITICAL)
4. Dangerous files check (CRITICAL)
5. Configuration completeness (WARNING)
6. Git history audit

Generate SANITIZATION_REPORT.md inside {STAGING_PATH}/ with PASS/FAIL verdict.
"""
)
```

完了を待つ。`{STAGING_PATH}/SANITIZATION_REPORT.md` を読む。

**FAIL の場合:** 問題点をユーザーに提示。「修正して再スキャンしますか、それとも中断しますか？」と確認。
- 修正する場合: 修正を適用し、サニタイザーを再実行（最大3回まで再試行 — 3回FAILした後は全問題点を提示してユーザーに手動修正を依頼）
- 中断する場合: ステージングディレクトリをクリーンアップ

**PASS または PASS WITH WARNINGS の場合:** ステップ5に進む。

#### ステップ5: Packagerエージェントの実行

`opensource-packager` エージェントをスポーン:

```
Agent(
  description="Package {PROJECT} for open-source",
  subagent_type="opensource-packager",
  prompt="""
Generate open-source packaging for project.

Project: {STAGING_PATH}
License: {chosen_license}
Project name: {PROJECT_NAME}
Description: {description}
GitHub repo: {github_repo}

Generate:
1. CLAUDE.md (commands, architecture, key files)
2. setup.sh (one-command bootstrap, make executable)
3. README.md (or enhance existing)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```

#### ステップ6: 最終確認

ユーザーに以下を提示:
```
オープンソースフォーク準備完了: {PROJECT_NAME}

場所: {STAGING_PATH}
ライセンス: {license}
生成されたファイル:
  - CLAUDE.md
  - setup.sh (実行可能)
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example ({N} 変数)

サニタイズ結果: {sanitization_verdict}

次のステップ:
  1. 確認: cd {STAGING_PATH}
  2. リポジトリ作成: gh repo create {github_org}/{github_repo} --public
  3. プッシュ: git remote add origin ... && git push -u origin main

GitHubへの公開を続けますか？ (yes/no/review first)
```

#### ステップ7: GitHub公開（ユーザー承認後）

```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```

---

### /opensource verify PROJECT

サニタイザーを独立して実行する。パスを解決: PROJECT に `/` が含まれる場合はパスとして扱う。そうでない場合は `$HOME/opensource-staging/PROJECT`、次に `$HOME/PROJECT`、カレントディレクトリの順に確認。

```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="Verify sanitization of: {resolved_path}. Run all 6 scan categories and generate SANITIZATION_REPORT.md."
)
```

---

### /opensource package PROJECT

パッケージャーを独立して実行する。「ライセンスは？」と「説明文は？」を確認してから:

```
Agent(
  subagent_type="opensource-packager",
  prompt="Package: {resolved_path} ..."
)
```

---

### /opensource list

```bash
ls -d $HOME/opensource-staging/*/
```

各プロジェクトをパイプライン進捗とともに表示（FORK_REPORT.md、SANITIZATION_REPORT.md、CLAUDE.md の存在確認）。

---

### /opensource status PROJECT

```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```

## ステージングレイアウト

```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # forkerエージェントから
    SANITIZATION_REPORT.md   # sanitizerエージェントから
    CLAUDE.md                # packagerエージェントから
    setup.sh                 # packagerエージェントから
    README.md                # packagerエージェントから
    .env.example             # forkerエージェントから
    ...                      # サニタイズ済みプロジェクトファイル
```

## アンチパターン

- ユーザー承認なしに GitHubへプッシュしない
- サニタイザーをスキップしない — サニタイザーはセーフティゲート
- クリティカルな問題を修正せずにサニタイザーFAIL後に進まない
- ステージングディレクトリに `.env`、`*.pem`、`credentials.json` を残さない

## ベストプラクティス

- 新規リリースには常にフルパイプライン（フォーク → サニタイズ → パッケージ化）を実行する
- ステージングディレクトリは明示的にクリーンアップされるまで残る — レビューに活用する
- 公開前に手動修正後サニタイザーを再実行する
- シークレットを削除するのではなくパラメーター化する — プロジェクトの機能を保持する

## 関連スキル

サニタイザーが使用するシークレット検出パターンについては `security-review` を参照。
