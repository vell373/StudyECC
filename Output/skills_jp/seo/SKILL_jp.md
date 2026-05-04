---
name: seo
description: テクニカルSEO、Core Web Vitals、構造化データ、オンページSEO、キーワードマッピング。ウェブサイトのSEOを改善したいときに使う。
origin: ECC
---

# SEO スキル

## テクニカルSEOチェックリスト

### クロール可能性
- [ ] robots.txtが正しく設定されている
- [ ] XMLサイトマップが存在して送信されている
- [ ] クロールエラーがSearch Consoleにない
- [ ] 内部リンク構造が適切

### インデックス可能性
- [ ] canonicalタグが正しく設定されている
- [ ] noindexタグが誤って重要ページに設定されていない
- [ ] hreflangタグが多言語サイトで正しく設定されている
- [ ] ページネーションが正しく実装されている

### Core Web Vitals

| 指標 | 良好 | 改善が必要 | 不良 |
|-----|------|-----------|------|
| LCP（最大コンテンツ描画） | < 2.5秒 | 2.5-4.0秒 | > 4.0秒 |
| INP（次の描画への応答時間） | < 200ms | 200-500ms | > 500ms |
| CLS（累積レイアウトシフト） | < 0.1 | 0.1-0.25 | > 0.25 |

```html
<!-- LCPの最適化 -->
<!-- ヒーロー画像のプリロード -->
<link rel="preload" as="image" href="/hero.webp">

<!-- CLS防止 -->
<!-- 画像の幅と高さを必ず指定 -->
<img src="image.jpg" width="800" height="600" alt="説明">

<!-- LCP改善のためのfontのプリロード -->
<link rel="preload" as="font" href="/font.woff2" crossorigin>
```

### 構造化データ

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "記事タイトル",
  "author": {
    "@type": "Person",
    "name": "著者名"
  },
  "datePublished": "2026-05-04",
  "dateModified": "2026-05-04",
  "image": "https://example.com/image.jpg",
  "description": "記事の説明"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "質問1",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "回答1"
      }
    }
  ]
}
```

## オンページSEOルール

### タイトルタグ
- 文字数: 50-60文字
- ターゲットキーワードを含める
- 各ページで一意である
- ブランド名を末尾に配置する

```html
<title>主要キーワード - 副次キーワード | ブランド名</title>
```

### メタディスクリプション
- 文字数: 120-160文字
- アクションを促す言葉を含める
- 対象キーワードを含める
- 各ページで一意である

```html
<meta name="description" content="ページの内容の簡潔な説明。クリックを促す言葉を含め、主要なキーワードを使用する（120-160文字）">
```

### 見出し構造
```html
<h1>メインタイトル（1ページに1つのみ）</h1>
  <h2>主要セクション</h2>
    <h3>サブセクション</h3>
      <h4>詳細項目</h4>
```

### 画像の最適化
```html
<!-- altテキスト必須 -->
<img src="product.webp" alt="商品の詳細説明（キーワードを含む）" loading="lazy">

<!-- ヒーロー画像は遅延読み込みしない -->
<img src="hero.webp" alt="説明" loading="eager" fetchpriority="high">
```

## キーワードマッピング

各ページは1-2つのプライマリキーワードをターゲットにする:

| ページ | プライマリKW | セカンダリKW | 検索意図 |
|-------|------------|------------|---------|
| ホーム | ブランド名 | 主要製品カテゴリ | ナビゲーション |
| 製品ページ | [製品名] | [製品名 + 用途] | 商取引 |
| ブログ記事 | [ターゲットKW] | 関連KW | 情報収集 |

### キーワードリサーチツール
- Google Search Console（実際の検索クエリ）
- Google Keyword Planner
- Ahrefs / SEMrush
- Answer The Public

## 内部リンク戦略

- 重要なページにより多くの内部リンクを設ける
- アンカーテキストにキーワードを含める（自然な形で）
- パンくずリストを実装する
- 関連コンテンツへのリンクを設ける

```html
<!-- 良いアンカーテキスト -->
<a href="/react-hooks">Reactフックの使い方</a>

<!-- 悪いアンカーテキスト -->
<a href="/react-hooks">こちらをクリック</a>
```

## ページスピードの最適化

```bash
# PageSpeed Insightsで確認
https://pagespeed.web.dev/

# コアWebバイタルの測定
npx lighthouse https://example.com --only-categories=performance

# バンドルサイズの分析
npx webpack-bundle-analyzer
```

```javascript
// Next.jsでの最適化例
// 画像の最適化
import Image from 'next/image';
<Image src="/hero.jpg" width={1200} height={600} priority alt="ヒーロー画像">

// フォントの最適化
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

## 技術的な実装チェックリスト

- [ ] HTTPS対応（全ページ）
- [ ] モバイルフレンドリー（レスポンシブデザイン）
- [ ] ページ速度の最適化（Core Web Vitals目標値達成）
- [ ] 構造化データの実装
- [ ] XMLサイトマップの送信
- [ ] robots.txtの設定
- [ ] 404ページの適切な設定
- [ ] リダイレクトの最小化
- [ ] 重複コンテンツの排除（canonicalタグ）
- [ ] Open Graphタグの設定（SNS共有用）
