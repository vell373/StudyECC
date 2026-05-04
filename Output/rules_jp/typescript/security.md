---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript セキュリティ

> このファイルは [common/security.md](../common/security.md) を TypeScript/JavaScript 固有のコンテンツで拡張します。

## シークレット管理

```typescript
// 決して: ハードコード化されたシークレット
const apiKey = "sk-proj-xxxxx"

// 常に: 環境変数
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## エージェントサポート

- 包括的なセキュリティ監査に **security-reviewer** スキルを使用
