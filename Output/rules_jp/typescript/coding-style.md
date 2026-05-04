---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を TypeScript/JavaScript 固有のコンテンツで拡張します。

## 型とインターフェース

型を使用して、パブリック API、共有モデル、およびコンポーネント props を明確、読みやすく、再利用可能にします。

### パブリック API

- エクスポートされた関数、共有ユーティリティ、およびパブリッククラスメソッドにパラメータとリターン型を追加
- 明白なローカル変数型は TypeScript に推論させる
- 繰り返されるインラインオブジェクト形状を名前付き型またはインターフェースに抽出

```typescript
// 誤り: 明示的な型のないエクスポートされた関数
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}

// 正解: パブリック API の明示的な型
interface User {
  firstName: string
  lastName: string
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### インターフェース vs. 型エイリアス

- 拡張または実装される可能性があるオブジェクト形状に `interface` を使用
- union、intersection、tuple、mapped type、および utility type に `type` を使用
- `enum` が相互運用性に必要な場合を除き、`enum` より文字列リテラル union を優先

```typescript
interface User {
  id: string
  email: string
}

type UserRole = 'admin' | 'member'
type UserWithRole = User & {
  role: UserRole
}
```

### `any` を避ける

- アプリケーションコードで `any` を避ける
- 外部または信頼できない入力に `unknown` を使用し、安全に絞り込む
- 値の型が呼び出し元に依存する場合、ジェネリクスを使用

```typescript
// 誤り: any は型安全性を削除
function getErrorMessage(error: any) {
  return error.message
}

// 正解: unknown は安全な絞り込みを強制
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
```

### React Props

- 名前付き `interface` または `type` でコンポーネント props を定義
- コールバック props を明示的に型付け
- 特定の理由がない限り `React.FC` を使用しない

```typescript
interface User {
  id: string
  email: string
}

interface UserCardProps {
  user: User
  onSelect: (id: string) => void
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>
}
```

### JavaScript ファイル

- `.js` および `.jsx` ファイルでは、型が明確性を改善し TypeScript マイグレーションが実用的でない場合、JSDoc を使用
- JSDoc を実行時動作と整合させておく

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}
```

## イミュータビリティ

イミュータブル更新にスプレッド演算子を使用:

```typescript
interface User {
  id: string
  name: string
}

// 誤り: Mutation
function updateUser(user: User, name: string): User {
  user.name = name // MUTATION!
  return user
}

// 正解: Immutability
function updateUser(user: Readonly<User>, name: string): User {
  return {
    ...user,
    name
  }
}
```

## エラーハンドリング

async/await と try-catch を使用して unknown エラーを安全に絞り込む:

```typescript
interface User {
  id: string
  email: string
}

declare function riskyOperation(userId: string): Promise<User>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

const logger = {
  error: (message: string, error: unknown) => {
    // 本番ロガーに置き換える（例えば pino または winston）。
  }
}

async function loadUser(userId: string): Promise<User> {
  try {
    const result = await riskyOperation(userId)
    return result
  } catch (error: unknown) {
    logger.error('Operation failed', error)
    throw new Error(getErrorMessage(error))
  }
}
```

## 入力検証

スキーマベース検証に Zod を使用し、スキーマから型を推論:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

type UserInput = z.infer<typeof userSchema>

const validated: UserInput = userSchema.parse(input)
```

## Console.log

- 本番コードで `console.log` ステートメントなし
- 代わりに適切なロギングライブラリを使用
- 自動検出については hooks を参照
