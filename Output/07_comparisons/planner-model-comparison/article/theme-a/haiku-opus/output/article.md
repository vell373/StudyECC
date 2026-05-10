# Claude Code のサブエージェントを使ってコードレビューを自動化する方法

## はじめに

ソフトウェア開発において、コードレビューは品質保証の重要なプロセスです。しかし現実は、手動レビューには多くの課題がつきまといます。時間がかかる、観点がばらつく、属人化してしまう──これらの問題は開発チーム全体の生産性を圧迫しています。

Claude Code のマルチエージェント機能を活用することで、こうした課題を大きく改善できます。セキュリティ監査、命名規則チェック、パフォーマンス検査、設計原則審査など、複数の観点を担当するサブエージェント群を設計・運用することで、スケーラブルで透明性の高いコードレビュープロセスを実現できるのです。

本記事では、マルチエージェント化されたコードレビューの具体的な設計から実装、運用まで、実践的なステップを提供します。読者はこの記事を通じて、自社プロジェクトへの適用可能性を判断し、段階的な導入計画を立てられるようになることを目指しています。

---

## 既存のコードレビュー方法の課題

### 手動レビューの限界

従来のコードレビューは、人的判断に大きく依存しています。これには以下の課題があります：

- **時間的コスト**: PR（プルリクエスト）あたり平均2〜3時間の手動レビュー工数が必要
- **観点のばらつき**: レビュアーによって着目ポイントが異なり、チェック基準が統一されない
- **属人化**: ベテランレビュアーの見つけ漏れが組織全体のリスク
- **スケーラビリティの欠如**: チーム規模が大きくなると、レビュー待機時間が急増

### 既存自動化ツールの現状

GitHub / GitLab の既存レビュー機能や linter、静的解析ツール（ESLint、Pylint など）は有用ですが、以下の点で限界があります：

| 項目 | 手動レビュー | 既存自動化ツール | マルチエージェント方式 |
|-----|-----------|------------|-----------|
| 並行実行可能性 | 低（レビュアー数依存） | 中（ツール設定に依存） | **高**（複数エージェント並行） |
| セキュリティ脆弱性検出 | 良 | 限定的（既知パターンのみ） | **良**（エージェント群で多角的） |
| 命名規則・規約チェック | 良 | 良（設定依存） | **良**（カスタマイズ容易） |
| 設計原則審査（SOLID等） | 良 | 弱 | **良**（専任エージェント） |
| チームの知見統合 | 属人的 | 機械的 | **体系化可能** |
| カスタマイズ性 | 最小 | 中（コンフィグのみ） | **最大**（エージェント仕様設計） |

### マルチエージェント導入による改善範囲

マルチエージェント方式は「完全自動化」ではなく、以下の観点を明確に分離します：

- **自動チェック対象**: セキュリティ脆弱性、命名規則、テストカバレッジ、パフォーマンス問題
- **人間の判定対象**: アーキテクチャ決定、ビジネスロジック妥当性、UX への影響

この線引きにより、機械的チェックで工数を削減しながら、人間の判断が必要な部分に集中できます。

---

## マルチエージェント設計の基本

### Claude Code のサブエージェント概念

Claude Code では、単一の AI エージェントではなく、役割分担した複数のサブエージェントを組織できます。各エージェントは独立した責務を持ち、必要に応じて他のエージェント結果をコンテキストとして受け取ります。これにより、複雑なコードレビュープロセスを体系的に進められます。

### コードレビューをエージェント群に分割する設計思想

コードレビューの複数観点を、以下のようにエージェント群に分割することが推奨されます：

| エージェント | 責務 | 入力 | 出力 |
|---------|------|------|------|
| **SecurityReviewAgent** | セキュリティ脆弱性検出（認証情報硬化、SQLインジェクション、など） | コード全文 | 脆弱性リスト (JSON) |
| **ConventionAgent** | 命名規則、コード規約、スタイルガイド準拠度 | コード全文 + ルールセット | 違反項目リスト |
| **PerformanceAgent** | 実行効率、メモリ効率、アルゴリズム的な問題検出 | コード全文 + 実行メトリクス（オプション） | パフォーマンス警告 |
| **DesignAgent** | SOLID原則、アーキテクチャパターン妥当性、責務分離 | コード構造 + アーキテクチャドキュメント | 設計上の問題指摘 |
| **TestCoverageAgent** | テストカバレッジ率、テストの質、エッジケース検出 | テスト実行結果 + コード | カバレッジレポート |

### エージェント間の依存関係と通信パターン

**シーケンシャル実行の例**:
```
1. SecurityAgent → 脆弱性チェック
   ↓
2. ConventionAgent → 規約チェック（前段階の結果を参照）
   ↓
3. AggregationAgent → 全結果の集約とレポート生成
```

**パラレル実行の例**:
```
PullRequest
  ├─ SecurityAgent (並行)
  ├─ ConventionAgent (並行)
  ├─ PerformanceAgent (並行)
  └─ TestCoverageAgent (並行)
    → AggregationAgent （全結果集約）
```

パラレル実行により、総実行時間は単一エージェント実行時間に近づきます。セキュリティと規約チェックなど「独立した観点」はパラレル実行、セキュリティ結果を踏まえた詳細検査など「依存関係がある観点」はシーケンシャルに設計します。

---

## 実装のポイント

### CLAUDE.md でのエージェント定義

`.claude/CLAUDE.md` では、各エージェントのメタ情報を記述します：

```yaml
# エージェント定義例（Markdown風）

## エージェント: SecurityReviewAgent
- 責務: PRのセキュリティ脆弱性を検出
- 入力形式: PR番号, コード差分
- スキル:
  - pattern-matching: 既知の脆弱性パターンを正規表現で検出
  - credential-scanner: APIキー等の硬化情報検出
  - sql-injection-check: SQL文における不安全なバインディング検出
- 出力形式: JSON
  ```json
  {
    "agent": "SecurityReviewAgent",
    "status": "completed",
    "findings": [
      {"severity": "HIGH", "type": "hardcoded_credential", "line": 42, "detail": "..."},
      {"severity": "MEDIUM", "type": "sql_injection_risk", "line": 105, "detail": "..."}
    ],
    "summary": "Found 2 issues, 1 HIGH severity"
  }
  ```
- 実行時間: 平均 30秒
- 次エージェント: ConventionAgent へ自動パス（findings を context に含める）

## エージェント: ConventionAgent
- 責務: コード規約・命名規則の準拠度チェック
- 入力形式: コード全文 + チームの規約ドキュメント
- スキル:
  - naming-checker: camelCase / PascalCase / snake_case の規約確認
  - style-validator: インデント、括弧配置など
  - doc-completeness: JSDoc / docstring の有無チェック
- 出力形式: JSON （上記と同様）
```

### settings.json での hooks 構成

`settings.json` の `hooks` セクションでエージェント実行の トリガーと順序を定義します：

```json
{
  "version": "1.0",
  "hooks": [
    {
      "event": "on_pr_created",
      "description": "PRが作成されたとき、セキュリティチェック開始",
      "agents": ["SecurityReviewAgent"],
      "parallel": false,
      "timeout_seconds": 60
    },
    {
      "event": "security_review_completed",
      "description": "セキュリティチェック後、規約とパフォーマンスを並行実行",
      "agents": ["ConventionAgent", "PerformanceAgent"],
      "parallel": true,
      "timeout_seconds": 90
    },
    {
      "event": "convention_and_perf_completed",
      "description": "すべてのエージェント完了後、レポート集約",
      "agents": ["AggregationAgent"],
      "parallel": false,
      "timeout_seconds": 30,
      "output_destination": "pr_comment"
    }
  ],
  "agent_context_sharing": {
    "enabled": true,
    "max_context_size_mb": 10
  }
}
```

### エージェント間のコンテキスト共有方法

先行エージェントの出力結果（findings、summary など）を、後続エージェントへ `context` として自動的に渡します：

```json
// SecurityAgent → ConventionAgent への context パス例

// SecurityAgent の出力
{
  "status": "completed",
  "findings": [
    {"severity": "HIGH", "line": 42}
  ]
}

// ConventionAgent の入力（context に含まれる）
{
  "code_diff": "...",
  "upstream_findings": {
    "SecurityAgent": {
      "status": "completed",
      "findings": [...]
    }
  }
}
```

### エラーハンドリング・フォールバック戦略

各エージェントがタイムアウトやエラーで失敗した場合：

1. **Retry ポリシー**: 最大3回まで再実行
2. **Fallback エージェント**: セキュリティチェック失敗時は人間のレビュアーへ自動エスカレーション
3. **Partial Results**: 一部エージェントが失敗しても、成功した部分結果は集約して報告

これにより、「1つのエージェント障害 = 全プロセス停止」を避けられます。

---

## 実装例

### 実装例1: CLAUDE.md のエージェント定義（簡略版）

```yaml
# .claude/CLAUDE.md から抜粋

---
# エージェント定義セクション

## エージェント群: CodeReviewAgents
複数のコードレビュー観点を分担するエージェント群

### 1. SecurityReviewAgent
- **責務**: PR内のセキュリティ脆弱性を検出
- **スキル**: credential-scanner, sql-injection-detector, auth-pattern-checker
- **入力**: PR差分、変更ファイルリスト
- **出力フォーマット**:
  ```json
  {
    "agent": "SecurityReviewAgent",
    "status": "completed|failed",
    "findings": [
      {
        "severity": "HIGH|MEDIUM|LOW",
        "type": "credential|sql_injection|auth_bypass",
        "file": "src/auth.py",
        "line": 42,
        "snippet": "api_key = 'sk-xxxxx'",
        "recommendation": "APIキーを環境変数から読み込んでください"
      }
    ],
    "execution_time_ms": 2500
  }
  ```

### 2. ConventionAgent
- **責務**: コード規約・命名規則の準拠度をチェック
- **スキル**: naming-validator, style-checker, doc-verifier
- **入力**: コード全文、チーム規約定義
- **出力フォーマット**: SecurityAgent と同様（findings配列に違反を記載）

### 3. AggregationAgent
- **責務**: 全エージェント結果を集約し、PR コメント用レポート生成
- **入力**: 先行エージェントすべての出力
- **出力フォーマット**:
  ```json
  {
    "pr_number": 1234,
    "summary": "Found 3 issues (1 HIGH, 2 MEDIUM)",
    "security_findings": [...],
    "convention_findings": [...],
    "performance_findings": [...],
    "md_report": "## Code Review Report\n..."
  }
  ```
```

### 実装例2: settings.json の hooks 設定

```json
{
  "version": "1.0",
  "hooks": [
    {
      "id": "review_init",
      "event": "on_pr_created",
      "trigger": {
        "repository": "*",
        "branch_pattern": "feature/*"
      },
      "actions": [
        {
          "agent": "SecurityReviewAgent",
          "timeout_ms": 60000,
          "retry_count": 3,
          "continue_on_error": false
        }
      ],
      "next_event": "security_review_done"
    },
    {
      "id": "review_parallel",
      "event": "security_review_done",
      "trigger": {
        "upstream_status": "completed"
      },
      "actions": [
        {
          "agent": "ConventionAgent",
          "timeout_ms": 45000,
          "parallel_with": ["PerformanceAgent"]
        },
        {
          "agent": "PerformanceAgent",
          "timeout_ms": 45000
        }
      ],
      "next_event": "parallel_review_done"
    },
    {
      "id": "review_aggregate",
      "event": "parallel_review_done",
      "actions": [
        {
          "agent": "AggregationAgent",
          "timeout_ms": 30000
        }
      ],
      "on_completion": {
        "post_to_pr": true,
        "notify_team": true
      }
    }
  ],
  "agent_communication": {
    "protocol": "context_sharing",
    "max_payload_mb": 5,
    "format": "json"
  }
}
```

### 実装例3: エージェント出力フォーマットと集約

```json
// SecurityAgent の出力例
{
  "agent": "SecurityReviewAgent",
  "status": "completed",
  "findings": [
    {
      "severity": "HIGH",
      "type": "hardcoded_credential",
      "file": "config/db.py",
      "line": 8,
      "snippet": "password='prod-password-xyz'",
      "recommendation": "環境変数 DB_PASSWORD を使用してください"
    },
    {
      "severity": "MEDIUM",
      "type": "sql_injection_risk",
      "file": "models/user.py",
      "line": 45,
      "snippet": "query = f\"SELECT * FROM users WHERE id={user_id}\"",
      "recommendation": "パラメータバインディングを使用: query = \"SELECT * FROM users WHERE id=%s\""
    }
  ],
  "execution_time_ms": 3200
}

// ConventionAgent の出力例
{
  "agent": "ConventionAgent",
  "status": "completed",
  "findings": [
    {
      "severity": "LOW",
      "type": "naming_convention",
      "file": "utils/helper.py",
      "line": 12,
      "snippet": "def getUserData():",
      "recommendation": "関数名は snake_case で: get_user_data()"
    },
    {
      "severity": "LOW",
      "type": "missing_docstring",
      "file": "utils/helper.py",
      "line": 12,
      "snippet": "def get_user_data():",
      "recommendation": "関数の目的と パラメータを docstring で記載してください"
    }
  ],
  "execution_time_ms": 2100
}

// AggregationAgent による統合レポート
{
  "pr_number": 5678,
  "title": "Add user authentication",
  "summary": {
    "total_findings": 4,
    "high_severity": 1,
    "medium_severity": 1,
    "low_severity": 2
  },
  "md_report": "## Code Review Report\n\n### Security Issues\n- **HIGH**: Hardcoded credential detected in config/db.py:8\n- **MEDIUM**: SQL injection risk in models/user.py:45\n\n### Convention Issues\n- **LOW**: Naming convention violation in utils/helper.py:12\n- **LOW**: Missing docstring in utils/helper.py:12\n\n### Recommendations\n1. すべての認証情報は環境変数から読み込む\n2. SQL はパラメータバインディングを使用する\n3. Python 関数名は snake_case に統一\n4. 公開関数には docstring を記載する\n",
  "timestamp": "2026-05-09T14:30:00Z"
}
```

---

## 運用のコツ

### 運用を始める前に確認すべきチェックリスト

本番運用へ移行する前に、以下を確認してください：

- [ ] 各エージェントの実行時間計測完了（大幅な遅延がないか）
- [ ] エージェント間のコンテキスト共有が正常に機能している
- [ ] エラーハンドリング（タイムアウト、再試行）が想定通り動作
- [ ] チームの規約定義をすべてのエージェントが参照できる状態
- [ ] PR コメント投稿の権限設定確認
- [ ] チーム内での結果の解釈ルール（HIGH severity = 必ずマージ前に修正、など）を合意済み
- [ ] 誤検知が多い項目は一覧化し、エージェント設定で調整可能な状態

### よくあるトラブルと対策表

| 問題 | 原因 | 対策 |
|-----|------|------|
| エージェント間でコンテキストが失われる | 出力フォーマットの不統一 | JSON スキーマを統一し、事前テスト |
| 総実行時間が 5 分以上 | エージェントが逐次実行している | パラレル実行可能な観点を分離 |
| 誤検知が多い（false positive） | ルール定義が厳しすぎる | 段階的にルール緩和、またはエージェント責務を削減 |
| レビュアーが結果をスキップしている | レポートが冗長、理解困難 | 重要度別に要約、または視覚化工夫 |
| 新規プロジェクトではルール適用されない | 規約定義がプロジェクト単位で異なる | プロジェクト初期化時に CONVENTION.md を設置するフロー確立 |

### メトリクス案（成功の測定方法）

継続的な改善のため、以下のメトリクスを定期（週単位）に計測してください：

- **リリース後バグ数**: マルチエージェント導入前後の比較
- **コードレビュー工数**: PR あたり平均レビュー時間
- **セキュリティ脆弱性検出率**: エージェント検出数 vs 手動検出数（後付け）
- **誤検知率**: エージェント指摘が実は問題ではなかった割合
- **チーム満足度**: 月1回のアンケート（レビュー品質、時間短縮実感、使いやすさ）

---

## まとめ

Claude Code のマルチエージェント機能を活用したコードレビュー自動化は、以下の三大メリットをもたらします：

1. **スケーラビリティ**: エージェント群により、レビュー工数を PR あたり 1〜2 時間に削減
2. **透明性**: チェック観点が明確化され、「なぜこの指摘が入ったのか」が可視化
3. **カスタマイズ性**: 自社の規約・文化に合わせてエージェント設計を調整可能

ただし、このアプローチには限界もあります：

- **100%自動化は目指さない**: 建築設計、ビジネスロジック妥当性判定は人間の判断が必須
- **継続的な改善が必要**: 誤検知削減、ルール調整は運用フェーズで段階的に実施
- **チーム全体の合意**: エージェント結果をどう扱うか、誰が最終判定するかはチーム文化に依存

### 推奨される導入順序（段階的アプローチ）

1. **Phase 1（2週間）**: SecurityReviewAgent のみ運用開始。チームが結果に慣れる
2. **Phase 2（4週間）**: ConventionAgent 追加。並行実行テスト
3. **Phase 3（8週間）**: PerformanceAgent、DesignAgent 追加。全エージェント運用
4. **Phase 4（継続）**: メトリクス計測に基づき、ルール調整、エージェント責務の見直し

### 次のステップ

本記事で学んだアプローチをベースに、以下を検討してください：

- 外部ツール連携: SonarQube、OWASP Dependency-Check との統合
- テスト自動化との融合: CI/CD パイプラインへの組み込み
- 他の開発フローへの拡張: コミットメッセージレビュー、リリースノート生成など

マルチエージェント化は、一度構築すれば終わりではなく、チームの成長とともに進化するシステムです。段階的に、着実に導入を進めてください。

---

**記事執筆日**: 2026-05-09  
**対象読者**: ソフトウェアエンジニア、DevOps エンジニア、テックリード  
**前提知識**: Claude Code の基本的な使い方（エージェント、スキル、hooks）
