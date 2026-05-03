# 01_analysis — ECC 解析メモ

AI によって ECC のフォルダ・ファイルを解析した内容を体系的にまとめる場所。
後から見てすぐに概要を把握できる「教科書」として機能する。

## ファイル命名規則

```
{ECCの対象パス}.md

例:
  agents_overview.md        → ECC/agents/ フォルダ全体の概要
  skills_fb.md              → ECC/skills/fb.md の解析
  hooks_overview.md         → ECC/hooks/ フォルダの解析
```

## ファイル構成テンプレート

```markdown
# {対象} 解析

**解析日**: YYYY-MM-DD
**対象パス**: ECC/{path}
**関連トピック**: #agent #skill #hook など

## 概要
（1〜3文で何者かを説明）

## 構造・仕組み
（どう動くか、何が含まれるか）

## 設計上の特徴
（なぜこの設計なのか、気づいた工夫）

## 関連ファイル
（他のどのファイルと連携しているか）

## 参照元
（解析した ECC の実際のファイルパス）
```

## インデックス

<!-- 解析ファイルが増えたらここに追記 -->
- [agents/architect.md 解析](./agents_architect.md)
- [agents/chief-of-staff.md 解析](./agents_chief-of-staff.md)
- [agents/code-reviewer.md 解析](./agents_code-reviewer.md)
- [agents/planner.md 解析](./agents_planner.md)
- [agents/security-reviewer.md 解析](./agents_security-reviewer.md)
- [agents/tdd-guide.md 解析](./agents_tdd-guide.md)
- [ECC/SOUL.md 解析](./ECC_SOUL.md)
- [ECC/CLAUDE.md 解析](./ECC_CLAUDE.md)
- [ECC/RULES.md 解析](./ECC_RULES.md)
- [ECC/AGENTS.md 解析](./ECC_AGENTS.md)
