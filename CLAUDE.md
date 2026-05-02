# EverythingClaudeCode 学習プロジェクト

ECC（EverythingClaudeCode）を静的解析し、ハーネスエンジニアリングを習得するための学習プロジェクト。

## プロジェクト構成

```
EverythingClaudeCode/
├── ECC/        ← 解析対象（読み取り専用・変更しない）
├── Output/     ← 学習アウトプット（書き込み先）
│   ├── 00_index/    ← ECC全体の総合インデックス（索引）
│   └── 01_analysis/ ← 特定テーマの深掘り解析メモ
└── CLAUDE.md   ← このファイル
```

## Output フォルダの役割

| フォルダ | 役割 |
|---------|------|
| `Output/00_index/` | **ECC全体の総合インデックス**（48 agents / 182 skills 等の索引） |
| `Output/01_analysis/` | 気になるテーマの深掘り・詳細解析メモ |
| `Output/02_notes/` | 自分の読書ノート・考察 |
| `Output/03_glossary/` | 用語集・概念辞典 |
| `Output/04_patterns/` | 設計パターン抽出集 |
| `Output/05_practice/` | 写経・再実装の作業場 |
| `Output/06_questions/` | 疑問リスト（未解決/解決済み） |
| `Output/07_comparisons/` | 比較分析 |
| `Output/08_roadmap/` | 学習ロードマップ・進捗 |
| `Output/09_logs/` | 学習ログ（日報・週報等） |

## 利用可能なスキル

| スキル | 用途 |
|--------|------|
| `/analyze <ECCのパス>` | 指定パスを解析して01_analysisに保存 |
| `/note <トピック>` | 気づき・考察を02_notesに追記 |
| `/pattern <パターン名>` | 発見したパターンを04_patternsに記録 |
| `/question <疑問>` | 疑問を06_questions/open/に追加 |

## 行動規則

- **ECC フォルダは変更しない**: 解析対象であり、元データを保護する
- **Output への書き込み**: 対応するスキルか、フォルダの README.md の命名規則に従う
- **AI解析と自分のノートを分離**: 01_analysis と 02_notes を混在させない
- **疑問は残す**: 分からないことはそのまま06_questionsに記録し、後で解決する
- **回答は日本語で**: このプロジェクトでは日本語を基本とする

## 学習ゴール

ECC を参照せずに、同等レベルのハーネス（agents / skills / hooks / rules の組み合わせ）を
自分で設計・実装できるようになること。

進捗は `Output/08_roadmap/` で管理する。
