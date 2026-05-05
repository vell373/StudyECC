# Plan-Approve-Execute 移植アーキテクチャ 設計書

## 設計原則

**AI の判断と機械的な実行を明確に分離する。**

```
┌─────────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│   Plan（非決定論的） │ →  │ Approve（人間）   │ →  │ Execute（決定論的）   │
│   Assigner (AI)      │    │ ユーザーレビュー   │    │ transplant.sh        │
│                      │    │                    │    │                      │
│ 入力:                │    │ 入力:              │    │ 入力:                │
│  PRODUCT-BRIEF.md    │    │  TRANSPLANT-PLAN   │    │  TRANSPLANT-PLAN     │
│  CoreAgents/の中身   │    │  .json             │    │  .json（承認済み）    │
│                      │    │                    │    │                      │
│ 出力:                │    │ 出力:              │    │ 出力:                │
│  TRANSPLANT-PLAN     │    │  修正/承認         │    │  ファイルコピー       │
│  .json               │    │                    │    │  INSTALL-STATE.md    │
│                      │    │                    │    │  検証レポート         │
└─────────────────────┘    └──────────────────┘    └──────────────────────┘
     ↑ AIがブレうる               ↑ 人間が止められる            ↑ 常に同じ結果
```

### 責務の分離

| フェーズ | 実行者 | 性質 | やること | やらないこと |
|---------|--------|------|---------|------------|
| **Plan** | Assigner (AI) | 非決定論的 | 要件分析、リソース選定、理由の説明 | **ファイル操作（cp/mkdir）は一切しない** |
| **Approve** | ユーザー | 人間判断 | JSON レビュー、編集、承認 | — |
| **Execute** | `transplant.sh` | 決定論的 | JSON の通りに cp を実行、検証 | **選定判断は一切しない** |

---

## 1. TRANSPLANT-PLAN.json のスキーマ

Assigner が出力し、`transplant.sh` が消費する「契約書」です。

```json
{
  "version": 1,
  "createdAt": "2026-05-05T11:00:00+09:00",
  "createdBy": "assigner",
  "status": "pending_approval",
  "source": {
    "path": "/Users/yasuvel/CoreAgents",
    "description": "CoreAgents 母体プロジェクト"
  },
  "target": {
    "path": "/Users/yasuvel/ProjectX",
    "claudeDir": ".claude"
  },
  "productBrief": "Chrome拡張機能。TypeScript使用。認証機能あり。MVP段階。",
  "operations": [
    {
      "type": "agent",
      "source": "agents/planner.md",
      "destination": ".claude/agents/planner.md",
      "reason": "コア必須: 実装計画の策定"
    },
    {
      "type": "agent",
      "source": "agents/architect.md",
      "destination": ".claude/agents/architect.md",
      "reason": "コア必須: システム設計"
    },
    {
      "type": "agent",
      "source": "agents/code-reviewer.md",
      "destination": ".claude/agents/code-reviewer.md",
      "reason": "コア必須: コードレビュー"
    },
    {
      "type": "agent",
      "source": "agents/tdd-guide.md",
      "destination": ".claude/agents/tdd-guide.md",
      "reason": "コア必須: テスト駆動開発"
    },
    {
      "type": "agent",
      "source": "agents/typescript-reviewer.md",
      "destination": ".claude/agents/typescript-reviewer.md",
      "reason": "TypeScript使用のため"
    },
    {
      "type": "rule",
      "source": "rules/common/",
      "destination": ".claude/rules/common/",
      "reason": "共通ルール一括適用",
      "recursive": true
    },
    {
      "type": "rule",
      "source": "rules/typescript/",
      "destination": ".claude/rules/typescript/",
      "reason": "TypeScript使用のため",
      "recursive": true
    },
    {
      "type": "skill",
      "source": "skills/tdd-workflow/",
      "destination": ".claude/skills/tdd-workflow/",
      "reason": "tdd-guide エージェントと連携",
      "recursive": true
    },
    {
      "type": "command",
      "source": "commands/plan.md",
      "destination": ".claude/commands/plan.md",
      "reason": "計画フェーズの起動"
    },
    {
      "type": "command",
      "source": "commands/code-review.md",
      "destination": ".claude/commands/code-review.md",
      "reason": "レビューの標準起動"
    }
  ],
  "excluded": [
    {
      "source": "agents/security-reviewer.md",
      "reason": "MVP段階ではセキュリティ専門レビューは過剰"
    },
    {
      "source": "skills/product-lens/",
      "reason": "PRODUCT-BRIEF.md は作成済みのため不要"
    }
  ],
  "summary": {
    "agents": 5,
    "rules": 2,
    "skills": 1,
    "commands": 2,
    "total": 10
  }
}
```

---

## 2. 各フェーズの詳細設計

### Phase 1: Plan（Assigner の改修）

**現在の Assigner との差分**: `Bash` ツールで `cp` を実行する代わりに、`Write` ツールで `TRANSPLANT-PLAN.json` を出力して**停止する**。

### Phase 2: Approve（ユーザーレビュー）

ユーザーは `TRANSPLANT-PLAN.json` を確認し、以下のいずれかを行います：

1. **そのまま承認**: `status` を `"approved"` に変更
2. **修正して承認**: `operations` や `excluded` を手動で編集してから承認
3. **却下**: Assigner に修正指示を出す

### Phase 3: Execute（`transplant.sh`）

**JSON を読み、書かれた通りにコピーする。判断はしない。**

- 実行後、自動的に検証（verify）を実行します
- INSTALL-STATE.md が自動生成されます

---

## 3. `/transplant` コマンド

Claude Code のコマンドとしてもラップします。

- `/transplant plan`
- `/transplant review`
- `/transplant approve`
- `/transplant apply`
- `/transplant verify`
- `/transplant diff`

---

## 4. 品質担保チェーン

 [AI 生成] → [人間レビュー] → [ステータスチェック] → [ソース存在確認] → [cp 実行] → [事後検証]
