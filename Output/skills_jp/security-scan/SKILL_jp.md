---
name: security-scan
description: AgentShieldを使用してClaude Codeのセキュリティ設定（CLAUDE.md、settings.json、mcp.json、フック、エージェント）をスキャンし、プロンプトインジェクション、権限昇格、その他の脆弱性を検出する。
origin: ECC
---

# Security Scan スキル (AgentShield)

Claude Codeのセキュリティ設定とハーネスファイルのスキャンツール。

## スキャン対象

AgentShieldは以下をスキャンする:

| ファイル | スキャン内容 |
|---------|-------------|
| `CLAUDE.md` | プロンプトインジェクション、危険な命令 |
| `.claude/settings.json` | 過剰な権限、安全でないフック設定 |
| `.mcp.json` | 安全でないMCPサーバー設定 |
| `hooks/` | コマンドインジェクションリスク |
| `agents/` | エージェントのスコープ超過 |

## 使用方法

```bash
# 現在のディレクトリをスキャン
claude security-scan

# 特定のディレクトリをスキャン
claude security-scan --dir /path/to/project

# Opusによる詳細分析
claude security-scan --deep

# JSON出力
claude security-scan --output json
```

## 深刻度レベル

| グレード | レベル | 説明 |
|---------|--------|------|
| A | 安全 | 問題なし |
| B | 低リスク | 軽微な改善の余地あり |
| C | 中リスク | 調査が推奨される問題あり |
| D | 高リスク | 対応が必要な問題あり |
| F | クリティカル | 即時対応が必要 |

## 検出パターン

### プロンプトインジェクション
```
CLAUDE.md内で検出:
- "ignore previous instructions"
- "you are now..."
- "act as..."（ロールを変更する場合）
- 別ファイルの動的インクルード
```

### 権限昇格
```
settings.jsonで検出:
- 過剰に広いbashコマンドの許可
- すべてのツールの許可
- 制限なしのファイルシステムアクセス
```

### コマンドインジェクション
```
フックスクリプトで検出:
- 検証されていないユーザー入力の使用
- シェルメタキャラクターの連結
- tmpファイルへの安全でない書き込み
```

### MCPサーバーリスク
```
mcp.jsonで検出:
- 認証なしのMCPサーバー
- 過剰な権限を要求するサーバー
- 安全でないURLスキーム
```

## GitHub Actionとの統合

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run AgentShield Security Scan
        uses: anthropics/agentshield-action@v1
        with:
          fail-on-grade: D  # Dグレード以上で失敗
```

## Opus深層分析

`--deep` フラグを使うと、claude-opus-4を使って以下を分析する:
- セマンティクスを考慮したプロンプトインジェクションの検出
- フック間の複雑な相互作用
- エージェントのスコープとツール権限の整合性
- 潜在的な情報漏洩パターン

```bash
claude security-scan --deep --model claude-opus-4
```

## スキャン結果の例

```
=== AgentShield セキュリティスキャン ===

スキャン対象: /Users/user/project
実行時刻: 2026-05-04T10:30:00Z

📁 CLAUDE.md
  ✅ プロンプトインジェクション: 検出なし
  ✅ 危険な命令: 検出なし

📁 .claude/settings.json
  ⚠️  [C] 広範なBash権限
     "Bash" が allowList に設定されていますが、より具体的なコマンドの制限を推奨します

📁 hooks/pre-commit.sh
  ❌ [D] コマンドインジェクションリスク
     行23: ユーザー入力 $FILENAME が検証なしで使われています

📁 agents/
  ✅ エージェントスコープ: すべて適切

=== サマリー ===
グレード: D
クリティカル: 0
高リスク: 1
中リスク: 1
低リスク: 0

推奨アクション:
1. hooks/pre-commit.sh の行23でユーザー入力をサニタイズする
2. settings.json のBash許可リストをより具体的なコマンドに制限する
```
