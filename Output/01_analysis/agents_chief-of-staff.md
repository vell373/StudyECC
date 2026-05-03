# chief-of-staff 解析

**解析日**: 2026-05-03
**対象パス**: ECC/agents/chief-of-staff.md
**関連トピック**: #agent #workflow #communication #automation

## 概要
`chief-of-staff` は、Email、Slack、LINEなどの複数チャンネルのメッセージを一元的にトリアージし、自動分類、ドラフト返信の作成、送信後のフォローアップタスクの実行を行う「チーフ・オブ・スタッフ」として機能するエージェント定義です。

## 構造・仕組み
- **フロントマター**: エージェント名(`chief-of-staff`)、使用ツール(`Read`, `Grep`, `Glob`, `Bash`, `Edit`, `Write`)、モデル(`opus`)を定義しています。
- **4-Tier Classification System**: 受信メッセージを4つのティア（skip / info_only / meeting_info / action_required）のいずれかに分類するルールを定義しています。
- **Triage Process**: 
  1. 並列フェッチ（各種CLIやMCPを利用）
  2. メッセージの分類
  3. 各ティアに応じたアクションの実行
  4. アクションが必要なメッセージのドラフト作成
  5. 送信後のフロー（カレンダー更新、ToDo追加など）
- **Post-Send Follow-Through**: メッセージ送信後にカレンダー登録やリレーションシップノートの更新など、7つの後続タスクを完了させることを強制するチェックリスト。
- **Briefing Output Format**: 今日の予定や未読サマリー、返信ドラフト、期限切れタスクをまとめたブリーフィングの出力形式。

## 設計上の特徴
- **フックによる確実な実行**: LLMの指示忘れを防ぐため、プロンプト指示だけでなく `PostToolUse` フックを用いて送信後のタスク完了をシステムレベルで強制する設計思想（Key Design Principles）が盛り込まれています。
- **決定論的スクリプトの併用**: カレンダーの計算など、LLMが苦手とする厳密なロジック処理には専用のスクリプト（`calendar-suggest.js`など）を併用させています。
- **記憶の外部化**: `relationships.md` や `todo.md` などのナレッジファイルを「記憶」として読み書きさせ、セッションを跨いだ文脈の維持を実現しています。

## 関連ファイル
- `private/relationships.md`: 送信者の文脈把握用。
- `SOUL.md`: ユーザーのトーンや性格設定用。
- `calendar-suggest.js`: カレンダーの空き枠計算スクリプト。
- `.claude/rules/*.md`: システム注入されるルール群。

## 参照元
- `/Users/yasuvel/StudyECC/ECC/agents/chief-of-staff.md`
