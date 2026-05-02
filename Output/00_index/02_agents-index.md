# ECC エージェント詳細カタログ (48 Agents)

ECCのエージェントは、特定の専門領域に特化したMarkdownプロンプト定義です。各エージェントは独立しており、タスクに応じて他のエージェントへバトンを渡す（オーケストレーション）ように設計されています。

---

## 🎨 計画・設計・指揮 (Planning & Orchestration)

プロジェクトの全体像を描き、実装の「青写真」を作るエージェント群です。

| エージェント名 | 推奨モデル | 主な役割 | 依存関係・連携 |
|--------------|----------|---------|---------------|
| **planner** | Opus | 要件分析、フェーズ分けされた実装計画の作成、リスク評価。 | ← `/plan` コマンドから起動 |
| **architect** | Opus | システム設計、技術選定、ADR（アーキテクチャ意思決定記録）の作成。 | ← `/multi-plan` で主導 |
| **chief-of-staff** | Sonnet | ユーザーの意図を汲み取り、適切なエージェントやコマンドを推奨する。 | 全エージェントの案内役 |

### ⚡ 深掘り: `planner` (`agents/planner.md`)
- **何をするか**: 複雑な機能実装を「実行可能な小さなステップ」に分解します。
- **特徴**: いきなりコードを書かず、まずはMarkdownで「計画書」を出力し、ユーザーの「承認」を待つプロセスを強制します。
- **チェック項目**: 50行以上の巨大な関数がないか、テスト戦略があるか、フェーズが独立してデリバリー可能か。

---

## 🛡 レビュー・セキュリティ・品質 (Review & Security)

書かれたコードがECCの品質基準を満たしているかを厳格にチェックします。

| エージェント名 | 主な役割 | カテゴリ |
|--------------|---------|---------|
| **code-reviewer** | 汎用コードレビュー。セキュリティ、品質、保守性をチェック。 | 汎用 |
| **security-reviewer** | OWASP Top 10、秘密情報漏洩、インジェクションの検知。 | セキュリティ |
| **tdd-guide** | TDD（テスト駆動開発）の徹底。Red-Green-Refactorを強制。 | 品質 |
| **pr-test-analyzer** | PR内のテストカバレッジと質を分析し、マージ可否を判断。 | 品質 |
| **a11y-architect** | アクセシビリティ（WCAG準拠）の設計とレビュー。 | アクセシビリティ |

### ⚡ 深掘り: `code-reviewer` (`agents/code-reviewer.md`)
- **何をするか**: `git diff` を読み、変更箇所だけでなく「周囲のコンテキスト」を含めてレビューします。
- **判定基準**: セキュリティ(CRITICAL)、品質(HIGH)、Reactパターン(HIGH)、パフォーマンス(MEDIUM)の4段階。
- ** verdict (評決)**: CRITICALがある場合はマージを「ブロック」します。

---

## 🛠 ビルド修正・言語専門 (Build & Language Specific)

特定言語のコンパイルエラー解決や、言語固有のベストプラクティスを適用します。

| 言語 | レビュー用エージェント | ビルド修正用エージェント |
|---|---|---|
| **TypeScript/JS** | `typescript-reviewer` | `build-error-resolver` |
| **Go** | `go-reviewer` | `go-build-resolver` |
| **Python** | `python-reviewer` | `pytorch-build-resolver` |
| **Rust** | `rust-reviewer` | `rust-build-resolver` |
| **Java / Kotlin** | `java/kotlin-reviewer` | `java/kotlin-build-resolver` |
| **C++** | `cpp-reviewer` | `cpp-build-resolver` |
| **Dart / Flutter** | `flutter-reviewer` | `dart-build-resolver` |

---

## 🚀 最適化・自動化・運用 (Optimization & Ops)

既存コードの改善や、自律的なエージェントループの管理を行います。

| エージェント名 | 主な役割 | 依存スキル |
|--------------|---------|-----------|
| **refactor-cleaner** | デッドコード除去、重複統合、構造の整理。 | `refactor-clean` |
| **performance-optimizer**| ボトルネック分析、キャッシュ戦略の提案。 | なし |
| **loop-operator** | 自律エージェントループの監視、失速時の介入、コスト管理。 | `autonomous-loops` |
| **harness-optimizer** | エージェントハーネス自体の設定（プロンプト等）を最適化。 | `harness-audit` |

---

## 🔬 分析・探索・ドキュメント (Analysis & Docs)

既存コードの理解を助け、知識ベースを最新に保ちます。

- **code-explorer**: 未知のコードベースを探索し、主要なエントリポイントを特定。
- **type-design-analyzer**: 型定義の整合性と設計の美しさを分析。
- **doc-updater**: コードの変更に合わせて `README.md` や `docs/` を自動更新。
- **docs-lookup**: ライブラリの公式ドキュメントやAPIリファレンスを検索。

---

## 🤖 特殊用途 (Specialized)

- **GAN系列 (`gan-*`)**: 生成AI（Generator）と評価AI（Evaluator）を戦わせる手法での開発。
- **OSS系列 (`opensource-*`)**: OSSのフォーク、サニタイズ、パッケージ公開の支援。
- **Healthcare系列**: PHI（個人健康情報）の保護やEMR連携の専門知識を持つ。

---

**依存関係チェーン**:
1.  **呼び出し元**: `/plan`, `/code-review`, `/tdd` などのスラッシュコマンド
2.  **呼び出し先**: 各エージェントは必要に応じて `skills/` の知識を参照
3.  **制約**: `rules/common/` のルールに常に縛られる
4.  **監視**: `hooks/` がエージェントの「ツール使用」を監視し、逸脱を阻止
