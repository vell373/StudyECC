> このファイルは [common/patterns.md](../common/patterns.md) を Web 固有パターンで拡張します。

# Web パターン

## コンポーネント構成

### 複合コンポーネント

関連 UI が状態と相互作用セマンティクスを共有する場合、複合コンポーネント使用:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

- 親が状態を所有
- 子供が context 経由で消費
- 複雑なウィジェットに prop ドリリング優先するこれ

### Render Props / Slots

- 動作が共有されるが markup が変わる必要がある場合、render props または slot パターン使用
- キーボード処理、ARIA、フォーカスロジックをヘッドレスレイヤーに保つ

### コンテナ / プレゼンテーション分割

- コンテナコンポーネントがデータ読み込みと副作用を所有
- プレゼンテーションコンポーネント props を受け取り、UI をレンダリング
- プレゼンテーションコンポーネントは pure のままであるべき

## ステート管理

これらを分離して扱う:

| 関心 | ツーリング |
|------|----------|
| サーバー状態 | TanStack Query, SWR, tRPC |
| クライアント状態 | Zustand, Jotai, signals |
| URL 状態 | search params, route segments |
| フォーム状態 | React Hook Form または同等 |

- サーバー状態をクライアントストアに複製しない
- 冗長な computed 状態を保存する代わりに値を導出

## URL をステートとして

共有可能な状態を URL で永続化:
- フィルター
- ソート順序
- ページネーション
- アクティブタブ
- 検索クエリ

## データフェッチ

### Stale-While-Revalidate

- キャッシュされたデータを即座に返す
- バックグラウンドで再検証
- 手でこれをロールする代わりに既存ライブラリを優先

### オプティミスティック更新

- 現在の状態をスナップショット
- オプティミスティック更新を適用
- 失敗時にロールバック
- ロールバック時に見える エラーフィードバック を出す

### 並列読み込み

- 独立したデータを並列でフェッチ
- 親-子リクエスト滝を避ける
- 正当化される場合、可能性のあるあるあ次ルートまたは状態を prefetch
