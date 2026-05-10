# Theme B: ドキュメント自動更新システム — 詳細仕様書

**作成日**: 2026-05-09  
**ビルダー**: Opus Planner  
**レビュアー対象**: Haiku Reviewer

---

## 1. 概要

### 1.1 システム目的

コード変更を自動検知し、複数の専門エージェント（API ドキュメント更新・README 保守・CHANGELOG 生成）が協調して、**README.md・API ドキュメント・CHANGELOG を即座に更新するマルチエージェント型ハーネス**を実装する。

エンジニアが新機能を追加したり API 変更を加えたりする度に、「ドキュメント更新の忘れ」を防ぎ、ドキュメントとコードの乖離を防止することが主目的。

### 1.2 背景・課題

- **現在の課題**: コード変更後、README・API ドキュメント・CHANGELOG を手作業で更新する必要があり、しばしば遅延・漏れが発生する
- **期待される効果**: Claude Code Agent の「推論 → 実装」能力を利用して、diff を入力とするだけで「どのドキュメントをどう変更すべきか」を自動判定・実行
- **学習目標**: 複数エージェント間の協調（矛盾検出・優先度付け・マージ）を通じて、Agent SDK 活用の深い理解を獲得

### 1.3 スコープ

- **対象**: JavaScript / Python などの一般的なプログラミング言語を想定（ただしサンプルで実装）
- **対象ドキュメント**: README.md（使用方法・新機能紹介）/ API.md（API リファレンス）/ CHANGELOG.md（バージョン履歴）
- **対象コード変更**: 新機能追加・既存機能修正・API 削除・セキュリティパッチ・廃止予告
- **非対象**: ドキュメント自動公開（GitHub Pages など）・複数言語同時対応（Phase 2 以降）

---

## 2. 必須要件（Must-Have）

### 2.1 最低2体の専門エージェント実装

#### 2.1.1 API ドキュメント更新エージェント（api-doc-agent.md）

**責務**: 関数シグネチャ・引数・戻り値の変更を検知し、API.md を自動更新する

**入力**:
- 統一 diff（unified diff 形式）
- 変更属性（新機能 / バグ修正 / 廃止予告 / セキュリティパッチ）
- 既存の API.md テンプレート

**判定ロジック**:
1. diff から関数定義の追加・削除・修正を抽出
2. 関数名・パラメータ・戻り値・例外情報を解析
3. API.md の該当セクションを特定し、更新提案を生成
4. **判定基準**:
   - `+function foo(...)` → 新機能 → API.md に「## foo」セクション追加、使用例追加
   - `function foo(...) → function foo(..., newParam)` → パラメータ追加 → 既存セクション更新、互換性注記追加
   - `- function bar(...)` → 削除 → 「## 廃止予告」セクションに移動、代替案記載

**出力**:
```markdown
### API ドキュメント更新提案

**更新ファイル**: API.md

#### 新規セクション（追加）
```
section: ## new_function()
before: (なし)
after: |
  ### new_function(arg1: string, arg2: number): Promise<Result>
  説明...
  例:
  ```js
  const result = await new_function('value', 42);
  ```
```

#### 既存セクション（修正）
```
section: ## existing_function()
before: |
  ### existing_function(arg1: string): Promise<Result>
after: |
  ### existing_function(arg1: string, newOption?: { verbose: boolean }): Promise<Result>
  パラメータ追加に伴う説明更新...
```
```

**エージェント定義例**: 150 行以内

**判定ロジック の詳細**:
- 正規表現で `^[\+\-] function\s+\w+\(` を検索
- 関数名・パラメータ・戻り値の型注釈を抽出（JSDoc / Python docstring 対応）
- 変更属性が「廃止予告」の場合、API.md のセクションを「廃止」へ移動（削除ではない）
- パラメータの追加が「オプション（デフォルト値有）」であれば「互換性保持」と記載

---

#### 2.1.2 README 保守エージェント（readme-agent.md）

**責務**: 新機能・削除機能・使い方変更を検知し、README.md の該当セクションを自動更新

**入力**:
- 統一 diff
- 変更属性
- 既存の README.md テンプレート

**判定ロジック**:
1. diff から「新機能」「削除」「修正」を判定
2. README の該当セクション（概要・インストール・基本的な使い方・新機能）を特定
3. 変更属性に応じた更新内容を提案

**具体例**:
- 新機能追加 → README に「## 新機能」セクション追加、簡潔な説明 + 使用例
- 既存機能削除 → README から該当記述削除（または「廃止予告」セクションへ）
- API 引数追加 → 「基本的な使い方」セクションの例を更新

**出力形式**: API エージェントと同様

**エージェント定義例**: 150 行以内

---

### 2.2 ハーネス（統合エージェント）の実装

#### 2.2.1 入出力フロー

```
入力: {
  diff: "unified diff テキスト",
  changeAttribute: "新機能" | "バグ修正" | "廃止予告" | "セキュリティパッチ",
  templates: {
    api_md: "既存の API.md",
    readme_md: "既存の README.md"
  }
}
    ↓
[ハーネス処理]
    ↓
出力: {
  report: "Markdown レポート（複数エージェント提案のマージ）",
  updateProposals: [
    { file: "API.md", changes: [...] },
    { file: "README.md", changes: [...] }
  ],
  conflictDetected: bool,
  requiresHumanReview: bool
}
```

#### 2.2.2 ハーネスの処理フロー

1. **入力検証**: diff フォーマット・変更属性の妥当性をチェック
2. **専門エージェント呼び出し**: API エージェント、README エージェントを並列実行
3. **提案のマージ**: 複数エージェントからの提案を統合
4. **矛盾検出**: 
   - API.md に新機能が追加される → README に記載がない → 「要レビュー」フラグ
   - README に削除機能の記載が残っている → API.md から削除されている → 警告
5. **最終レポート生成**: before/after、更新理由、矛盾情報を含む Markdown を出力

#### 2.2.3 実装言語・形式

- ハーネス定義: Claude Code Agent SDK（`.md` 形式）
- サブエージェント呼び出し: Agent SDK 標準の呼び出しメカニズム（agent_ref など）
- テンプレート処理: Markdown テンプレート + 軽量なテキスト置換（Jinja2 利用可）

---

### 2.3 入力フォーマット仕様

#### 2.3.1 Unified Diff

```
--- a/src/utils.js
+++ b/src/utils.js
@@ -10,3 +10,10 @@
 function existing() { ... }
 
+function newFeature(arg1, arg2) {
+  return arg1 + arg2;
+}
```

**要件**:
- ファイルパス（`a/`, `b/` プレフィックス）を含む
- 追加行は `+` で始まり、削除行は `-` で始まる
- 行番号範囲（`@@ -10,3 +10,10 @@`）を含む

#### 2.3.2 変更属性

```json
{
  "changeType": "new-feature" | "bug-fix" | "deprecation" | "security-patch"
}
```

**定義**:
- `new-feature`: 新しい関数・メソッド・パラメータの追加
- `bug-fix`: 既存機能の修正
- `deprecation`: 廃止予告（完全削除ではなく、段階的廃止）
- `security-patch`: セキュリティ脆弱性への対応

---

### 2.4 出力フォーマット仕様

#### 2.4.1 Markdown レポート

```markdown
# ドキュメント更新提案レポート

## 概要
- **変更属性**: 新機能
- **diff ファイル数**: 1
- **影響するドキュメント**: API.md, README.md
- **矛盾検出**: なし
- **要レビュー**: いいえ

## API.md の提案変更

### 追加: new_function()
[before: なし]
[after: ...関数定義...]

### 修正: existing_function()
[before: 既存の説明]
[after: 更新後の説明]

## README.md の提案変更

### 新規セクション追加
[セクション名・内容...]

## 矛盾検出結果
- なし

## 判定: このドキュメント差分は実行可能か？
✓ はい（矛盾なし、レビュー不要）

---

**生成日**: 2026-05-09
**生成エージェント**: ドキュメント自動更新ハーネス
```

#### 2.4.2 JSON 形式（オプション）

```json
{
  "metadata": {
    "generatedAt": "2026-05-09T10:30:00Z",
    "changeType": "new-feature",
    "hasConflicts": false
  },
  "updates": [
    {
      "file": "API.md",
      "changes": [
        {
          "type": "insert",
          "section": "new_function()",
          "before": null,
          "after": "### new_function(...)\n..."
        }
      ]
    }
  ]
}
```

---

### 2.5 完成条件（Phase 1）

- [ ] API エージェント・README エージェントが独立して機能
- [ ] ハーネスがコード diff を入力として受け取り可能
- [ ] ハーネスが複数エージェントを呼び出して提案を統合可能
- [ ] サンプル diff 2 件（新機能・バグ修正）でテスト済み
- [ ] 「更新提案レポート」が「そのまま実行可能」な完成度で生成される
- [ ] エージェント定義が 200 行以内（保守性）

---

## 3. 推奨要件（Should-Have）

### 3.1 3体目の専門エージェント追加

#### 3.1.1 CHANGELOG 自動生成エージェント（changelog-agent.md）

**責務**: セマンティックバージョニング（SemVer）に基づき CHANGELOG.md を自動更新

**入力**:
- 統一 diff
- 変更属性
- 既存の CHANGELOG.md（最新バージョン情報を読み取り）

**判定ロジック**:
1. 変更属性からバージョン更新（major / minor / patch）を判定
   - `security-patch` → patch（x.y.z → x.y.z+1）
   - `new-feature` → minor（x.y.z → x.y+1.0）
   - `bug-fix` → patch（x.y.z → x.y.z+1）
   - `deprecation` → minor（廃止予告は新機能扱い）
2. 新しい version セクションを CHANGELOG.md に追加
3. diff から変更内容を抽出し、「Added / Fixed / Deprecated / Security」カテゴリに分類

**出力例**:
```markdown
## [0.2.0] - 2026-05-09

### Added
- new_function(arg1, arg2): 新しい便利機能 (refs: #PR123)

### Fixed
- existing_function() パラメータ型の不具合修正

### Deprecated
- old_function(): v0.3.0 で削除予定

### Security
- セキュリティパッチ適用
```

**エージェント定義**: 150 行以内

**注意**:
- 既存の CHANGELOG.md フォーマット（Keep a Changelog 形式）を保持
- バージョン判定ロジックは設定可能（SemVer ルール）

---

#### 3.1.2 代替案：使用例 / チュートリアル更新エージェント

**責務**: 新 API の使用例を examples/ ディレクトリに自動生成

**判定ロジック**:
- 新機能追加の diff から関数定義・パラメータを抽出
- 簡潔な使用例を生成（JavaScript / Python の両対応）
- `examples/` ディレクトリに新ファイル作成

**出力例**:
```js
// examples/new_feature.js
const { newFeature } = require('../src');

// 基本的な使い方
const result = newFeature('input', 42);
console.log(result);

// 詳細な使い方（オプション）
const advancedResult = newFeature('input', 42, {
  verbose: true,
  timeout: 5000
});
```

---

### 3.2 ハーネス内でのエージェント間協調

#### 3.2.1 矛盾検出ロジック

```javascript
function detectConflicts(apiProposal, readmeProposal, changelogProposal) {
  const conflicts = [];

  // パターン1: API で新機能が追加されるが README に記載がない
  if (apiProposal.hasNewFunction && !readmeProposal.hasNewFeatureSection) {
    conflicts.push({
      level: "WARNING",
      message: "API.md に新機能が追加されるが、README.md に新機能セクションがない"
    });
  }

  // パターン2: README で機能が削除されるが API.md から削除されていない
  if (readmeProposal.hasRemovedFeature && !apiProposal.hasRemovedFunction) {
    conflicts.push({
      level: "ERROR",
      message: "README で機能が削除されるが、API.md には記載が残っている"
    });
  }

  // パターン3: 廃止予告なのに CHANGELOG では minor が割り当てられていない
  if (changeAttribute === "deprecation" && changelogProposal.versionBump === "patch") {
    conflicts.push({
      level: "WARNING",
      message: "廃止予告は通常 minor バージョン更新が適切"
    });
  }

  return conflicts;
}
```

#### 3.2.2 優先度付けルール

1. **エラー（ERROR）**: 人間レビュー必須。処理停止
2. **警告（WARNING）**: 提案を出力するが「要確認」フラグ
3. **情報（INFO）**: 参考情報。自動実行可能

---

### 3.3 コード変更の「属性」自動判定

**ハーネスが diff を解析して、変更属性を自動判定する**

#### 3.3.1 判定ルール

```javascript
function inferChangeAttribute(diff, commitMessage) {
  // 1. diff のパターンから推測
  if (diff.includes("- function") && !diff.includes("+ function")) {
    return "deletion"; // 削除
  } else if (diff.includes("+ function")) {
    return "new-feature"; // 新機能
  }

  // 2. コミットメッセージから推測
  if (commitMessage.includes("BREAKING CHANGE") || 
      commitMessage.includes("fix!")) {
    return "bug-fix"; // バグ修正
  }

  if (commitMessage.includes("security") || 
      commitMessage.includes("CVE")) {
    return "security-patch"; // セキュリティパッチ
  }

  if (commitMessage.includes("deprecated") || 
      commitMessage.includes("Deprecation")) {
    return "deprecation"; // 廃止予告
  }

  // 3. デフォルト
  return "unknown";
}
```

#### 3.3.2 確実性スコア

- 自動判定に確信度を付与（0.0 - 1.0）
- 確信度 < 0.6 の場合は「要レビュー」フラグ

---

### 3.4 ドキュメント（Should-Have）

#### 3.4.1 各エージェントの判定ロジック説明

- API エージェント: 「関数定義の追加・削除・修正」の判定アルゴリズム（正規表現・AST 解析など）
- README エージェント: 「新機能セクション・削除セクション」の自動検出ルール
- CHANGELOG エージェント: セマンティックバージョニング判定ロジック

#### 3.4.2 diff → ドキュメント更新の処理フロー図

ASCII フロー図または Mermaid 形式:

```
コード diff (input)
    ↓
[変更属性の自動判定] (API エージェント・README エージェント)
    ↓
[複数エージェント並列実行]
    ├→ API ドキュメント更新提案
    ├→ README 更新提案
    └→ CHANGELOG 更新提案
    ↓
[矛盾検出・優先度付け]
    ├→ ERROR → 要レビュー（処理停止）
    └→ WARNING → フラグ付き提案
    ↓
[最終レポート生成]
    ↓
出力: Markdown レポート（実行可能/要レビュー）
```

#### 3.4.3 エッジケース対応説明

---

## 4. オプション要件（Nice-to-Have）

### 4.1 GitHub Actions 統合

PR が開かれた時点で自動実行し、提案ドキュメント更新を PR コメントに記載

```yaml
# .github/workflows/auto-update-docs.yml
name: Auto Update Documentation
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Get diff
        id: diff
        run: |
          git diff origin/main..HEAD > diff.txt
      
      - name: Run Harness
        id: harness
        run: |
          claude-code-agent run --agent=doc-update-harness --input=diff.txt
      
      - name: Post Comment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: "${{ steps.harness.outputs.report }}"
            })
```

---

### 4.2 バージョン管理の自動化

CHANGELOG から自動的に `version` を抽出し、package.json / pyproject.toml を更新

```javascript
function extractVersionFromChangelog(changelogMd) {
  const match = changelogMd.match(/## \[(\d+\.\d+\.\d+)\]/);
  return match ? match[1] : null;
}

// package.json を更新
function updatePackageJson(version) {
  const pkg = JSON.parse(fs.readFileSync('package.json'));
  pkg.version = version;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}
```

---

### 4.3 多言語ドキュメント対応

README (日本語) + README.en (英語) を同時更新する協調ロジック

```javascript
function detectLanguage(mdContent) {
  const japaneseCharCount = (mdContent.match(/[぀-ゟ゠-ヿ一-鿿]/g) || []).length;
  const totalChars = mdContent.length;
  return japaneseCharCount / totalChars > 0.5 ? "ja" : "en";
}

// 多言語エージェント呼び出し
async function updateMultilingualDocs(diff, attribute) {
  const [updateJa, updateEn] = await Promise.all([
    callAgent("readme-agent-ja", { diff, attribute }),
    callAgent("readme-agent-en", { diff, attribute })
  ]);
  return { updateJa, updateEn };
}
```

---

### 4.4 ドキュメント品質チェック

生成されたドキュメント案に対し「可読性・正確性」をスコア化

```javascript
function scoreDocumentQuality(mdText) {
  let score = 0;

  // 構造チェック（見出し・リスト）
  const hasHeadings = /##+\s+/.test(mdText);
  score += hasHeadings ? 10 : 0;

  // コード例チェック
  const hasCodeExamples = /```[\s\S]*?```/.test(mdText);
  score += hasCodeExamples ? 20 : 0;

  // 可読性チェック（行の平均長）
  const avgLineLength = mdText.split('\n').reduce((sum, line) => 
    sum + line.length, 0) / mdText.split('\n').length;
  score += avgLineLength < 100 ? 10 : 0;

  // 型情報チェック（関数署名が明確か）
  const hasTypeInfo = /\([^)]*:\s*\w+\)/.test(mdText) || 
                      /```(js|py|ts)[^`]*```/.test(mdText);
  score += hasTypeInfo ? 20 : 0;

  return score; // 0-60
}
```

**ルール**:
- スコア < 30: 「要レビュー」フラグ
- スコア 30-50: 「推奨確認」
- スコア > 50: 自動実行可能

---

## 5. 技術スタック

### 5.1 推奨言語・フレームワーク

| 層 | 推奨 | 理由 |
|---|------|------|
| エージェント定義 | Markdown (`.md`) | Claude Code Agent SDK 標準、保守性高 |
| ハーネス実装 | Agent SDK (`.md`) | 複数エージェント呼び出しの標準化 |
| テンプレート処理 | Markdown + テキスト置換 / Jinja2 | シンプル・軽量 |
| diff 解析 | 正規表現 or 軽量 JavaScript パーサー | diff フォーマットの汎用性 |
| 入出力フォーマット | JSON / Markdown | 人間可読性・マシン可読性のバランス |

### 5.2 エージェント構成

```
doc-update-harness（統合エージェント）
  ├→ api-doc-agent.md
  ├→ readme-agent.md
  └→ changelog-agent.md（Phase 2）
```

### 5.3 テンプレート・サンプル

- `samples/diff-new-feature.txt`: 新機能追加の diff
- `samples/diff-bug-fix.txt`: バグ修正の diff
- `samples/diff-deprecation.txt`: 廃止予告の diff
- `templates/api-md.template`: API.md 空のテンプレート
- `templates/readme-md.template`: README.md 空のテンプレート
- `templates/changelog-md.template`: CHANGELOG.md 空のテンプレート

---

## 6. 実装フェーズ計画

### 6.1 Phase 1: 最小構成（Must-Have）

**期間**: 最初の実装ブロック（1-2 セッション）

**タスク順序**:

1. **エージェント定義の設計**（30 分）
   - API エージェント・README エージェントの責務範囲を明確化
   - 入出力インターフェースを定義

2. **API エージェント実装**（45 分）
   - 関数定義抽出ロジック実装
   - diff パターン判定（`+ function` / `- function` / パラメータ変更）
   - API.md 更新提案フォーマット生成

3. **README エージェント実装**（45 分）
   - 新機能・削除の検出ロジック
   - README セクション更新提案生成

4. **ハーネス実装**（60 分）
   - 複数エージェント呼び出し（順序・並列実行）
   - 提案のマージ処理
   - 最終レポート生成

5. **テスト・検証**（30 分）
   - サンプル diff 2 件（新機能・バグ修正）での実行
   - レポート出力の確認

**完成条件チェック**:
- [ ] API エージェントが関数定義変更を正確に検出
- [ ] README エージェントが新機能・削除を正確に検出
- [ ] ハーネスが複数エージェント提案をマージ可能
- [ ] サンプル 2 件の実行で「実行可能な」レポートが生成される

**成果物**:
- `api-doc-agent.md`（~150 行）
- `readme-agent.md`（~150 行）
- `harness.md`（~200 行）
- `test-report.md`（テスト結果）

---

### 6.2 Phase 2: 拡張（Should-Have）

**期間**: 第2ブロック（1-2 セッション）

**タスク順序**:

1. **CHANGELOG エージェント実装**（45 分）
   - SemVer 判定ロジック
   - CHANGELOG セクション生成

2. **自動属性判定ロジック追加**（30 分）
   - diff / コミットメッセージから属性を推測
   - 確実性スコア付与

3. **矛盾検出・調整ロジック**（60 分）
   - API 変更 ↔ README チェック
   - CHANGELOG ↔ API 整合性チェック
   - 優先度付けルール実装

4. **ドキュメント作成**（45 分）
   - 各エージェントの判定ロジック説明
   - 処理フロー図（Mermaid）
   - エッジケース説明

**完成条件チェック**:
- [ ] CHANGELOG エージェントが SemVer 正確に判定
- [ ] 矛盾検出が機能（API 追加 ↔ README 未更新）
- [ ] 自動属性判定の信頼性 > 80%
- [ ] ドキュメント整備完了

**成果物**:
- `changelog-agent.md`（~150 行）
- `harness.md` 拡張版（矛盾検出ロジック追加）
- `IMPLEMENTATION_GUIDE.md`（フロー図・判定ロジック説明）

---

### 6.3 Phase 3 以降: 応用（Nice-to-Have）

**GitHub Actions 統合**:
- PR 自動チェック
- PR コメント自動投稿

**多言語対応**:
- README.ja + README.en 同時更新

**品質スコアリング**:
- 生成ドキュメント品質判定

---

## 7. 品質基準（完成条件）

### 7.1 機能完全性チェックリスト

- [ ] API ドキュメント更新エージェントが実装されている
- [ ] README 保守エージェントが実装されている
- [ ] ハーネスが複数エージェントを呼び出せる
- [ ] ハーネスがエージェント提案をマージできる
- [ ] サンプル diff 2 件（新機能・バグ修正）で実行可能
- [ ] 「更新提案レポート」が Markdown で出力される
- [ ] レポートに「実行可能か / 要レビューか」の判定が含まれる

### 7.2 エージェント品質

- [ ] API エージェント: 200 行以内、関数定義抽出が正確
- [ ] README エージェント: 200 行以内、新機能検出が正確
- [ ] ハーネス: 250 行以内、複数エージェント統合ロジックが明確

### 7.3 ドキュメント品質

- [ ] 各エージェントの入出力インターフェースが明記
- [ ] diff → ドキュメント更新の処理フロー図がある
- [ ] エッジケース対応が説明されている
- [ ] サンプル実行例がある

### 7.4 テスト完全性

- [ ] **新機能追加テスト**: diff に `+ function newFeature()` があると、API.md に新セクション追加されることを確認
- [ ] **機能修正テスト**: diff に引数変更があると、API.md の説明が更新されることを確認
- [ ] **削除テスト**: diff に `- function oldFeature()` があると、API.md で廃止セクションに移動することを確認
- [ ] **矛盾検出テスト**: API 追加 + README 未更新で「要レビュー」フラグが立つことを確認
- [ ] **複数変更テスト**: diff に複数の変更が含まれると、すべてが検出されることを確認

---

## 8. エッジケース・例外処理

### 8.1 複数の機能追加が含まれた diff

**事象**: 1 つの diff に新機能 A・新機能 B が含まれている

**対応**:
- ハーネスが複数変更セットを検出する
- 各セット（機能 A・機能 B）を分離して提案生成
- 最終レポートで「新機能 2 件」と明記

**実装例**:
```javascript
function splitDiffBySections(unifiedDiff) {
  const sections = [];
  let currentSection = null;

  unifiedDiff.split('\n').forEach(line => {
    if (line.startsWith('@@')) {
      currentSection = { header: line, lines: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  });

  return sections;
}
```

---

### 8.2 既存ドキュメントが古い / 不正確な場合

**事象**: README に記載されている古い機能の仕様と、現在の diff が矛盾している

**対応**:
- ハーネスが矛盾を検出
- 「既存ドキュメントの信頼性が低い可能性があります。要レビュー」と警告
- 人間がレビューして判定

**実装例**:
```javascript
function detectDocumentInconsistency(oldReadme, newProposal) {
  // 例: README に「引数3個」と書かれているが、API は「引数4個」
  const oldArgCount = (oldReadme.match(/\(.*\)/g) || [])
    .map(m => m.split(',').length)[0];
  const newArgCount = parseNewFunctionSignature(newProposal).argCount;
  
  if (oldArgCount !== newArgCount) {
    return { inconsistency: true, reason: "引数数が不一致" };
  }
  return { inconsistency: false };
}
```

---

### 8.3 廃止予告機能の場合

**事象**: 新 diff が「このバージョンで廃止予告」を示している

**対応**:
- エージェントが廃止予告属性を認識
- README では「～は v1.0 で廃止予定です。代わりに newFunction() を使用してください」と記載
- API.md の該当セクションを「廃止予告」カテゴリに移動
- CHANGELOG に「Deprecated」セクション追加

**実装例**:
```javascript
function handleDeprecation(oldFunctionName, newAlternative, changeAttribute) {
  if (changeAttribute === "deprecation") {
    return {
      readmeUpdate: `### ${oldFunctionName} (廃止予告)\n\n${oldFunctionName} は v1.0 で削除される予定です。\n代わりに ${newAlternative}() をご利用ください。`,
      apiUpdate: `[廃止予告] ${oldFunctionName}`,
      changelogUpdate: `### Deprecated\n- ${oldFunctionName}(): v1.0 削除予定`
    };
  }
}
```

---

### 8.4 ドキュメント言語が混在する場合

**事象**: README (日本語) + API.md (英語) などの混在言語ドキュメント

**対応**:
- 言語自動検出機能を実装
- 言語別に異なるエージェント呼び出し（Phase 2 以降）
- 翻訳ルールの定義（例: API → 日本語技術用語マッピング）

**実装例**:
```javascript
function detectDocumentLanguage(mdText) {
  const japaneseCharCount = (mdText.match(/[぀-ゟ゠-ヿ一-鿿]/g) || []).length;
  const totalChars = mdText.length;
  
  if (japaneseCharCount / totalChars > 0.5) return "ja";
  else return "en";
}

async function updateMultilingualDocs(diff, attribute, templates) {
  const languages = {};
  
  for (const [lang, template] of Object.entries(templates)) {
    const detectedLang = detectDocumentLanguage(template);
    const agent = `readme-agent-${detectedLang}`;
    languages[lang] = await callAgent(agent, { diff, attribute, template });
  }
  
  return languages;
}
```

---

### 8.5 diff がテンプレート形式でない場合

**事象**: 入力 diff が unified diff 形式ではない（git patch や GitHub diff など）

**対応**:
- フォーマット自動検出
- 対応フォーマット: unified diff, git patch, GitHub API diff
- 標準形式への変換処理

---

### 8.6 エージェント間で「実行順序」が重要な場合

**事象**: README 更新が API 更新に依存する（API が追加された後に README に記載）

**対応**:
- 依存グラフを構築
- トポロジカルソート で実行順序決定
- または、すべてを並列実行して最後にマージ

---

## 9. Agent 間連携

### 9.1 マルチエージェント呼び出しの実装パターン

#### 9.1.1 並列実行パターン（推奨）

```javascript
async function harness(diff, changeAttribute, templates) {
  // 複数エージェントを並列実行
  const [apiProposal, readmeProposal] = await Promise.all([
    callAgent('api-doc-agent', { diff, changeAttribute, template: templates.api_md }),
    callAgent('readme-agent', { diff, changeAttribute, template: templates.readme_md })
  ]);
  
  // マージ処理
  return mergeProposals(apiProposal, readmeProposal);
}
```

**メリット**: 実行時間が短い（max(エージェントA時間, エージェントB時間)）

---

#### 9.1.2 順序実行パターン

```javascript
async function harnessSequential(diff, changeAttribute, templates) {
  // API エージェント先実行（README が API 情報に依存する場合）
  const apiProposal = await callAgent('api-doc-agent', { 
    diff, changeAttribute, template: templates.api_md 
  });
  
  // API 提案を README エージェントに入力
  const readmeProposal = await callAgent('readme-agent', { 
    diff, 
    changeAttribute, 
    template: templates.readme_md,
    apiContext: apiProposal  // ← API 情報を参照
  });
  
  return mergeProposals(apiProposal, readmeProposal);
}
```

**メリット**: エージェント間で情報共有可能（矛盾検出に有利）

---

### 9.2 矛盾検出・調整の詳細フロー

```
API 提案 ← [API エージェント出力]
README 提案 ← [README エージェント出力]
CHANGELOG 提案 ← [CHANGELOG エージェント出力]

    ↓

[矛盾検出ロジック]
- API に新機能 ∧ README 未更新 → WARNING
- API 削除 ∧ README 記載残存 → ERROR
- CHANGELOG version と SemVer 矛盾 → WARNING

    ↓

[優先度付け]
ERROR > WARNING > INFO

    ↓

[提案の最終化]
- ERROR がある → 「要レビュー」フラグ + 詳細情報
- WARNING のみ → フラグ付き提案 + 警告
- 矛盾なし → 自動実行可能

    ↓

[最終レポート生成]
```

---

### 9.3 エージェント間データ受け渡しの仕様

#### 9.3.1 Context Object（エージェント間で共有）

```json
{
  "diff": "unified diff テキスト",
  "changeAttribute": "new-feature | bug-fix | deprecation | security-patch",
  "metadata": {
    "authorEmail": "user@example.com",
    "timestamp": "2026-05-09T10:30:00Z",
    "changeId": "PR#123"
  },
  "templates": {
    "api_md": "既存 API.md",
    "readme_md": "既存 README.md",
    "changelog_md": "既存 CHANGELOG.md"
  },
  "previousProposals": {
    "api": { ...API エージェント出力... },
    "readme": { ...README エージェント出力... }
  }
}
```

#### 9.3.2 Agent Output Schema

```json
{
  "agentName": "api-doc-agent",
  "changes": [
    {
      "type": "insert | update | delete",
      "section": "セクション名",
      "before": "変更前テキスト（update/delete の場合）",
      "after": "変更後テキスト（insert/update の場合）",
      "reason": "変更理由の説明"
    }
  ],
  "confidence": 0.95,
  "requiresHumanReview": false,
  "warnings": [
    {
      "level": "INFO | WARNING | ERROR",
      "message": "警告メッセージ"
    }
  ]
}
```

---

## 10. テンプレート・サンプル

### 10.1 サンプル diff（新機能追加）

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

### 10.2 サンプル diff（バグ修正）

```diff
--- a/src/utils.js
+++ b/src/utils.js
@@ -20,6 +20,7 @@
  * @param {string[]} items
+ * @param {object} options Optional configuration
- * @returns {string} Joined string
+ * @returns {string} Joined string
  */
-function join(items) {
+function join(items, options = {}) {
-  return items.join(',');
+  const separator = options.separator || ',';
+  return items.join(separator);
}
```

### 10.3 期待される README 更新提案（新機能追加）

```markdown
## README.md 更新提案

### 新規セクション追加: 新しい計算機能

**section**: ## 新しい計算機能

**before**: (なし - 新規追加)

**after**:
```md
## 新しい計算機能

v0.2.0 で乗算関数 `multiply()` が追加されました。

### multiply(a, b)

2 つの数値を乗算します。

```js
const result = multiply(3, 4);
console.log(result); // 12
```
```

**reason**: diff に `+ function multiply()` が追加されたため、新機能セクションを追加
```

---

## 11. レビュアー向けチェックリスト（Reviewer 用）

レビューの際、以下を確認してください：

### 11.1 実装完全性

- [ ] 最低 2 体のエージェント（API・README）が定義ファイルとして存在
- [ ] ハーネスが複数エージェント呼び出しを実装
- [ ] サンプル実行で「更新提案レポート」が出力されている
- [ ] レポートに「実行可能か / 要レビューか」の判定が含まれる

### 11.2 品質要件

- [ ] 各エージェント定義が 200 行以内
- [ ] 生成ドキュメント案が「そのまま実行可能」な完成度
- [ ] 矛盾検出ロジックが正確に動作

### 11.3 ドキュメント充実度

- [ ] 各エージェントの判定ロジックが説明されているか
- [ ] diff → 更新提案の処理フロー図があるか
- [ ] エッジケース対応が明記されているか

### 11.4 再現性

- [ ] サンプル diff + テンプレートで同じ提案が再現されるか
- [ ] 環境依存がないか（言語・ツール非依存）

---

**スペック策定日**: 2026-05-09  
**策定者**: Opus Planner  
**次ステップ**: Haiku Reviewer による実装品質確認・テスト検証
