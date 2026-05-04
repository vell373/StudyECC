> このファイルは [common/security.md](../common/security.md) を Web 固有のセキュリティコンテンツで拡張します。

# Web セキュリティルール

## コンテンツセキュリティポリシー

常に本番 CSP を設定。

### Nonce ベース CSP

`'unsafe-inline'` の代わりにリクエストごとの nonce をスクリプトに使用。

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

origin をプロジェクトに調整。このブロックを変更なしで cargo-cult しない。

## XSS 防止

- サニタイズされていない HTML を決してインジェクト しない
- サニタイズ済みでない限り `innerHTML` / `dangerouslySetInnerHTML` を避ける
- 動的テンプレート値をエスケープ
- 絶対に必要な場合のみ vetted ローカル sanitizer でユーザー HTML をサニタイズ

## サードパーティスクリプト

- 非同期で読み込む
- CDN から提供する場合 SRI を使用
- 四半期ごとに監査
- 実用的な場合、critical 依存関係のセルフホスティングを優先

## HTTPS とヘッダー

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## フォーム

- 状態変更フォームでの CSRF 保護
- サブミッション endpoint でのレート制限
- クライアント側とサーバー側を検証
- 重い CAPTCHA デフォルト上に軽い honeypot またはライト anti-abuse コントロール を優先
