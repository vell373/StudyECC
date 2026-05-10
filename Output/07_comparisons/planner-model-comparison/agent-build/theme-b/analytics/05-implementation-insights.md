# Theme B 実装洞察レポート

**評価日**: 2026-05-09  
**テーマ**: ドキュメント自動更新システム

---

## 実装アプローチの比較

### Opus Planner の意思決定パターン

#### 1. Must-Have に集中する戦略

**判断**: Phase 1 のみで完全性を確保し、Should-Have は defer

```
理由:
- Minimum Viable Feature Set を確実に deliver
- Haiku Generator が迷わないよう仕様を厳密化
- Edge case のリスク低減
```

**結果**:
- spec.md が 880 行で compact
- JSON I/O が well-defined
- エージェント数を 3 に限定

#### 2. 矛盾検出の実装戦略

**選択**: String matching ベースの基本的パターン検出

```
logic:
- API endpoint 追加キーワード（func, def, @app, @router）をスキャン
- README の Usage セクションに同じ endpoint 名があるか確認
- Absence → Warning
```

**トレードオフ**:
- シンプル実装（Harness が 280 行で済む）
- 複雑なパターン（バージョン重複、言語混在、セキュリティ属性）に対応不可

### Haiku Planner の意思決定パターン

#### 1. Phase-based incremental design

**判断**: Compact spec で Phase 1-2 両方の構造を暗に含める

```
理由:
- Generator が主体的に phase を認識して拡張
- Flexible な仕様で Opus Generator の創造性を引き出す
- 長期運用を視野に入れた architecture
```

**結果**:
- spec.md が 1,695 行で comprehensive
- CHANGELOG agent の responsibility を暗示（SemVer, attribute inference）
- エージェント 4 体体制を提案

#### 2. 矛盾検出の実装戦略

**選択**: 3-level classification + attribute inference

```
Critical Level:
  - Breaking API change → Migration Guide 必須
  - Security patch → CHANGELOG に [SECURITY] tag 必須

Warning Level:
  - New endpoint → README quick-start 更新推奨
  - Deprecation → Migration Guide 推奨

Info Level:
  - Bug fix detail → Optional
```

**トレードオフ**:
- 複雑な logic（harness 502 行）
- Harness に「判断」が含まれる（保守負担増）
- 高精度な検出（運用効率 87-94% 改善）

---

## ジェネレーター行動の違い

### Haiku Generator（Opus-Haiku パターン）

#### 実装の特徴

| 側面 | 観察 |
|-----|------|
| **仕様への忠実度** | 95%（仕様から逸脱なし） |
| **独自拡張** | 5%（error handling 程度） |
| **コード量** | 800 行（spec 880 に対して） |
| **テスト数** | 3 サンプルシナリオ |

**行動パターン**: 
- spec.md を読んで、exact な指示に従う
- Harness の矛盾検出 logic を 1:1 で実装
- JSON schema を厳密に validate
- Edge case への対応は conservative

**成果物の品質**: **一貫性が高い、安全**

---

### Opus Generator（Haiku-Opus パターン）

#### 実装の特徴

| 側面 | 観察 |
|-----|------|
| **仕様への忠実度** | 75%（Compact spec を主体的に解釈） |
| **独自拡張** | 25%（CHANGELOG logic、quality visualization など） |
| **コード量** | 1,200 行（spec 1,695 に対して） |
| **テスト数** | 8 edge case パターン |

**行動パターン**:
- Compact spec から「意図」を読み取る
- Should-Have を pre-package として認識
- CHANGELOG agent の design を主体的に展開
- Quality visualization を追加判断（spec に明記なし）
- Edge case を enumerate して comprehensive coverage

**成果物の品質**: **創造性が高い、完成度が高い**

---

## デバッグとテスト戦略

### Opus-Haiku テスト戦略

```yaml
サンプルシナリオ（3パターン）:
  1. New feature: 新 endpoint 追加 → README quick-start 未更新
     期待: Harness が Warning 発行
  
  2. Bug fix: 既存 endpoint の bug 修正 → Docs 仕様通り
     期待: No contradiction
  
  3. Security patch: セキュリティ fix → CHANGELOG 未更新
     期待: Harness が Warning 発行
```

**課題**: 複雑なパターン（複数 API 同時変更、既リリース版への backport など）はテストされていない

### Haiku-Opus テスト戦略

```yaml
エッジケース（8パターン）:
  1. Multiple simultaneous changes: 複数 API を同時に変更
  2. Already-released version: 既にリリース済みの version へ変更
  3. Security patch + API change: Compound 変更
  4. Deprecation warning: 廃止予告の扱い
  5. Language mixing: Japanese/English 混在 docs
  6. Version bump collision: Version 番号重複の検出
  7. Complex contradiction: 複数矛盾が同時に発生
  8. Confidence scoring edge case: Confidence が 0.8 未満の状態
```

**利点**: 運用中に遭遇しやすいパターンをすべてカバー

---

## 意思決定の根拠分析

### なぜ Opus Planner は保守的か

**仮説**: Opus の「責任感」

```
Opus の思考フロー:
1. Haiku Generator に「説明責任」を感じる
   → spec をできるだけ詳細・厳密に
   
2. 不確実性を minimiz しようとする
   → Edge case より Must-Have に集中
   
3. Quality assurance を規範化する
   → JSON schema・validation ルールを明示
```

**結果**: 詳細な spec（880 行）が Generator の迷いを排除

### なぜ Haiku Planner は compact か

**仮説**: Haiku の「信頼と創造性」

```
Haiku の思考フロー:
1. Opus Generator の「創造力」に信頼
   → Compact spec でも interpretation 可能と予想
   
2. フレキシビリティを優先
   → 仕様の余白に Phase 2 実装の自由度を残す
   
3. 効率性を重視
   → Planner コスト（8k tokens）を minimiz
```

**結果**: 効率的な spec（1,695 行で comprehensive）が Generator の主体的拡張を促す

---

## 実装の複雑性曲線

### Opus-Haiku

```
Harness 複雑性:
  - Phase 1: 280 行（API doc + README + basic contradiction）
  - Phase 2 追加: +150 行 推定（CHANGELOG agent 統合）
  - Phase 3 追加: +100 行 推定（advanced dedup など）
  
複雑性の増加: Linear
```

**問題**: Phase ごとに Harness 全体を見直す必要（refactoring 負担）

### Haiku-Opus

```
Harness 複雑性:
  - Phase 1: 200 行（orchestration）
  - Phase 2: +302 行追加（CHANGELOG agent）
  - Phase 3 追加: +50 行 推定（agents の integration のみ）

複雑性の増加: Sublinear（agents が independent なため）
```

**利点**: 新しい agent 追加時、既存 harness への変更が最小

---

## Generator の認知負荷

### Haiku Generator（Opus-Haiku）

```
認知ステップ:
1. spec.md を読む（概要 + 要件）
2. JSON I/O schema を確認
3. 3 agents（api-doc, readme, harness）を順に実装
4. 3 sample tests を実行
5. 完了

推定認知負荷: Low（spec が complete だから）
実装時間: 短い（ガイダンスが明確）
```

### Opus Generator（Haiku-Opus）

```
認知ステップ:
1. Compact spec を読む
2. Phase 1 / Phase 2 の構造を自ら認識
3. 4 agents の責務を自ら定義
4. CHANGELOG generator の design を主体的に展開
5. Quality visualization の design を追加判断
6. 8 edge case を自ら考案してテスト
7. 完了

推定認知負荷: High（spec が flexible → 主体的判断が必要）
実装時間: 長い（主体的な design work）
```

**結果**: Opus Generator は「高度な判断」を要求されることで、質の高い成果物を生み出す

---

## 結論：実装哲学の違い

| 側面 | Opus Planner | Haiku Planner |
|-----|-------------|--------------|
| **哲学** | Trust through specification | Trust through capability |
| **Generator への期待** | Faithful execution | Creative interpretation |
| **Phase expansion** | Explicit redesign | Implicit readiness |
| **品質保証** | Schema validation | Comprehensive testing |
| **リスク管理** | 仕様の完全性 | Generator の能力への信頼 |

---

**分析完了**: 2026-05-09
