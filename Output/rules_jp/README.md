# ルール
## 構成

ルールは**共通**レイヤーと**言語固有**ディレクトリで構成されています：

```
rules/
├── common/          # 言語に依存しない原則（常にインストール）
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # TypeScript/JavaScript固有
├── python/          # Python固有
├── golang/          # Go固有
├── web/             # Webとフロントエンド固有
├── swift/           # Swift固有
└── php/             # PHP固有
```

- **common/**には普遍的な原則が含まれており、言語固有のコード例は含まれていません。
- **言語ディレクトリ**は共通ルールを拡張し、フレームワーク固有のパターン、ツール、コード例を提供します。各ファイルは対応する共通ファイルを参照します。

## インストール

### オプション1：インストールスクリプト（推奨）

```bash
# 共通ルール + 1つ以上の言語固有ルールセットをインストール
./install.sh typescript
./install.sh python
./install.sh golang
./install.sh web
./install.sh swift
./install.sh php

# 複数の言語を同時にインストール
./install.sh typescript python
```

### オプション2：手動インストール

> **重要:** ディレクトリ全体をコピーしてください — `/*`を使ってフラット化しないでください。
> 共通ディレクトリと言語固有ディレクトリには同じ名前のファイルが含まれています。
> 1つのディレクトリにフラット化すると、言語固有ファイルが共通ルールを上書きし、
> 言語固有ファイルで使用される相対パス`../common/`参照が破損します。

```bash
# 共通ルールをインストール（すべてのプロジェクトに必須）
cp -r rules/common ~/.claude/rules/common

# プロジェクトのテックスタックに基づいて言語固有ルールをインストール
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang
cp -r rules/web ~/.claude/rules/web
cp -r rules/swift ~/.claude/rules/swift
cp -r rules/php ~/.claude/rules/php

# 注意！！！実際のプロジェクト要件に従って設定してください。ここの設定は参考用です。
```

## ルール vs スキル

- **ルール**は広く適用される標準、規約、チェックリストを定義します（例：「80%のテストカバレッジ」、「ハードコードされたシークレットなし」）。
- **スキル**（`skills/`ディレクトリ）は特定のタスク向けの深く実践的な参考資料を提供します（例：`python-patterns`、`golang-testing`）。

言語固有のルールファイルは、必要に応じて関連スキルを参照します。ルールは*何を*すべきかを教えます。スキルは*どのように*すべきかを教えます。

## 新しい言語の追加

新しい言語のサポートを追加するには（例：`rust/`）：

1. `rules/rust/`ディレクトリを作成します
2. 共通ルールを拡張するファイルを追加します：
   - `coding-style.md` — フォーマッティングツール、イディオム、エラーハンドリングパターン
   - `testing.md` — テストフレームワーク、カバレッジツール、テスト構成
   - `patterns.md` — 言語固有の設計パターン
   - `hooks.md` — フォーマッター、リンター、型チェッカー向けPostToolUseフック
   - `security.md` — シークレット管理、セキュリティスキャンツール
3. 各ファイルは以下で始まる必要があります：
   ```
   > This file extends [common/xxx.md](../common/xxx.md) with <Language> specific content.
   ```
4. 利用可能な場合は既存スキルを参照するか、`skills/`の下に新しいスキルを作成します。

`web/`のような言語以外のドメインの場合は、再利用可能なドメイン固有のガイダンスが十分にあるスタンドアロンルールセットを正当化する場合、同じレイヤーパターンに従ってください。

## ルール優先度

言語固有ルールと共通ルールが競合する場合、**言語固有ルールが優先されます**（特定が一般を上書き）。これは標準的なレイヤー設定パターンに従います（CSS特異性または`.gitignore`優先度に似ています）。

- `rules/common/`はすべてのプロジェクトに適用される普遍的なデフォルトを定義します。
- `rules/golang/`、`rules/python/`、`rules/swift/`、`rules/php/`、`rules/typescript/`などは、言語イディオムが異なる場合、これらのデフォルトを上書きします。

### 例

`common/coding-style.md`は不変性をデフォルト原則として推奨しています。言語固有の`golang/coding-style.md`はこれを上書きできます：

> Idiomatic Goはstruct変更にポインタレシーバーを使用します — 一般的な原則については[common/coding-style.md](../common/coding-style.md)を参照してください。ただしGo的なイディオムに従った変更がここでは優先されます。

### オーバーライド可能な共通ルール

言語固有ファイルで上書きされる可能性のある`rules/common/`のルールは、以下でマークされます：

> **言語に関する注記**: このルールは、このパターンがイディオムではない言語の言語固有ルールで上書きされる可能性があります。
