# ECC メモリ共有 & 整合性設計 分析

> 対象ファイル: ECC リポジトリの各種スキル・フック・ドキュメント群  
> 分析日: 2026-05-05

---

## 1. ECCのメモリ共有モデル全体像

ECCはセッション間・エージェント間のメモリ共有を、**「書き込み場所を役割ごとに厳密に分離する」**という設計で解決しています。単一の共有メモリを複数エージェントが触る設計ではなく、**書き込み先を階層ごとに固定することでコンフリクトを構造的に排除**しています。

```
┌─────────────────────────────────────────────────────────────────────┐
│            ECCのメモリ階層（knowledge-ops SKILL.md より）             │
├──────────┬───────────────────────────────┬───────────────────────────┤
│ Layer 1  │ GitHub / Linear               │ アクティブな実行真実       │
│ Layer 2  │ ~/.claude/projects/*/memory/  │ セッション間クイックアクセス│
│ Layer 3  │ MCP Memory Server             │ 意味検索可能なナレッジグラフ│
│ Layer 4  │ Knowledge Base Repo           │ 長期・クロスマシン保存      │
│ Layer 5  │ Supabase / PostgreSQL         │ 大量構造化データ           │
│ Layer 6  │ Local context/archive folder  │ 人間向けノート・アーカイブ  │
└──────────┴───────────────────────────────┴───────────────────────────┘
```

**設計原則：** 「ひとつの事実は一つの場所に」  
→ 同一情報を複数の層に並行保存することを明示的に禁止（knowledge-ops: "Prefer one canonical home per fact set"）

---

## 2. セッション間でのメモリ永続化の仕組み

### 2-1. continuous-learning-v2 の観察ループ

セッション中に発生したすべてのツール呼び出しを**hookで100%確実にキャプチャ**し、ローカルファイルへ記録します。

```
セッション中のツール使用
    │
    │ PreToolUse / PostToolUse フック（observe.sh）
    │ ← 100% deterministic（スキルと違い確率的でない）
    ▼
~/.claude/homunculus/projects/<project-hash>/observations.jsonl
    │
    │ バックグラウンドObserverエージェント（Claude Haiku）
    │ ← 5分おき / 最小20観察以上で起動
    ▼
instincts/*.yaml（信頼スコア付き・アトミックな学習単位）
    │
    │ /evolve コマンド
    ▼
skills / commands / agents として昇格
```

**重要な設計判断:**
- v1はスキル経由で観察 → 確率50〜80%でしか発火しない
- v2以降はフック経由 → **100%発火、ミスゼロ**

### 2-2. セッション永続化フック（hooks/README.md より）

| フック | タイミング | 役割 |
|--------|-----------|------|
| Session start | セッション開始 | 前回コンテキスト読み込み・PKG管理検出 |
| Pre-compact | コンパクション前 | 状態保存（コンテキスト圧縮前の退避） |
| Session summary (Stop) | 各レスポンス後 | セッション状態の永続化 |
| Session end (SessionEnd) | セッション終了 | ライフサイクルマーカー・クリーンアップ |

---

## 3. コンフリクト排除の設計

ECCが「コンフリクトが起きない」環境を実現する3つの柱：

### 柱1: プロジェクトスコープ分離（v2.1）

```yaml
# instinctのスコープ定義例
scope: project        ← プロジェクト固有（Reactパターン等）
project_id: "a1b2c3"
# または
scope: global         ← 全プロジェクト共通（セキュリティ等）
```

- **プロジェクトごとに独立したhashディレクトリ** (`projects/<hash>/`)
- React用学習がPythonプロジェクトに漏れることを構造的に防止
- 同一リポジトリを異なるマシンで使う場合も `git remote URL` のhashで同一IDが生成される

### 柱2: サブエージェントの観察禁止（自己ループ防止）

observe.sh に**5層のフィルタ**が組み込まれています：

```bash
# Layer 1: CLIかデスクトップのみ（自動化セッションをブロック）
case "${CLAUDE_CODE_ENTRYPOINT:-cli}" in
  cli|sdk-ts|claude-desktop) ;;
  *) exit 0 ;;
esac

# Layer 2: minimal プロファイルは非本質フック抑制
[ "${ECC_HOOK_PROFILE:-standard}" = "minimal" ] && exit 0

# Layer 3: 協調的スキップ変数
[ "${ECC_SKIP_OBSERVE:-0}" = "1" ] && exit 0

# Layer 4: サブエージェントセッションは自動化として除外
[ -n "$_ECC_AGENT_ID" ] && exit 0

# Layer 5: observer-sessions パスからの呼び出し除外
case "$STDIN_CWD" in *"observer-sessions"*) exit 0 ;; esac
```

→ **ObserverがObserver自身を観察するという無限ループを防止**

### 柱3: 決定結果の正規の場所への保存（council SKILL.md より）

Councilスキルの「永続化ルール」：

```
Do NOT write ad-hoc notes to ~/.claude/notes or other shadow paths.

If the council materially changes the recommendation:
- use knowledge-ops（正規のKBへ）
- or /save-session（セッションメモリへ）
- or update GitHub/Linear（実行真実の変更はトラッカーへ）

Only persist a decision when it changes something real.
```

→ **エージェントが勝手にランダムな場所に書くことを明示的に禁止**

---

## 4. 並行チャット作業時の整合性保証

### 4-1. コンテキスト分離（council の anti-anchoring 設計）

```
The three external voices should be launched as fresh subagents
with only the question and relevant context,
not the full ongoing conversation.
That is the anti-anchoring mechanism.
```

→ **複数エージェントが同じコンテキストを共有しない**ことが整合性の基本

### 4-2. 書き込み権限の役割分担

| 書き込み対象 | 誰が書く | タイミング |
|------------|---------|----------|
| GitHub Issues/PRs | メインエージェント | 実行真実が変わったとき |
| ~/.claude/memory/ | セッションフック（自動） | セッション中/後 |
| MCP memory graph | knowledge-ops スキル | 明示的な「save」指示時 |
| instincts/*.yaml | Observerエージェント（Haiku）| バックグラウンドで自動 |
| evolved/ skills | /evolveコマンド | 明示的に実行したとき |

→ **同じ場所に複数のエージェントが同時書き込みする状況が設計上発生しない**

### 4-3. 重複チェックの強制（knowledge-ops の Ingest Workflow）

```
### 2. Deduplicate（重複排除）
Check if this knowledge already exists:
- Search memory files for existing entries
- Query MCP memory with relevant terms
- Do not create duplicates. Update existing entries instead.
```

→ 新情報を保存する前に**必ず重複確認を挟む**ワークフロー

### 4-4. Observer の競合防止（observe.sh より）

```bash
# flock で atomic check-then-act（Linux）
flock -n 9 || exit 0
# macOS用フォールバック: mkdir の原子性を利用
mkdir "${LAZY_START_LOCK}.d" 2>/dev/null || exit 0
```

→ 複数のhookが同時起動してもObserverが二重起動しないようにロック管理

---

## 5. まとめ: ECCの整合性戦略

ECCは「コンフリクトを解消する」ではなく、**「コンフリクトが発生する状況そのものを作らない」**という設計思想を持っています。

| 課題 | ECCの解法 |
|------|---------|
| セッション間の記憶消失 | フック(100%発火) + 階層化ストレージへの自動書き込み |
| 並行エージェントの書き込み競合 | 書き込み先の役割固定 + atomic lock (flock/mkdir) |
| 複数プロジェクト間の汚染 | git remote URLベースのプロジェクトスコープ分離 |
| エージェントの自己ループ | observe.sh の5層フィルタ |
| 場当たりなメモ書き | council の永続化ルール（shadow path禁止） |
| 重複情報の蓄積 | knowledge-ops の Deduplicate ステップ強制 |

**核心思想:**
> "Prefer one canonical home per fact set. Avoid parallel copies of the same plan across local notes, repo files, and tracker docs."  
> — knowledge-ops/SKILL.md

---

## 参照ファイル

- `ECC/skills/knowledge-ops/SKILL.md` — メモリ階層・ingestionワークフロー
- `ECC/skills/continuous-learning-v2/SKILL.md` — 学習ループアーキテクチャ
- `ECC/skills/continuous-learning-v2/hooks/observe.sh` — 観察フック実装（5層フィルタ）
- `ECC/skills/council/SKILL.md` — 決定の永続化ルール
- `ECC/hooks/README.md` — フック種別と役割
- `ECC/AGENTS.md` — ナレッジ保存の指針（Step 4）
