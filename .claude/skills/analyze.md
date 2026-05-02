---
name: analyze
description: ECC の指定パスを解析して Output/01_analysis/ に体系的な解析メモを保存する
---

# /analyze — ECC 解析スキル

ECC の指定されたフォルダまたはファイルを解析し、`Output/01_analysis/` に教科書スタイルの解析メモを保存する。

## 使い方

```
/analyze <ECCのパス>

例:
  /analyze ECC/agents/
  /analyze ECC/skills/fb.md
  /analyze ECC/hooks/
```

## 解析の手順

1. **対象を読む**: 指定されたパスのファイルを Read / Glob / Grep で読み込む
2. **構造を把握**: ファイル一覧・frontmatter・主要なセクションを確認する
3. **解析メモを作成**: 以下のテンプレートに従ってファイルを作成する
4. **01_analysis に保存**: `Output/01_analysis/{ファイル名}.md` として書き込む

## 出力テンプレート

```markdown
# {対象} 解析

**解析日**: YYYY-MM-DD
**対象パス**: ECC/{path}
**関連トピック**: #タグ

## 概要
（1〜3文で何者かを説明）

## 構造・仕組み
（どう動くか、何が含まれるか）

## 設計上の特徴
（なぜこの設計なのか、気づいた工夫）

## 関連ファイル
（他のどのファイルと連携しているか）

## 参照元
（解析した ECC の実際のファイルパス一覧）
```

## ファイル命名規則

- フォルダ解析: `{フォルダ名}_overview.md`（例: `agents_overview.md`）
- ファイル解析: `{フォルダ名}_{ファイル名}.md`（例: `skills_fb.md`）

## 注意事項

- 解析内容は客観的な事実のみ。自分の考察は 02_notes に書く
- ECC のコードをそのままコピーせず、**要約・抽出**する
- 解析後は `Output/01_analysis/README.md` のインデックスに追記する
