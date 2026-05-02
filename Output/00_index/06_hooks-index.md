# ECC フック詳細カタログ (20+ Hooks)

フックは、AIツール（Bash, Write, Edit等）の実行前後に割り込んで自動化を行うイベント駆動型の仕組みです。`hooks/hooks.json` に設定が記述されています。

---

## 🔄 ライフサイクルとイベント (Events)

ツールが実行される際の、フックの発火タイミングです。

```
SessionStart → [ツール呼び出しループ] → Stop → SessionEnd
                  ↑                ↓
              PreToolUse      PostToolUse
                              PostToolUseFailure
              PreCompact（記憶圧縮時）
```

---

## 🛑 PreToolUse (実行前チェック: ブロック可能)
ツールが実行される「前」にチェックし、NGなら実行を阻止します（exit code 2）。

| フックID | マッチャー | 役割 |
|---------|----------|-----|
| **`pre:bash:dispatcher`** | Bash | **Gitコミット前の品質ゲート**。秘密情報の検知、リンター実行、コミットメッセージ形式の確認を一括で行う。 |
| **`pre:write:doc-file-warning`**| Write | 非標準なMarkdownファイル作成への警告。 |
| **`pre:config-protection`** | Edit/Write | LinterやFormatterの設定ファイルをAIが勝手に弱めるのを阻止。 |
| **`pre:mcp-health-check`** | * | MCPサーバの死活監視。不健全なツール実行を事前に防ぐ。 |
| **`pre:edit-write:suggest-compact`**| Edit/Write | コンテキストが肥大化している場合、`/compact`（要約）を促す。 |

---

## 📢 PostToolUse (実行後処理: 非ブロッキング)
ツールの実行「後」に結果を分析したり、追加の自動化を行います。

| フックID | マッチャー | 役割 |
|---------|----------|-----|
| **`post:bash:dispatcher`** | Bash | PR作成後のURLログ出力、長時間ビルド完了後の通知など。 |
| **`post:quality-gate`** | Edit/Write | ファイル編集直後に、一時的なエラーや警告がないか高速チェック。 |
| **`post:observe:continuous-learning`**| * | ツールの実行結果（成功・失敗）を学習用データとしてキャプチャ。 |
| **`post:edit:typecheck`** | Edit | `.ts` ファイル編集後に `tsc --noEmit` を走らせ、型エラーを即座に報告。 |
| **`post:edit:console-warn`** | Edit | `console.log` が残っていないか警告。 |

---

## 🏁 Lifecycle Hooks (セッション・ライフサイクル)
セッションの開始・終了時に行われるメンテナンスです。

- **`session:start`**: 前回セッションの要約読み込み、パッケージマネージャ（npm/pnpm等）の自動検知。
- **`stop:format-typecheck`**: 回答の最後に、編集したすべてのファイルを一括でフォーマット（Biome/Prettier）。
- **`stop:evaluate-session`**: セッションを振り返り、抽出可能な「パターン」がないか分析。
- **`stop:desktop-notify`**: 長い作業が終わった際に、macOS/WSLの通知センターに完了を通知。
- **`stop:cost-tracker`**: その回答で消費したトークン数と概算コストを記録。

---

## 🛠 フックの制御 (Runtime Control)
環境変数で挙動をカスタマイズできます。

- `ECC_HOOK_PROFILE=minimal|standard|strict`: チェックの厳しさを変更。
- `ECC_DISABLED_HOOKS="id1,id2"`: 特定のフックを一時的に無効化。
- `ECC_GATEGUARD=off`: Gitコミット時の厳格なガード（GateGuard）をオフにする。

---

**依存関係**:
- **実行主体**: `scripts/hooks/` 配下のJSスクリプトが実体。
- **設定元**: `hooks/hooks.json`
- **知識**: `rules/common/hooks.md` に設計原則が記載されています。
