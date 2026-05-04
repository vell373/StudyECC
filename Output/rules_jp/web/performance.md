> このファイルは [common/performance.md](../common/performance.md) を Web 固有のパフォーマンスコンテンツで拡張します。

# Web パフォーマンスルール

## Core Web Vitals ターゲット

| メトリック | ターゲット |
|-----------|-----------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

## バンドル予算

| ページタイプ | JS 予算（gzipped） | CSS 予算 |
|----------|----------------|---------|
| ランディングページ | < 150kb | < 30kb |
| アプリページ | < 300kb | < 50kb |
| マイクロサイト | < 80kb | < 15kb |

## 読み込み戦略

1. 正当化される場所で critical above-the-fold CSS をインライン化
2. ヒーロー画像と主要フォントのみを preload
3. 非クリティカル CSS または JS を defer
4. 重いライブラリを動的にインポート

```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```

## 画像最適化

- 明示的な `width` と `height`
- ヒーロー媒体のみに `loading="eager"` プラス `fetchpriority="high"`
- below-the-fold アセットに `loading="lazy"`
- フォールバック付き AVIF または WebP を優先
- レンダリングサイズをはるかに超えて ソース画像を出荷しない

## フォント読み込み

- max 2 フォントファミリー、明確な例外がない限り
- `font-display: swap`
- 可能なところで subset
- truly critical weight/style のみを preload

## アニメーションパフォーマンス

- コンポジター親和的なプロパティのみをアニメート
- 狭く `will-change` を使用し、完了時に削除
- 単純な遷移に CSS を優先
- JS モーションに `requestAnimationFrame` または確立されたアニメーションライブラリを使用
- スクロールハンドラ churn を避ける; IntersectionObserver または well-behaved ライブラリを使用

## パフォーマンスチェックリスト

- [ ] すべての画像に明示的な次元があるか
- [ ] 偶発的なレンダー ブロック リソースなし
- [ ] 動的コンテンツからのレイアウトシフトなし
- [ ] モーションはコンポジター親和的なプロパティに留まるか
- [ ] サードパーティスクリプトが必要な場合のみ async/defer でロード
