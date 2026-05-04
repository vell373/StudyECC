# 03_glossary — 用語集・概念辞典

ECC や Claude Code エコシステムで登場する用語を「1用語1ファイル」で管理。
「これ何だっけ？」を即座に解決するための辞書。

## ファイル命名規則

```
{用語名}.md  （小文字・ハイフン区切り）

例:
  skill.md
  agent.md
  hook.md
  mcp-server.md
  slash-command.md
```

## ファイル構成テンプレート

```markdown
# {用語名}

**分類**: agent / skill / hook / command / rule / config

## 定義
（1〜2文の簡潔な定義）

## ECC での使われ方
（ECCの中でどう使われているか）

## 他の用語との関係
（関連する用語へのリンク）

## 参照
（ECC の該当ファイルパス）
```

## 用語インデックス

- [e2e](e2e.md) — 統合テスト・エンドツーエンドテスト
- [tool](tool.md) — AIエージェントが実行可能なアクション（File操作・CLI実行・API呼び出し等）
<!-- 用語が増えたらここに追記 -->
