---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/*.sln"
  - "**/Directory.Build.props"
  - "**/Directory.Build.targets"
---
# C# フック

> このファイルは [common/hooks.md](../common/hooks.md) を C# 固有のコンテンツで拡張します。

## PostToolUse フック

`~/.claude/settings.json` で設定:

- **dotnet format**: 編集された C# ファイルを自動フォーマットし、アナライザー修正を適用
- **dotnet build**: 編集後もソリューションまたはプロジェクトがコンパイルされることを確認
- **dotnet test --no-build**: 動作変更後に最も近い関連テストプロジェクトを再実行

## Stop フック

- C# の広い変更でセッションを終了する前に最終的な `dotnet build` を実行
- シークレットがコミットされないように、修正された `appsettings*.json` ファイルに警告
