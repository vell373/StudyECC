# 08_roadmap — 学習ロードマップ・進捗管理

ECC をどの順番で読み解くか、今どこまで進んでいるかを管理する場所。

## 推奨学習順序

ECC のコンポーネントには依存関係がある。以下の順序で進めると理解しやすい。

```
Phase 1: 全体像の把握
  └─ ECC/CLAUDE.md          → プロジェクト全体の設計思想を掴む
  └─ ECC/AGENTS.md          → エージェント設計の思想を掴む
  └─ ECC/SOUL.md            → ハーネスの哲学を掴む

Phase 2: 基盤コンポーネント
  └─ ECC/rules/             → 常に適用されるルールの仕組み
  └─ ECC/hooks/             → イベント駆動の自動化の仕組み

Phase 3: スキル・コマンド
  └─ ECC/skills/            → on-demandで呼ばれるワークフロー定義
  └─ ECC/commands/          → ユーザーが呼ぶスラッシュコマンド

Phase 4: エージェント
  └─ ECC/agents/            → 専門化されたサブエージェント群

Phase 5: 統合・応用
  └─ ECC/contexts/          → コンテキスト設計
  └─ ECC/mcp-configs/       → MCP サーバー連携
  └─ ECC/manifests/         → プラグイン・設定管理
```

## 進捗トラッカー

### Phase 1: 全体像の把握
- [ ] ECC/CLAUDE.md
- [ ] ECC/AGENTS.md
- [ ] ECC/SOUL.md

### Phase 2: 基盤コンポーネント
- [ ] ECC/rules/
- [ ] ECC/hooks/

### Phase 3: スキル・コマンド
- [ ] ECC/skills/ （代表的なものをピックアップ）
- [ ] ECC/commands/

### Phase 4: エージェント
- [ ] ECC/agents/

### Phase 5: 統合・応用
- [ ] ECC/contexts/
- [ ] ECC/mcp-configs/
- [ ] ECC/manifests/

## 学習ゴール指標

- [ ] ECC の各コンポーネントの役割を説明できる
- [ ] agent / skill / hook / command の違いを説明できる
- [ ] ECCを参照せずに最小ハーネスを設計できる（05_practice/mini-harness）
- [ ] 自分のプロジェクトに合ったハーネスを実装できる
