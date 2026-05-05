---
name: note
description: ECC を読んで気づいたこと・考察を Output/02_notes/ にノートとして追記する
---

# /note — 読書ノートスキル

ECC を読んで気づいたこと、01_analysis への補足・解釈・応用アイデアを `Output/02_notes/` に記録する。

## 使い方

```
/note <トピック>

例:
  /note agent-routing の設計思想について
  /note hooks と skills の使い分け
  /note fb スキルから学んだフィードバックループの作り方
```

## ノート作成の手順

1. **トピックを確認**: 何について書くかを明確にする
2. **関連する01_analysisを確認**: すでに解析メモがあれば参照する
3. **ユーザーに質問する（必須）**: ユーザーが何を学んだのか、どういう気づきを得たのかをチャットで質問し、ユーザーの実際の言葉を引き出す。AI側で勝手な推測や憶測でノートを作らない。
4. **ノートファイルを作成**: ユーザーとの対話で確定した内容に基づき `Output/02_notes/YYYY-MM-DD_{トピック}.md` を作成する。
5. **ユーザーの言葉で書く**: AI の出力をベースにするのではなく、ユーザーの解釈・言葉を記述する

## 出力テンプレート

```markdown
# {トピック}

**日付**: YYYY-MM-DD
**関連解析**: → [01_analysis/{関連ファイル}.md]（あれば）
**関連Question**: → [06_questions/open または resolved/{関連ファイル}.md]（あれば）
**関連ECC**: ECC/{ファイルパス}

## やり取りした内容（事実のみ）
（ユーザーとのやり取りで判明した内容を簡潔にまとめる。勝手な推測や考察は追加しない）

## 次に調べること
（やり取りの中で明確になった、次に調べるべき事項があれば記載）
```

## 書き方のガイドライン

- **ユーザー主体で作成する**: テンプレートについて足りない項目は必ずユーザーに質問し、ユーザーの言葉が入ったことを確認してからノートを作成する。
- **やり取りした内容のみを記載する**: AIの勝手な推測や考察は絶対に追加しない。
- **客観的事実をまとめる**: AI の出力をそのままコピーせず、ユーザーの言葉や事実を簡潔な箇条書きなどで整理する。
- **Question由来の場合**: Questionのやり取りからノートを作成する場合は、必ずそのQuestionファイルへリンクすること。
- **疑問が湧いたら別途 /question で記録**: ノートに疑問を埋め込まない
- **02_notes/README.md のインデックスを更新する**

### 参考：Claude Code サポートされているフロントマターフィールド
Claude Codeのサブエージェント等でサポートされているフロントマターフィールドは以下の通りです：

- `name`: サブエージェントやスキルの名前
- `description`: エージェントの役割や目的の説明
- `tools`: 利用を許可するツール（例: Read, Bash, Agent(agent_type)）
- `disallowedTools`: 利用を禁止するツール（例: Write, Edit）
- `model`: 使用するAIモデル（sonnet, opus, haiku, inheritなど）
- `permissionMode`: 権限モード（default, acceptEdits, auto, dontAsk, bypassPermissions, plan）
- `maxTurns`: 実行可能な最大ターン数
- `skills`: エージェントにプリロードするスキル
- `mcpServers`: サブエージェントにスコープされたMCPサーバー
- `hooks`: サブエージェント用のライフサイクルフック
- `memory`: 永続メモリのスコープ（user, project, local）
- `background`: バックグラウンドタスクとして実行するか（true/false）
- `effort`: 推論のエフォートレベル（low, medium, high, xhigh, max）
- `isolation`: 実行の隔離環境（例: worktree）
- `color`: インターフェースの表示色
- `initialPrompt`: 初期プロンプト
