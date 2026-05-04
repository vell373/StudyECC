# e2e

**分類**: skill / command / agent

## 定義
E2E (End-to-End) とは、システムの端から端まで（フロントエンドからバックエンド、データベースまで）を実際のユーザー操作に近い形でテストする手法。
ECC においては、主に **Playwright** を使用したブラウザベースの自動テストを指し、ユーザーの「クリティカルな操作フロー」が正常に動作することを検証するために使用される。

## ECC での使われ方
ECC では、開発サイクルの重要なステップとして E2E テストが組み込まれている。

- **コマンド**: `/e2e` コマンドにより、E2E テストの生成や実行が可能。
- **エージェント**: `e2e-runner` という専用エージェントが存在し、Playwright を用いたテスト実行を担当する。
- **スキル**: `e2e-testing` スキルが、Page Object Model (POM) やテスト構成、CI/CD 連携のパターンを提供している。
- **ワークフロー**: `tdd-workflow` スキルにおいても、ユニットテストや統合テストと並んで E2E テストの実施（カバレッジ 80% 以上）が推奨されている。

## 他の用語との関係
- **TDD (Test Driven Development)**: テスト駆動開発。E2E テストはその一環として実行される。
- **ユニットテスト / 統合テスト**: テストのピラミッドにおいて、E2E は最上位（最も広範囲かつ高コスト）に位置する。
- **Playwright**: E2E テストを実現するための主要なツール。

## 参照
- `ECC/skills/e2e-testing/SKILL.md`
- `ECC/rules/common/testing.md`
- `ECC/manifests/install-components.json` (e2e-runner)
