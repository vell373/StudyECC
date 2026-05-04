---
name: accessibility
description: Enforce WCAG 2.2 AA compliance for web, iOS, and Android. Covers semantic HTML, ARIA, keyboard navigation, color contrast, mobile accessibility, and assistive technology testing.
origin: ECC
---

# アクセシビリティ

WCAG 2.2 AA 準拠を、ウェブ・iOS・Android 全体で実施するためのパターン集。

## いつ使うか

- 新機能をビルドする際、最初からアクセシビリティを組み込みたい場合
- UI コンポーネントのアクセシビリティをレビューしたい場合
- 既存コードのアクセシビリティ問題を修正したい場合
- スクリーンリーダー、キーボードナビゲーション、カラーコントラストの確認をしたい場合
- iOS / Android モバイルアクセシビリティを担保したい場合

## コアとなる WCAG 2.2 AA 原則

### 知覚可能（Perceivable）
- 画像には必ず `alt` テキストを付ける（装飾画像なら空にする）
- クローズドキャプションを付ける（動画の場合）
- カラーコントラスト比: 通常テキストは 4.5:1 以上、大きめのテキストは 3:1 以上
- 色だけで情報を伝えない（アイコン・テキスト・パターンも活用する）
- フォームの入力欄には必ずラベルを付ける

### 操作可能（Operable）
- インタラクティブな要素はすべてキーボードで操作できるようにする
- `Tab` / `Shift+Tab` / `Enter` / `Space` / 矢印キーをサポートする
- フォーカスインジケーターが視覚的に確認できるようにする
- スキップナビゲーションリンクを設ける
- アニメーションには `prefers-reduced-motion` を尊重する

### 理解可能（Understandable）
- エラーメッセージは具体的に、かつ修正方法を示す
- フォームラベルには目に見えるラベルを使い、プレースホルダーのみに頼らない
- 言語を `<html lang>` で宣言する

### 堅牢（Robust）
- 支援技術でテストする（VoiceOver、NVDA、TalkBack）
- ブラウザの dev tools でアクセシビリティツリーを検証する
- キーボードのみで操作フローを一通り確認する

## Web パターン

### セマンティック HTML

```html
<!-- 正しい例 -->
<nav aria-label="メインナビゲーション">
  <ul>
    <li><a href="/home">ホーム</a></li>
    <li><a href="/about" aria-current="page">会社概要</a></li>
  </ul>
</nav>

<main>
  <h1>ページタイトル</h1>
  <article>
    <h2>セクションタイトル</h2>
    <p>コンテンツ...</p>
  </article>
</main>

<!-- 悪い例 -->
<div class="nav">
  <div onclick="goto('home')">ホーム</div>
</div>
```

### フォームのアクセシビリティ

```html
<!-- 正しい例: ラベルをインプットに関連付ける -->
<div class="form-group">
  <label for="email">
    メールアドレス
    <span aria-hidden="true">*</span>
    <span class="sr-only">（必須）</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    required
    aria-describedby="email-error email-hint"
    autocomplete="email"
  />
  <div id="email-hint" class="hint">メールアドレスを入力してください</div>
  <div id="email-error" role="alert" class="error" aria-live="polite"></div>
</div>

<!-- 悪い例: プレースホルダーをラベルの代わりに使う -->
<input type="email" placeholder="メールアドレスを入力" />
```

### ARIA ウィジェット

```html
<!-- モーダルダイアログ -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">確認</h2>
  <p id="modal-desc">本当にこのアイテムを削除しますか？</p>
  <button type="button" autofocus>キャンセル</button>
  <button type="button">削除</button>
</div>

<!-- タブコンポーネント -->
<div role="tablist" aria-label="製品情報">
  <button role="tab" aria-selected="true" aria-controls="panel-overview" id="tab-overview">
    概要
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-specs" id="tab-specs" tabindex="-1">
    仕様
  </button>
</div>
<div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
  <!-- 概要コンテンツ -->
</div>
<div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" hidden>
  <!-- 仕様コンテンツ -->
</div>
```

### フォーカス管理

```javascript
// モーダルを開く際にフォーカスをトラップする
function openModal(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // モーダルの最初の要素にフォーカスを移す
  firstElement.focus();

  // フォーカスをモーダル内に閉じ込める
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === 'Escape') {
      closeModal(modal);
    }
  });
}
```

### カラーコントラスト

```css
/* WCAG 2.2 AA に準拠した組み合わせ */
:root {
  /* 通常テキスト: コントラスト比 4.5:1 以上 */
  --text-primary: #1a1a1a;      /* 白背景で 16.75:1 */
  --text-secondary: #595959;    /* 白背景で 7.0:1 */
  --text-disabled: #767676;     /* 白背景でちょうど 4.5:1 */

  /* インタラクティブ要素: 3:1 以上 */
  --border-focus: #0052cc;      /* 白背景で 7.04:1 */
  --button-primary: #0052cc;    /* 白テキストで 7.04:1 */

  /* エラー状態 */
  --error-text: #cc0000;        /* 白背景で 5.93:1 */
  --error-border: #cc0000;
}
```

## iOS（Swift/SwiftUI）パターン

### VoiceOver サポート

```swift
// SwiftUI でのアクセシビリティ
struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading) {
            AsyncImage(url: product.imageURL)
                .accessibilityLabel(product.name)
                .accessibilityHint("画像をダブルタップすると詳細が表示されます")

            Text(product.name)
                .font(.headline)

            Text(product.price, format: .currency(code: "JPY"))
                .foregroundColor(.secondary)
        }
        // カードをグループ化して一つのアクセシビリティ要素にする
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(product.name)、\(product.price.formatted(.currency(code: "JPY")))")
        .accessibilityHint("アクティベートすると詳細が表示されます")
    }
}

// カスタムアクション
struct SwipeableCard: View {
    var body: some View {
        CardView()
            .accessibilityAction(named: "アーカイブ") {
                archiveCard()
            }
            .accessibilityAction(named: "削除") {
                deleteCard()
            }
    }
}
```

### フォントの動的サイズ調整

```swift
// ダイナミックタイプをサポートする
struct ContentView: View {
    @Environment(\.dynamicTypeSize) var typeSize

    var body: some View {
        // スタックを動的に切り替える
        Group {
            if typeSize.isAccessibilitySize {
                VStack(alignment: .leading) {
                    labelContent
                    valueContent
                }
            } else {
                HStack {
                    labelContent
                    Spacer()
                    valueContent
                }
            }
        }
    }
}
```

### UIKit のアクセシビリティ

```swift
// カスタムコントロールのアクセシビリティを設定する
class CustomSlider: UIControl {
    override var accessibilityTraits: UIAccessibilityTraits {
        return [.adjustable]
    }

    override var accessibilityValue: String? {
        get { return "\(Int(value * 100))%" }
        set { }
    }

    override func accessibilityIncrement() {
        value = min(value + 0.1, 1.0)
        sendActions(for: .valueChanged)
    }

    override func accessibilityDecrement() {
        value = max(value - 0.1, 0.0)
        sendActions(for: .valueChanged)
    }
}
```

## Android（Kotlin）パターン

### TalkBack サポート

```kotlin
// Jetpack Compose でのアクセシビリティ
@Composable
fun ProductCard(product: Product) {
    Card(
        modifier = Modifier
            .semantics {
                // カード全体を一つのアクセシビリティノードにまとめる
                contentDescription = "${product.name}、${product.price}円"
                onClick(label = "商品詳細を開く") {
                    true
                }
            }
    ) {
        Row {
            AsyncImage(
                model = product.imageURL,
                contentDescription = product.name
            )
            Column {
                Text(
                    text = product.name,
                    modifier = Modifier.semantics {
                        heading()
                    }
                )
                Text(
                    text = "${product.price}円",
                    modifier = Modifier.semantics {
                        contentDescription = "${product.price}円"
                    }
                )
            }
        }
    }
}
```

### フォントの動的サイズ調整

```kotlin
@Composable
fun ScalableText() {
    // sp 単位を使う（dp ではなく）
    Text(
        text = "コンテンツ",
        fontSize = 16.sp,     // 正しい: ユーザー設定に追従
        // fontSize = 16.dp   // 悪い例
    )
}
```

### コンテンツディスクリプション

```kotlin
// Compose の場合
IconButton(
    onClick = { closeDialog() },
    modifier = Modifier.semantics {
        contentDescription = "ダイアログを閉じる"
    }
) {
    Icon(Icons.Default.Close, contentDescription = null)
}
```

## テスト チェックリスト

### 自動テスト
- [ ] axe-core / Playwright の aXe プラグインを CI に組み込む
- [ ] HTML バリデーターでセマンティクスを確認する
- [ ] カラーコントラストチェッカーで確認する
- [ ] フォームラベルの紐付けをテストする

### 手動テスト

**キーボードのみ（マウスなし）:**
- [ ] Tab キーだけですべての操作が完結する
- [ ] フォーカスが常に視覚的に確認できる
- [ ] モーダルがフォーカスをトラップし、Escape で閉じられる
- [ ] カスタムウィジェットが期待どおりのキー入力を処理する

**スクリーンリーダー:**
- [ ] macOS / iOS: VoiceOver
- [ ] Windows: NVDA + Chrome / Firefox
- [ ] Android: TalkBack

**確認すべき点:**
- [ ] すべてのインタラクティブ要素がアナウンスされる
- [ ] フォームエラーがアナウンスされる（`aria-live` または `role="alert"`）
- [ ] ページの見出し構造が論理的である（h1 → h2 → h3）
- [ ] リンクテキストが文脈を持つ（"こちら" などを避ける）
- [ ] 動的コンテンツの更新がアナウンスされる

## よくある落とし穴

```html
<!-- 悪い例: リンクテキストが文脈を持たない -->
<a href="/docs">こちらをクリック</a>

<!-- 良い例: 文脈のあるリンクテキスト -->
<a href="/docs">ドキュメントを読む</a>

<!-- 悪い例: role="button" をインタラクティブでない要素に付ける -->
<div role="button" onclick="submit()">送信</div>

<!-- 良い例: 意味論的なボタンを使う -->
<button type="submit">送信</button>
```

## クイックリファレンス

| チェック項目 | 基準 |
|----------|----------|
| テキストのコントラスト比 | AA: 4.5:1、大テキスト: 3:1 |
| フォーカスインジケーター | 3:1 以上のコントラスト比 |
| タッチターゲット | 最小 44×44pt（iOS）、48×48dp（Android）|
| alt テキスト | 情報画像には必須、装飾は空 |
| フォームラベル | すべての入力欄に関連付け必須 |
| キーボード操作 | 全機能がキーボードのみで実行可能 |
| 言語宣言 | `<html lang="ja">` を設定 |
| エラー状態 | テキストで識別、色だけに依存しない |
