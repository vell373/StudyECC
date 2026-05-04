---
name: agent-sort
description: Build an evidence-backed ECC install plan for a specific repo by sorting skills, commands, rules, hooks, and extras into DAILY vs LIBRARY buckets using parallel repo-aware review passes. Use when ECC should be trimmed to what a project actually needs instead of loading the full bundle.
origin: ECC
---

# エージェントソート

リポジトリにデフォルトのフルインストールではなく、プロジェクト固有の ECC サーフェスが必要なときにこのスキルを使う。

目標は「便利そうに感じる」ものを推測することではない。実際のコードベースからの証拠に基づいて ECC コンポーネントを分類することである。

## いつ使うか

- プロジェクトが ECC のサブセットのみを必要としており、フルインストールがノイズになりすぎる場合
- リポジトリのスタックは明確だが、スキルを1つずつ手動でキュレートしたくない場合
- チームが意見ではなく grep の証拠に基づいたインストール決定を繰り返し実行したい場合
- 常にロードされるデイリーワークフローサーフェスを検索可能なライブラリ/参照サーフェスから分離する必要がある場合
- リポジトリが間違った言語、ルール、またはフックセットに漂流してクリーンアップが必要な場合

## 絶対ルール

- 汎用的な好みではなく、現在のリポジトリを唯一の真実の源として使用する
- すべての DAILY 決定は具体的なリポジトリの証拠を引用しなければならない
- LIBRARY は「削除」を意味しない; 「デフォルトではロードせずにアクセス可能な状態に保つ」ことを意味する
- 現在のリポジトリが使用できないフック、ルール、またはスクリプトをインストールしない
- ECC ネイティブのサーフェスを優先する; 第2のインストールシステムを導入しない

## アウトプット

以下のアーティファクトを順番に生成する:

1. DAILY インベントリ
2. LIBRARY インベントリ
3. インストールプラン
4. 検証レポート
5. プロジェクトが必要な場合のオプションの `skill-library` ルーター

## 分類モデル

2つのバケットのみを使用する:

- `DAILY`
  - このリポジトリの毎セッションでロードされるべき
  - リポジトリの言語、フレームワーク、ワークフロー、またはオペレーターサーフェスに強く一致する
- `LIBRARY`
  - 保持するのに有用だが、デフォルトではロードする価値がない
  - 検索、ルータースキル、または選択的な手動使用を通じてアクセス可能な状態を保つ

## 証拠ソース

分類を行う前にリポジトリローカルの証拠を使用する:

- ファイル拡張子
- パッケージマネージャーとロックファイル
- フレームワーク設定
- CI とフックの設定
- ビルド/テストスクリプト
- インポートと依存関係マニフェスト
- スタックを明示的に説明するリポジトリドキュメント

有用なコマンドは以下の通り:

```bash
rg --files
rg -n "typescript|react|next|supabase|django|spring|flutter|swift"
cat package.json
cat pyproject.toml
cat Cargo.toml
cat pubspec.yaml
cat go.mod
```

## 並列レビューパス

並列サブエージェントが使用可能な場合、以下のパスにレビューを分割する:

1. エージェント
   - `agents/*` を分類する
2. スキル
   - `skills/*` を分類する
3. コマンド
   - `commands/*` を分類する
4. ルール
   - `rules/*` を分類する
5. フックとスクリプト
   - フックサーフェス、MCP ヘルスチェック、ヘルパースクリプト、OS 互換性を分類する
6. エクストラ
   - コンテキスト、例、MCP 設定、テンプレート、およびガイダンスドキュメントを分類する

サブエージェントが使用できない場合は、同じパスを順番に実行する。

## コアワークフロー

### 1. リポジトリを読む

何かを分類する前に実際のスタックを確認する:

- 使用している言語
- 使用しているフレームワーク
- 主要パッケージマネージャー
- テストスタック
- リント/フォーマットスタック
- デプロイ/ランタイムサーフェス
- すでに存在するオペレーター統合

### 2. 証拠テーブルを構築する

候補となるすべてのサーフェスについて以下を記録する:

- コンポーネントパス
- コンポーネントタイプ
- 提案されたバケット
- リポジトリの証拠
- 短い正当化

以下のフォーマットを使用する:

```text
skills/frontend-patterns | skill | DAILY | 84 .tsx files, next.config.ts present | core frontend stack
skills/django-patterns   | skill | LIBRARY | no .py files, no pyproject.toml       | not active in this repo
rules/typescript/*       | rules | DAILY | package.json + tsconfig.json            | active TS repo
rules/python/*           | rules | LIBRARY | zero Python source files             | keep accessible only
```

### 3. DAILY vs LIBRARY を決定する

以下の場合に `DAILY` に昇格させる:

- リポジトリが一致するスタックを明確に使用している
- コンポーネントがすべてのセッションに役立つほど汎用的である
- リポジトリがすでに対応するランタイムまたはワークフローに依存している

以下の場合に `LIBRARY` に降格させる:

- コンポーネントがスタックと一致しない
- リポジトリが後で必要になるかもしれないが、毎日ではない
- 即時の関連性なしにコンテキストオーバーヘッドを追加する

### 4. インストールプランを構築する

分類をアクションに変換する:

- DAILY スキル -> `.claude/skills/` にインストールまたは保持する
- DAILY コマンド -> まだ有用な場合のみ明示的なシムとして保持する
- DAILY ルール -> 一致する言語セットのみインストールする
- DAILY フック/スクリプト -> 互換性のあるもののみ保持する
- LIBRARY サーフェス -> 検索または `skill-library` を通じてアクセス可能な状態を保つ

リポジトリがすでに選択的インストールを使用している場合、新しいシステムを作成するのではなくそのプランを更新する。

### 5. オプションのライブラリルーターを作成する

プロジェクトが検索可能なライブラリサーフェスを必要とする場合:

- `.claude/skills/skill-library/SKILL.md`

このルーターには以下を含める:

- DAILY vs LIBRARY の短い説明
- グループ化されたトリガーキーワード
- ライブラリリファレンスの場所

ルーター内のすべてのスキル本体を重複させないこと。

### 6. 結果を検証する

プランが適用された後、以下を検証する:

- すべての DAILY ファイルが期待される場所に存在する
- 古い言語ルールがアクティブなままになっていない
- 互換性のないフックがインストールされていない
- 結果のインストールが実際にリポジトリスタックと一致する

以下を含むコンパクトなレポートを返す:

- DAILY カウント
- LIBRARY カウント
- 削除された古いサーフェス
- 未解決の質問

## ハンドオフ

次のステップがインタラクティブなインストールまたは修復の場合:

- `configure-ecc` に引き渡す

次のステップが重複クリーンアップまたはカタログレビューの場合:

- `skill-stocktake` に引き渡す

次のステップがより広範なコンテキストのトリミングの場合:

- `strategic-compact` に引き渡す

## 出力フォーマット

結果をこの順序で返す:

```text
STACK
- language/framework/runtime summary

DAILY
- always-loaded items with evidence

LIBRARY
- searchable/reference items with evidence

INSTALL PLAN
- what should be installed, removed, or routed

VERIFICATION
- checks run and remaining gaps
```
