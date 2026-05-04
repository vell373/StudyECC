> このファイルは [common/coding-style.md](../common/coding-style.md) を Web 固有のフロントエンドコンテンツで拡張します。

# Web コーディングスタイル

## ファイル組織

ファイルタイプではなく、機能または表面領域で整理:

```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   ├── StickyVisual.tsx
│   │   └── scrolly.css
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## CSS カスタムプロパティ

デザイントークンを変数として定義。パレット、タイポグラフィ、またはスペーシングをハードコード化しないで繰り返す:

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## アニメーションのみのプロパティ

コンポジター親和的なモーションを優先:
- `transform`
- `opacity`
- `clip-path`
- `filter`（控えめに）

レイアウトバウンドプロパティのアニメーションを避ける:
- `width`
- `height`
- `top`
- `left`
- `margin`
- `padding`
- `border`
- `font-size`

## セマンティック HTML を最初に

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

セマンティック要素が存在する場合、汎用ラッパー `div` スタックに手を出さない。

## 命名

- コンポーネント: PascalCase（`ScrollySection`, `SurfaceCard`）
- フック: `use` プレフィックス（`useReducedMotion`）
- CSS クラス: kebab-case またはユーティリティクラス
- アニメーションタイムライン: intent を含む camelCase（`heroRevealTl`）
