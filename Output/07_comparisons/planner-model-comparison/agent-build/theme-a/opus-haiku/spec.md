# Spec: PR レビュー自動化ハーネス（Theme A）

**作成日**: 2026-05-09
**対象テーマ**: Theme A - PR Review Automation Harness
**プランナー**: Opus
**実装者**: Haiku Generator
**テーマファイル**: `Output/07_comparisons/planner-model-comparison/agent-build/theme-a/theme.md`

---

## 1. 概要

本仕様は、コード差分（unified diff）を入力として受け取り、複数の専門エージェントが協調してレビューを実施する **マルチエージェントハーネス** を構築するためのものである。
Phase 1 では「セキュリティ専門エージェント」と「コード品質専門エージェント」の2体を `.md` 形式で定義し、ハーネスがそれらを順次呼び出して結果を統合する最小構成を実装する。
出力は重要度（Critical/High/Medium/Low）とカテゴリ（Security/Quality/...）で整理された Markdown レポートで、実装者が次のアクションを即座に把握できる体裁とする。
Phase 2 では3体目のエージェント（テスト適否 or アーキテクチャ）の追加と、エージェント間矛盾検出ロジックを導入し、Should-Have を達成する。
Claude Code Agent SDK の `.md` エージェント定義形式に準拠し、外部依存（APIキー等）なしで再現可能であることを必須とする。

---

## 2. 要件一覧（チェックリスト）

### Must-Have（Phase 1 で達成）

- [ ] M1. セキュリティ専門エージェントを `.md` 形式で実装（200行以内）
- [ ] M2. コード品質専門エージェントを `.md` 形式で実装（200行以内）
- [ ] M3. ハーネス（統合エージェント）を `.md` 形式で実装し、両エージェントを呼び出して結果集約
- [ ] M4. 入力フォーマット：unified diff + ファイル情報（言語・パス・コンテキスト）を受領
- [ ] M5. 出力フォーマット：Markdown レポート（Security Issues / Quality Findings / Recommendations）
- [ ] M6. 重要度分類（Critical / High / Medium / Low）の付与
- [ ] M7. カテゴリ分類（Security / Performance / Readability / Testing / Architecture）の付与
- [ ] M8. 改善提案（Recommendations）セクションを含む
- [ ] M9. サンプルコード2件（脆弱性含む・品質問題含む）で検出率100%

### Should-Have（Phase 2 で達成）

- [ ] S1. 3体目エージェント追加（テスト適否 or アーキテクチャ）
- [ ] S2. ハーネス内でのエージェント間矛盾検出ロジック（例：暗号化必須 vs 暗号化は遅い）
- [ ] S3. 矛盾検出時の「トレードオフ分析」セクション追加
- [ ] S4. ドキュメント整備（各エージェント責務・ハーネス動作フロー図・新規エージェント追加手順）

### Nice-to-Have（任意）

- [ ] N1. GitHub Actions 統合スクリプト（shell）
- [ ] N2. 複数言語同時処理（Python/JavaScript/Go）
- [ ] N3. フィードバックループ（実施/スキップ/異議の入力）
- [ ] N4. パフォーマンス分析（実行時間・API呼び出し回数のレポート添付）

---

## 3. エージェント設計（Phase 1）

### 3.1 セキュリティエージェント（`agents/security-reviewer.md`）

**責務**:
- 入力差分の中から、セキュリティ脆弱性パターンを検出する
- 検出した脆弱性を重要度・カテゴリ付きで構造化出力する
- 修正案を提示する（コード断片レベル）

**検出対象（最低限カバーすべきパターン）**:

| ID | パターン | 想定重要度 | 検出ヒント |
|---|---|---|---|
| SEC-001 | SQL インジェクション | Critical | 文字列連結によるSQL構築（`+`、f-string、テンプレートリテラル） |
| SEC-002 | XSS（クロスサイトスクリプティング） | High | `innerHTML`, `dangerouslySetInnerHTML`, エスケープなしのDOM挿入 |
| SEC-003 | CSRF対策欠如 | High | 状態変更POSTにトークン検証なし |
| SEC-004 | ハードコードされた秘密情報 | Critical | `password=`, `api_key=`, `secret=` のリテラル代入 |
| SEC-005 | 弱い暗号化 | High | `MD5`, `SHA1`, `DES`, `ECB` モード |
| SEC-006 | 認証・認可の欠如 | Critical | 保護されたエンドポイントに認証チェックなし |
| SEC-007 | 安全でないデシリアライズ | High | `pickle.loads`, `yaml.load`（unsafe）, `eval`, `exec` |
| SEC-008 | パストラバーサル | High | ユーザー入力を直接ファイルパスに連結 |
| SEC-009 | 安全でない乱数 | Medium | 暗号用途で `Math.random()`, `random.random()` |
| SEC-010 | オープンリダイレクト | Medium | リダイレクトURLの検証なし |

**入力**:
```
- diff: unified diff 文字列
- file_info: { path: string, language: string, project_context?: string }
```

**出力（JSON like / Markdown 内に埋め込み）**:
```json
{
  "agent": "security-reviewer",
  "findings": [
    {
      "id": "SEC-001",
      "severity": "Critical",
      "category": "Security",
      "file": "src/api/user.py",
      "line": 42,
      "title": "SQL Injection via string concatenation",
      "description": "...",
      "evidence": "query = \"SELECT * FROM users WHERE id = \" + user_id",
      "recommendation": "Use parameterized queries: cursor.execute('SELECT ... WHERE id = ?', (user_id,))"
    }
  ],
  "summary": { "critical": 1, "high": 0, "medium": 0, "low": 0 }
}
```

**重要度判定基準（実装上の判断）**:
- **Critical**: 直接的なRCE/データ漏洩/権限昇格に繋がる（SQLi、ハードコード秘密、認証欠如、安全でないデシリアライズ）
- **High**: 攻撃に成功すれば実害が出るが追加条件が必要（XSS、CSRF、弱い暗号、パストラバーサル）
- **Medium**: 防御の弱体化・将来的なリスク（弱い乱数、オープンリダイレクト）
- **Low**: ベストプラクティス違反（推奨設定の欠如等）

**実装ポイント**:
- `.md` 内の `## 検出ルール` セクションに上記10パターンを箇条書きで明示
- 出力は必ず構造化形式（YAML or JSON ブロック）でハーネスがパース可能な形に
- 言語別に検出ヒントを書き分ける（Python: f-string, JS: テンプレートリテラル など）
- ファイルサイズは200行を超えない

---

### 3.2 コード品質エージェント（`agents/quality-reviewer.md`）

**責務**:
- 入力差分の中から、可読性・保守性・命名規則・複雑度などの品質問題を検出する
- 検出項目を重要度・カテゴリ付きで構造化出力する
- リファクタリング案を提示する

**検出対象（最低限カバーすべきパターン）**:

| ID | パターン | 想定重要度 | 判定基準 |
|---|---|---|---|
| QUAL-001 | 関数長すぎ | High | 50行超 |
| QUAL-002 | ファイル長すぎ | Medium | 300行超 |
| QUAL-003 | ネスト深すぎ | High | 4階層以上 |
| QUAL-004 | 循環的複雑度過多 | High | 10超 |
| QUAL-005 | 命名規則違反 | Medium | camelCase/PascalCase/UPPER_SNAKE_CASE/snake_case 違反 |
| QUAL-006 | マジックナンバー | Low | リテラル数値の直接使用（0, 1, -1 を除く） |
| QUAL-007 | コメント不足（複雑な処理） | Low | 複雑度8超の関数にコメントなし |
| QUAL-008 | 重複コード | Medium | 同一ブロック3行以上の繰り返し |
| QUAL-009 | デッドコード | Medium | 到達不能コード、未使用変数 |
| QUAL-010 | 不適切なエラーハンドリング | High | bare `except:`, `catch (e) {}` 空ブロック |
| QUAL-011 | 引数過多 | Medium | 5個超 |
| QUAL-012 | TODO/FIXME 残置 | Low | 期限・担当者なしの TODO |

**入力/出力フォーマット**: セキュリティエージェントと同形式（`agent` フィールドのみ `quality-reviewer`）

**重要度判定基準（実装上の判断）**:
- **Critical**: コード品質起因のバグ確実性が高い（通常は使わない、極端な例のみ）
- **High**: 直近の保守を著しく困難にする（長関数、深ネスト、空 catch）
- **Medium**: 中長期の負債化（重複、デッドコード、命名違反）
- **Low**: ベストプラクティス違反（マジックナンバー、TODO残置）

**実装ポイント**:
- 数値しきい値（50行、4階層、複雑度10）を `.md` 内に明文化
- グローバル CLAUDE.md の命名規則（camelCase / PascalCase / UPPER_SNAKE_CASE / snake_case）に整合
- 出力構造はセキュリティエージェントと同一スキーマで、ハーネス側の集約コードを共通化可能に
- ファイルサイズは200行を超えない

---

### 3.3 ハーネス（`agents/pr-review-harness.md`）

**責務**:
1. 入力（diff + file_info）を受け取る
2. 各専門エージェントを順次呼び出す（Phase 1 ではセキュリティ → 品質）
3. 各エージェントの出力をパースして統合する
4. 重複排除・優先度付け・カテゴリ整理を行う
5. Markdown レポートを生成して返す

**処理フロー**:

```
[Input: diff + file_info]
        |
        v
  [前処理] ─ 言語判定 / 差分サイズ判定 / 空diff判定
        |
        v
  [エージェント呼び出し（並列 or 順次）]
        |
        +─→ Security Agent → findings[]
        |
        +─→ Quality Agent  → findings[]
        |
        v
  [集約処理]
    - 重複排除（同一 file:line + 同一 id）
    - 重要度ソート（Critical → High → Medium → Low）
    - カテゴリグルーピング
        |
        v
  [Markdown レポート生成]
        |
        v
  [Output: report.md]
```

**呼び出し順序とエラーハンドリング**:
- Phase 1: 順次呼び出し（Security → Quality）。一方が失敗してももう一方は継続実行
- いずれかのエージェントが構造化出力に失敗した場合 → レポートに `## Agent Errors` セクションを設けて失敗内容を明示
- 入力 diff が空 / 1行未満 → 「変更なし / 軽微」と判定して短縮レポート出力
- 言語判定失敗（拡張子なし or 未知の拡張子）→ レポート冒頭に `> Warning: 言語判定失敗のため検出精度が低下する可能性があります` を記載

**重複排除ルール（実装上の判断）**:
- キー：`(file_path, line_number, finding_id)` の3つ組
- 同一キーの場合、より高い重要度を採用
- 異なる id でも同一行・同一カテゴリの場合は併記（マージはしない）

---

## 4. ハーネス仕様

### 4.1 入力フォーマット

```yaml
# 例: input.yaml（またはハーネス起動時に与える構造）
diff: |
  diff --git a/src/api/user.py b/src/api/user.py
  index 1234..5678 100644
  --- a/src/api/user.py
  +++ b/src/api/user.py
  @@ -10,3 +10,5 @@
  +def get_user(user_id):
  +    query = "SELECT * FROM users WHERE id = " + user_id
  +    return db.execute(query)
file_info:
  - path: src/api/user.py
    language: python
    project_context: "FastAPI ベースのユーザー管理 API"
```

**許容フォーマット**:
- unified diff（`diff --git` 形式）
- JSON 形式（`{ files: [{ path, language, before, after }] }`）も Should-Have として許容

### 4.2 出力フォーマット（Markdown レポート）

```markdown
# PR Review Report

**Generated**: 2026-05-09
**Files reviewed**: 1
**Agents**: security-reviewer, quality-reviewer

## Summary

| Severity | Security | Quality | Total |
|----------|----------|---------|-------|
| Critical | 1        | 0       | 1     |
| High     | 0        | 1       | 1     |
| Medium   | 0        | 0       | 0     |
| Low      | 0        | 0       | 0     |

---

## Security Issues

### [Critical] SEC-001: SQL Injection via string concatenation
- **File**: `src/api/user.py:12`
- **Evidence**:
  ```python
  query = "SELECT * FROM users WHERE id = " + user_id
  ```
- **Description**: ユーザー入力を直接 SQL 文字列に連結しているため、SQL インジェクション攻撃が可能。
- **Recommendation**:
  ```python
  cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
  ```

---

## Quality Findings

### [High] QUAL-001: Function too long
- **File**: `src/api/user.py:20-95`
- **Description**: `process_user_data` 関数が 76 行（しきい値 50 行）。
- **Recommendation**: 責務ごとに 3 関数程度に分割する。

---

## Recommendations（統合提案）

1. **最優先**: SEC-001 を修正（パラメータバインディング導入）
2. **次点**: QUAL-001 関数分割でメンテナンス性を向上
3. **コード規約**: グローバル規約のパラメータバインディング必須ルールに照らして再点検

---

## Agent Errors（あれば）

なし

---

## Trade-offs（Phase 2: 矛盾検出）

なし
```

### 4.3 セクション必須要素

| セクション | 必須/任意 | 内容 |
|---|---|---|
| Summary（重要度×カテゴリのマトリクス） | 必須 | 件数集計 |
| Security Issues | 必須 | 各 finding を重要度降順で列挙 |
| Quality Findings | 必須 | 各 finding を重要度降順で列挙 |
| Recommendations | 必須 | 上位3〜5件の優先順位付き提案 |
| Agent Errors | 任意（エラー時のみ） | エージェント実行失敗内容 |
| Trade-offs | 任意（Phase 2 / 矛盾検出時のみ） | 矛盾する提案のトレードオフ分析 |

---

## 5. 実装フェーズ計画

### Phase 1: Must-Have 達成（最小構成）

**スコープ**: 2エージェント + ハーネス基本実装

**タスク**:
1. `agents/security-reviewer.md` 作成（10パターン定義 / 出力スキーマ確定）
2. `agents/quality-reviewer.md` 作成（12パターン定義 / 同一出力スキーマ）
3. `agents/pr-review-harness.md` 作成
   - 前処理（言語判定・空diff判定）
   - 順次呼び出しロジック
   - 集約・重複排除
   - Markdown 整形
4. `samples/sample-vulnerable.diff`（SQLi + ハードコード秘密）
5. `samples/sample-quality.diff`（長関数 + 深ネスト）
6. `samples/expected-report-vulnerable.md`（期待レポート）
7. `samples/expected-report-quality.md`（期待レポート）
8. `README.md`（最低限の使い方）

**完成条件**:
- サンプル2件で検出率100%（仕込んだ脆弱性・品質問題をすべて検出）
- レポートが Security Issues / Quality Findings / Recommendations を含む
- エージェント定義が各200行以内
- 環境依存なしで再現可能

### Phase 2: Should-Have 追加

**スコープ**: 3体目エージェント + 矛盾検出 + ドキュメント

**タスク**:
1. `agents/test-reviewer.md` または `agents/architecture-reviewer.md` 追加
2. ハーネスの矛盾検出ロジック追加
   - 全エージェントの findings を横断的に走査
   - 既知の矛盾ペア（暗号化必須 vs 性能劣化、キャッシング vs タイムリーネス、等）を検出
   - `## Trade-offs` セクションに両提案を併記
3. `docs/agent-flow.md`（テキスト図でフロー記述）
4. `docs/adding-new-agent.md`（新規エージェント追加手順）

**完成条件**:
- 3体のエージェントが独立動作
- 矛盾検出が最低1パターンで動作
- 新規エージェント追加が手順書のみで可能

---

## 6. 技術スタック

| 領域 | 採用技術 |
|---|---|
| エージェント定義 | Claude Code Agent SDK の `.md` 形式 |
| ハーネス実装 | `.md`（Orchestrator/Planner として記述） |
| 出力形式 | Markdown（統一スキーマ） |
| 中間データ | JSON or YAML（エージェント間の構造化出力） |
| サンプル言語 | Python + JavaScript（既知脆弱性パターンが豊富） |
| 補助スクリプト | shell（Nice-to-Have の GH Actions 統合用） |
| テスト基盤 | サンプル diff 2件 + 期待レポート 2件の差分比較 |

---

## 7. 品質基準（完成判定条件）

### 7.1 セキュリティエージェント
- [ ] SEC-001〜SEC-010 の10パターンすべてが定義に明記されている
- [ ] サンプル `sample-vulnerable.diff` に仕込んだ脆弱性をすべて検出（検出率 100%）
- [ ] 各 finding が重要度・evidence・recommendation を持つ
- [ ] ファイル200行以内

### 7.2 コード品質エージェント
- [ ] QUAL-001〜QUAL-012 の12パターンすべてが定義に明記されている
- [ ] サンプル `sample-quality.diff` に仕込んだ問題をすべて検出（検出率 100%）
- [ ] 数値しきい値（50行/300行/4階層/複雑度10）が明文化
- [ ] ファイル200行以内

### 7.3 ハーネス
- [ ] 重要度別ソートが正確（Critical → High → Medium → Low）
- [ ] カテゴリ別グルーピングが正確（Security / Quality 別セクション）
- [ ] Summary マトリクスの集計が正確
- [ ] Recommendations が上位優先で3〜5件提示される
- [ ] Agent Errors セクションがエラー時のみ生成
- [ ] レポートが Markdown として valid（標準パーサで解釈可能）

---

## 8. エッジケース対応

### 8.1 大規模差分（1000行以上）

**戦略**:
- ハーネスが差分を「ファイル単位」または「hunk 単位」にチャンク分割
- 各チャンクごとにエージェントを呼び出し、結果をマージ
- 結合時、同一ファイル内の findings は line 順にソート
- レポート冒頭に `> Note: 大規模差分のため X チャンクに分割処理しました` を表示

**実装上の判断**:
- チャンクサイズしきい値：500行（実装者判断で調整可）
- 優先順位付けで重要部分のみ詳査するモード（`--mode=quick`）はオプション

### 8.2 矛盾する提案（Phase 2）

**例**:
- セキュリティ: 「全レスポンスを暗号化すべき」
- パフォーマンス: 「暗号化オーバーヘッドで応答が遅くなる」

**処理**:
- ハーネスが両 finding を検出した場合、`## Trade-offs` セクションを生成
- 両主張を並記し、判断材料を提示（優先度の選択は実装者に委ねる）
- 既知の矛盾ペアは `harness.md` 内に表形式で定義

```markdown
## Trade-offs

### Trade-off 1: 暗号化 vs パフォーマンス
- **Security 主張**: SEC-005 - 通信は TLS 1.3 必須
- **Performance 主張**: PERF-003 - TLS ハンドシェイクで応答遅延
- **判断材料**: 機密度の高いデータか / 内部通信か / レイテンシ要件
```

### 8.3 言語判定失敗

**処理**:
- ファイル拡張子から判定 → 失敗時は diff 内容のヒューリスティック判定
- それでも不明な場合 → `language: unknown` として処理続行
- レポート冒頭に Warning：
  ```markdown
  > Warning: 一部ファイルの言語判定に失敗しました（src/foo.xyz）。検出精度が低下している可能性があります。
  ```
- 言語非依存のパターン（ハードコード秘密、TODO残置 など）は引き続き検出

### 8.4 差分なし / 微小差分

**処理**:
- 0 行の追加・削除 → `> 差分なし` のみ含む短縮レポート
- 1〜3行の追加 → 通常通り検査するが、レポートに `> Note: 軽微な差分` を表示

---

## 9. 受け入れテスト

### 9.1 サンプルコード1：脆弱性を含む差分

**ファイル**: `samples/sample-vulnerable.diff`

**仕込む脆弱性（最低5件）**:
1. SEC-001: SQL インジェクション（文字列連結）
2. SEC-004: ハードコードされた API キー
3. SEC-002: XSS（`innerHTML` への直接代入）
4. SEC-005: MD5 によるパスワードハッシュ
5. SEC-007: `pickle.loads` の使用

**期待される検出**:
- 上記5件すべてを検出
- 重要度が Critical/High に正しく分類される
- 各 finding に evidence と recommendation が含まれる

**判定**: 5/5 = 検出率 100% で合格

### 9.2 サンプルコード2：品質問題を含む差分

**ファイル**: `samples/sample-quality.diff`

**仕込む品質問題（最低5件）**:
1. QUAL-001: 60行を超える関数
2. QUAL-003: 5階層のネスト
3. QUAL-005: 命名規則違反（`MyVAR_name` 等）
4. QUAL-010: 空の `except:` ブロック
5. QUAL-006: マジックナンバー（`if x > 86400:` 等）

**期待される検出**:
- 上記5件すべてを検出
- 重要度が High/Medium/Low に正しく分類される
- 各 finding に該当行・recommendation が含まれる

**判定**: 5/5 = 検出率 100% で合格

### 9.3 統合テスト

- [ ] サンプル1 + サンプル2 を同時入力 → 統合レポートで Security Issues と Quality Findings の両セクションが生成される
- [ ] Summary マトリクスの件数が正確
- [ ] Recommendations が上位優先で並ぶ
- [ ] レポート Markdown が標準ビューアで崩れず表示される

### 9.4 エッジケーステスト

- [ ] 空 diff 入力 → 短縮レポートが返る
- [ ] 言語不明 diff（`.xyz` 拡張子）→ Warning 付きレポートが返る
- [ ] 1000行超 diff → 分割処理 Note 付きレポートが返る
- [ ] エージェント1つが失敗 → もう一方は継続、Agent Errors セクションに記録

---

## 10. ディレクトリ構造（推奨）

```
theme-a/opus-haiku/
├── spec.md                              ← 本ファイル
├── agents/
│   ├── security-reviewer.md             ← Phase 1
│   ├── quality-reviewer.md              ← Phase 1
│   ├── pr-review-harness.md             ← Phase 1
│   └── test-reviewer.md                 ← Phase 2（任意）
├── samples/
│   ├── sample-vulnerable.diff           ← Phase 1
│   ├── sample-quality.diff              ← Phase 1
│   ├── expected-report-vulnerable.md    ← Phase 1
│   └── expected-report-quality.md       ← Phase 1
├── docs/
│   ├── agent-flow.md                    ← Phase 2
│   └── adding-new-agent.md              ← Phase 2
└── README.md                            ← 使い方
```

---

## 11. 実装上の判断ポイント（曖昧さの明示）

| 項目 | 判断委譲先 | 補足 |
|---|---|---|
| Critical/High の境界判定 | セキュリティエージェント内のテーブル | 本仕様 3.1 の表に準拠 |
| 関数長・複雑度のしきい値 | コード品質エージェント内 | 本仕様 3.2 の表に準拠（50行/4階層/10） |
| 重複排除の同一性キー | ハーネス内 | `(file, line, id)` の3つ組 |
| 並列 vs 順次呼び出し | Phase 1 は順次、Phase 2 で並列化検討 | 実装簡素化のため |
| チャンク分割サイズ | ハーネス内 | デフォルト500行 |
| 言語判定の優先順位 | ハーネス内 | 拡張子 → ヒューリスティック → unknown |
| 矛盾ペアの定義 | Phase 2 ハーネス内 | 既知ペアを表で列挙 |

---

## 12. 参照

- テーマ定義: `Output/07_comparisons/planner-model-comparison/agent-build/theme-a/theme.md`
- グローバルコーディング規約: `~/.claude/CLAUDE.md`（命名規則・セキュリティ・コメント方針）
- プロジェクト規約: `/Users/yasuvel/StudyECC/CLAUDE.md`
