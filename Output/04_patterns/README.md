# 04_patterns — 設計パターン抽出集

ECC から抽出した「再利用可能な設計パターン」を体系化する場所。
自分でハーネスを設計する際に参照する「武器庫」。

## ファイル命名規則

```
{パターン名}.md  （小文字・ハイフン区切り）

例:
  agent-routing-pattern.md
  skill-trigger-pattern.md
  feedback-loop-pattern.md
  hook-pre-post-pattern.md
```

## ファイル構成テンプレート

```markdown
# {パターン名}

**カテゴリ**: routing / trigger / loop / recovery / context など
**発見元**: ECC/{ファイルパス}

## 問題
（このパターンが解決する課題）

## 解決策
（パターンの概要・構造）

## 実装例（ECC）
（ECCでの実際の実装を引用・参照）

## 自分の解釈・応用
（個人開発や仕事でどう使えるか）

## 注意点
（落とし穴・適用すべきでないケース）
```

## パターンカタログ

### Routing
<!-- agent routing patterns -->

### Triggering
<!-- skill/hook trigger patterns -->

### Recovery
<!-- error recovery patterns -->

### Context Management
<!-- context budgeting patterns -->
