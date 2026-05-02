# ECC 学習アウトプット INDEX

EverythingClaudeCode (ECC) を読み解き、ハーネスエンジニアリングを習得するための学習記録。

## フォルダ構成

| フォルダ | 役割 | 位置付け |
|---------|------|---------|
| [01_analysis/](01_analysis/) | AI解析によるECC構造の解説 | 教科書・参考書 |
| [02_notes/](02_notes/) | 自分の読書ノート・考察 | 自分の言葉での理解 |
| [03_glossary/](03_glossary/) | 用語集・概念辞典 | 即引きリファレンス |
| [04_patterns/](04_patterns/) | ECCから抽出した設計パターン | 再利用可能な武器庫 |
| [05_practice/](05_practice/) | 写経・再実装の作業場 | 手を動かして定着 |
| [06_questions/](06_questions/) | 疑問リスト（未解決→解決済み） | 理解の穴を可視化 |
| [07_comparisons/](07_comparisons/) | 他ハーネスとの比較分析 | 設計判断を相対化 |
| [08_roadmap/](08_roadmap/) | 学習ロードマップ・進捗管理 | 学習の羅針盤 |

## クイックスタート

```
/analyze ECC/agents/          # agentsフォルダを解析してo1_analysisに保存
/note                         # 今日の気づきをノートに追記
/pattern <パターン名>          # 発見したパターンを04_patternsに記録
/question <疑問>               # 疑問を06_questionsに追加
```

## 学習の流れ

```
ECCを読む
  ↓
/analyze で解析メモを01_analysisに保存
  ↓
自分の解釈を/noteで02_notesに追記
  ↓
再利用できるパターンを/patternで04_patternsに抽出
  ↓
/practiceで写経・再実装して定着
```

## 最終ゴール

ECCを参照せずに、同等レベルのハーネスを自分で設計・実装できるようになること。
