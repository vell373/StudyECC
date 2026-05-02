# ECC クロスハーネス対応詳細 (8 Harnesses)

ECCは、Claude Codeだけでなく、様々なAIコーディングツールやIDEに対して最適化された設定（ハーネス）を提供しています。これにより、ツールを乗り換えても同じ品質・ルールで開発を継続できます。

---

## 🛠 対応ハーネス一覧

| ハーネス名 | 対象ツール / IDE | 設定ファイル例 | 役割 |
|-----------|-----------------|--------------|------|
| **`.claude`** | Claude Code (Anthropic) | `CLAUDE.md`, `settings.json` | ECCのメインプラットフォーム。フックやカスタムコマンドがフル機能で動作。 |
| **`.cursor`** | Cursor IDE | `.cursorrules` | Cursorの「Rules for AI」にECCのルールを注入し、IDE内でのAIの振る舞いを制御。 |
| **`.codex`** | OpenAI Codex / ChatGPT | `AGENTS.md`, `RULES.md` | 大規模なコンテキストを持つ外部モデル用に、情報を1ファイルに統合したプロンプトを提供。 |
| **`.gemini`** | Google Gemini (Code Assist) | `.gemini/rules/` | Geminiのコンテキストウィンドウの広さを活かした、より詳細なプロジェクト知識の提供。 |
| **`.trae`** | Trae (ByteDance IDE) | `.trae/rules/` | Trae独自のAIエージェント機能に向けたルールセット。 |
| **`.kiro`** | Kiro | `.kiro/` | Kiroプラットフォーム向けの特定設定。 |
| **`.opencode`** | OpenCode | `.opencode/` | オープンソース系AIツール向けの汎用設定。 |
| **`.codebuddy`**| CodeBuddy | `.codebuddy/` | CodeBuddy独自のワークフローへの対応。 |

---

## 🔄 ハーネス間の情報同期
ECCは「**Single Source of Truth (単一の真実)**」の思想を徹底しています。

- **ルール**: `rules/common/` の中身が、各ツールの独自形式（例: `.cursorrules`）に自動的にコンパイル/同期されます。
- **エージェント**: `agents/` の個別定義が、外部モデル用の統合ドキュメント（`AGENTS.md`）として1つにまとめられます。

---

## 🚀 乗り換えガイド
他のツールからECCの恩恵を受ける方法です。

1.  **Cursorで使用する**:
    - リポジトリルートに `.cursorrules` を配置します。ECCのインストーラを使うと、プロジェクトのルールを反映した最新の `.cursorrules` が生成されます。
2.  **外部のブラウザ版AI（ChatGPT/Claude.ai）で使用する**:
    - リポジトリの `AGENTS.md` または `RULES.md` を読み込ませることで、ローカルのECCと同じコンテキストをAIに共有できます。
3.  **ハーネスの監査**:
    - `/harness-audit` コマンドを実行すると、現在どのハーネスが有効で、設定に不備（古いルールの残存など）がないか自動診断します。

---

**依存関係**:
- **管理コマンド**: `/harness-audit`, `/hookify-*` 系列
- **インフラ**: `manifests/` に各ハーネスのインストールプロファイルが定義されています。
- **同期スクリプト**: `scripts/ci/catalog.js` 等がドキュメントの整合性をチェックします。
