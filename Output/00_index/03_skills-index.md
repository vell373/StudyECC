# ECC スキル詳細カタログ (182 Skills)

スキルは、特定の技術、フレームワーク、またはビジネスドメインに関する「手順書」と「ベストプラクティス」の集合体です。`skills/<domain>/SKILL.md` に配置され、エージェントがタスク実行中に参照します。

---

## 🏗 テスト・品質・検証 (Test & Quality)
ECCの「高品質なコード」を支えるエンジンです。

| スキル名 | 役割 | 関連コマンド |
|---------|-----|-------------|
| **tdd-workflow** | Red-Green-Refactorの手順とモック化のパターン。 | `/tdd` |
| **verification-loop**| ビルド・テスト・リンターを回し続ける自動検証サイクル。 | `/verify` |
| **eval-harness** | AIの回答品質を定量的に評価するための評価基盤。 | `/eval` |
| **e2e-testing** | Playwrightを使用したE2Eテストの生成と実行。 | `/e2e` |

### ⚡ 重要: `tdd-workflow`
- **内容**: 単体テストだけでなく、統合テストやE2Eテストとの役割分担、依存モジュールのモック化、カバレッジ80%を達成するためのテクニックが凝縮されています。
- **依存ルール**: `rules/common/testing.md`

---

## 🧠 AI・エージェント・学習 (AI & Learning)
AIが自己進化し、コンテキストを効率的に扱うためのスキル群です。

- **continuous-learning-v2**: 過去のセッションからパターンを抽出し、「本能（Instincts）」として保存する。
- **autonomous-loops**: 自律的なエージェントループの設計と、失速を防ぐためのチェックポイント。
- **strategic-compact**: コンテキスト（記憶）が重くなった時に、重要な情報を落とさずに要約・圧縮する。
- **prompt-optimizer**: ユーザーの曖昧な指示を、ECCが理解しやすい「高密度プロンプト」に変換する。

---

## 💻 言語・フレームワーク固有 (Tech Stack)
特定の技術スタックにおける「正しい書き方」を定義します。

- **Frontend**: `nextjs-patterns`, `react-query-patterns`, `tailwind-styling`, `a11y-standards`
- **Backend**: `nestjs-patterns`, `django-best-practices`, `go-concurrency-safety`, `rust-ownership-guide`
- **Database**: `supabase-rls-policies`, `prisma-optimization`, `migration-patterns`
- **Mobile**: `flutter-state-management`, `react-native-performance`

---

## 🏥 業界特化 (Vertical Domains)
特定のビジネス領域における複雑な要件や法規制に対応します。

- **Healthcare**: `hipaa-compliance`, `phi-anonymization`, `emr-fhir-integration`
- **Finance**: `stripe-billing-ops`, `accounting-ledger-design`
- **Logistics**: `inventory-demand-planning`, `carrier-relationship-management`
- **Media**: `video-editing-automation`, `videodb-integration`

---

## 🔧 ECC 自体の管理 (Meta Skills)
ECCを快適に使うための設定やメンテナンス用スキルです。

- **configure-ecc**: ハーネスの設定変更や、エージェントの有効化/無効化。
- **skill-stocktake**: 現在のスキルポートフォリオの健康状態をチェックする。
- **workspace-surface-audit**: プロジェクトのディレクトリ構造がECCの標準に沿っているか診断する。

---

## 🔍 スキルカタログ・テーブル（一部抜粋）

| カテゴリ | スキル名 (例) |
|---------|-------------|
| **設計** | architectural-decision-records, design-system-sync, api-contract-first |
| **セキュリティ** | secret-management, security-scan, dependency-audit, gateguard |
| **インフラ** | docker-compose-patterns, github-actions-automation, terraform-best-practices |
| **ドキュメント** | writing-style-guide, automated-changelog, architecture-map-gen |

---

**依存関係**:
- ← **参照元**: `tdd-guide` (tdd-workflowを読み込み), `planner` (patternsを参照)
- ↔ **相互関係**: スキル同士が依存し合うことがあります（例: `e2e-testing` は `verification-loop` を利用）。
- 💡 **ヒント**: 182すべてのスキル名は、ECCルートの `agent.yaml` または `COMMANDS-QUICK-REF.md` からも確認できます。
