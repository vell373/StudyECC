---
name: security-review
description: コードのセキュリティレビューチェックリスト。新しいコードをレビューするとき、またはセキュリティ監査を実施するときに使う。
origin: ECC
---

# セキュリティレビュー チェックリスト

## 1. シークレット管理

- [ ] APIキー、パスワード、トークンがコードに直書きされていない
- [ ] 環境変数または秘密管理サービス（Vault、AWS Secrets Manager等）を使用している
- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] シークレットがログや例外メッセージに含まれていない
- [ ] シークレットのローテーションが可能な設計になっている

```typescript
// ❌ 悪い例
const API_KEY = "sk-1234567890abcdef";

// ✅ 良い例
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable is required");
```

## 2. 入力バリデーション

- [ ] すべてのユーザー入力がバリデーションされている
- [ ] 型チェック、サイズ制限、許可値リストを確認している
- [ ] ファイルアップロードのMIMEタイプと拡張子を検証している
- [ ] JSONスキーマを使って構造を検証している

```typescript
import { z } from 'zod';

const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'moderator']),
});

function processUserInput(data: unknown) {
  const validated = UserInputSchema.parse(data); // バリデーション失敗時はZodErrorをスロー
  return validated;
}
```

## 3. SQLインジェクション防止

- [ ] パラメータバインディングを使用している（文字列連結を使用していない）
- [ ] ORMが正しく設定されている
- [ ] 動的クエリが必要な場合はエスケープ処理を行っている

```typescript
// ❌ 悪い例 - SQLインジェクション可能
const query = `SELECT * FROM users WHERE username = '${username}'`;

// ✅ 良い例 - パラメータバインディング
const query = 'SELECT * FROM users WHERE username = $1';
const result = await db.query(query, [username]);

// ✅ ORMを使用
const user = await User.findOne({ where: { username } });
```

## 4. 認証・認可

- [ ] 認証が必要なすべてのエンドポイントが保護されている
- [ ] 認証（誰か？）と認可（何ができるか？）が分離されている
- [ ] JWTの署名検証が正しく行われている（alg:none攻撃対策）
- [ ] セッション管理が安全（セッション固定攻撃対策）

```typescript
// ✅ 認可ミドルウェアの例
async function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const hasPermission = await checkPermission(user.id, permission);
    if (!hasPermission) return res.status(403).json({ error: 'Forbidden' });
    
    next();
  };
}
```

## 5. XSS（クロスサイトスクリプティング）

- [ ] ユーザー入力をHTMLとして出力する場合はエスケープしている
- [ ] `innerHTML` の使用を避けている（代わりに `textContent` を使用）
- [ ] Content Security Policy (CSP) ヘッダーを設定している
- [ ] dangerouslySetInnerHTML（React）の使用を最小限にしている

```typescript
// ❌ 悪い例
element.innerHTML = userInput;

// ✅ 良い例
element.textContent = userInput;

// ✅ 必要な場合はサニタイズ
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

## 6. CSRF（クロスサイトリクエストフォージェリ）

- [ ] 状態変更を行うすべてのリクエストでCSRFトークンを検証している
- [ ] SameSite Cookieを設定している
- [ ] Originヘッダーを検証している

```typescript
// ✅ CSRFトークンの検証
app.use(csrf({ cookie: true }));

// ✅ Cookie設定
app.use(session({
  cookie: {
    sameSite: 'strict',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}));
```

## 7. レート制限

- [ ] 認証エンドポイントにレート制限を設定している
- [ ] API全体にレート制限を設定している
- [ ] Brute-force攻撃に対する保護がある

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 5回まで
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/auth/login', loginLimiter, handleLogin);
```

## 8. 機密データの保護

- [ ] パスワードをbcryptやArgon2でハッシュ化している
- [ ] 機密データをHTTPS経由でのみ送信している
- [ ] クレジットカード番号等の機密データをマスキングしている
- [ ] データ保持ポリシーを実施している

```typescript
import bcrypt from 'bcrypt';

// ✅ パスワードのハッシュ化
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// ✅ 検証
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

## 9. ブロックチェーン（Solana）

- [ ] プログラムIDを検証している
- [ ] アカウントの所有者を検証している
- [ ] 算術オーバーフローをチェックしている（`checked_add`等）
- [ ] 再入攻撃に対する保護がある
- [ ] シグナー権限を検証している

```rust
// ✅ アカウントの所有者検証
if ctx.accounts.token_account.owner != ctx.accounts.user.key() {
    return Err(ErrorCode::Unauthorized.into());
}

// ✅ オーバーフローチェック
let new_amount = ctx.accounts.vault.amount
    .checked_add(deposit_amount)
    .ok_or(ErrorCode::Overflow)?;
```

## 10. 依存関係のセキュリティ

- [ ] `npm audit` / `pip-audit` / `cargo audit` を定期的に実行している
- [ ] 依存関係を定期的に更新している
- [ ] 不要な依存関係を削除している
- [ ] 依存関係のバージョンを固定している

```bash
# 脆弱性のチェック
npm audit
npm audit fix

# 依存関係の更新
npm outdated
npx npm-check-updates -u
```
