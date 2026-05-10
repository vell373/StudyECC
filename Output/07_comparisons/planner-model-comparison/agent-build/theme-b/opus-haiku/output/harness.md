---
title: ドキュメント自動更新ハーネス（統合エージェント）
description: |
  複数の専門エージェント（API・README）を呼び出し、
  提案をマージ・矛盾検出し、最終レポートを生成する統合ハーネス
---

# ドキュメント自動更新ハーネス

**責務**: 複数の専門エージェントを呼び出し、提案をマージ・矛盾検出し、実行可能な最終レポートを生成する

## 入力スキーマ

```json
{
  "diff": "unified diff テキスト",
  "changeAttribute": "new-feature | bug-fix | deprecation | security-patch",
  "templates": {
    "api_md": "既存の API.md テンプレート",
    "readme_md": "既存の README.md テンプレート"
  },
  "metadata": {
    "authorEmail": "user@example.com",
    "commitMessage": "コミットメッセージ（オプション）",
    "changeId": "PR#123 や branch名（オプション）"
  }
}
```

## 処理フロー

```
[入力: diff + changeAttribute + templates]
    ↓
[1. 入力検証]
    ├→ diff フォーマット確認
    ├→ changeAttribute 妥当性確認
    └→ テンプレート存在確認
    ↓
[2. 変更属性の検証・推測]
    ├→ 入力された changeAttribute が妥当か確認
    └→ diff パターンから属性を推測（確信度計算）
    ↓
[3. 複数エージェントの並列実行]
    ├→ callAgent('api-doc-agent', { diff, changeAttribute, template })
    └→ callAgent('readme-agent', { diff, changeAttribute, template })
    ↓
[4. エージェント出力の収集]
    ├→ API エージェント出力（apiProposal）
    └→ README エージェント出力（readmeProposal）
    ↓
[5. 矛盾検出]
    ├→ API 新機能 ∧ README 未更新 → WARNING
    ├→ API 削除 ∧ README 記載残存 → ERROR
    ├→ 廃止予告対応の一貫性 → WARNING
    └→ 重複する提案の検出 → 整理
    ↓
[6. 提案のマージ・統合]
    ├→ 重複排除（同じセクション・同じ変更）
    ├→ 優先度付け（ERROR > WARNING > INFO）
    └→ ファイル別に集約
    ↓
[7. 最終レポート生成]
    ├→ サマリー（変更属性・影響範囲・矛盾有無）
    ├→ ファイル別提案（API.md / README.md）
    ├→ 矛盾検出結果
    └→ 最終判定（実行可能/要レビュー）
    ↓
[出力: Markdown レポート + JSON メタデータ]
```

## ステップ別処理

### ステップ1: 入力検証

```javascript
function validateInput(input) {
  const errors = [];
  
  // diff フォーマット確認
  if (!input.diff || !input.diff.includes('---') || !input.diff.includes('+++')) {
    errors.push('ERROR: diff が unified 形式でありません');
  }
  
  // changeAttribute 妥当性
  const validAttributes = ['new-feature', 'bug-fix', 'deprecation', 'security-patch'];
  if (!validAttributes.includes(input.changeAttribute)) {
    errors.push(`ERROR: changeAttribute が無効です: ${input.changeAttribute}`);
  }
  
  // テンプレート存在
  if (!input.templates?.api_md || !input.templates?.readme_md) {
    errors.push('ERROR: テンプレート (api_md, readme_md) が必須です');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  
  return true;
}
```

### ステップ2: 変更属性の検証・推測

入力された `changeAttribute` が妥当か確認し、diff パターンから属性を推測

```javascript
function inferChangeAttribute(diff, providedAttribute, commitMessage = '') {
  let inferredAttribute = null;
  let confidence = 0.0;
  
  // パターン1: 関数削除 → 「削除」or「廃止」
  if (diff.includes('- function') && !diff.includes('+ function')) {
    inferredAttribute = 'deletion';
    confidence = 0.95;
  }
  
  // パターン2: 関数追加 → 「新機能」
  if (diff.includes('+ function') || diff.includes('+ class')) {
    inferredAttribute = 'new-feature';
    confidence = 0.9;
  }
  
  // パターン3: コミットメッセージから推測
  if (commitMessage) {
    if (commitMessage.includes('security') || commitMessage.includes('CVE')) {
      inferredAttribute = 'security-patch';
      confidence = 0.85;
    } else if (commitMessage.includes('BREAKING CHANGE') || commitMessage.includes('fix!')) {
      inferredAttribute = 'bug-fix';
      confidence = 0.8;
    } else if (commitMessage.includes('deprecat')) {
      inferredAttribute = 'deprecation';
      confidence = 0.85;
    }
  }
  
  // 最終判定
  if (providedAttribute) {
    // 提供された属性と推測が矛盾
    if (inferredAttribute && inferredAttribute !== providedAttribute && confidence > 0.7) {
      return {
        attribute: providedAttribute,
        inferred: inferredAttribute,
        confidence,
        warning: `推測と異なる属性が指定されています（推測: ${inferredAttribute} ${confidence.toFixed(2)}）`
      };
    }
    return {
      attribute: providedAttribute,
      confidence: 1.0
    };
  }
  
  return {
    attribute: inferredAttribute || 'unknown',
    confidence
  };
}
```

### ステップ3: 複数エージェント呼び出し（並列実行）

```javascript
async function callSpecialistAgents(diff, changeAttribute, templates) {
  const [apiProposal, readmeProposal] = await Promise.all([
    // API ドキュメント更新エージェント
    callAgent('api-doc-agent', {
      diff,
      changeAttribute,
      template: templates.api_md
    }),
    
    // README 保守エージェント
    callAgent('readme-agent', {
      diff,
      changeAttribute,
      template: templates.readme_md
    })
  ]);
  
  return { apiProposal, readmeProposal };
}

// エージェント呼び出しのモック（実装時は Agent SDK の callAgent を使用）
async function callAgent(agentName, input) {
  // 実装: Agent SDK の agent_ref を使用してエージェントを呼び出す
  // 戻り値: { agentName, changes: [...], confidence: 0.9, warnings: [...] }
  
  console.log(`[Calling Agent] ${agentName}`);
  return {
    agentName,
    changes: [],
    confidence: 0.9,
    requiresHumanReview: false,
    warnings: []
  };
}
```

### ステップ4: 矛盾検出

```javascript
function detectConflicts(apiProposal, readmeProposal, changeAttribute) {
  const conflicts = [];
  
  // 新機能の検出
  const apiHasNewFunction = apiProposal.changes.some(c => c.type === 'insert');
  const readmeHasNewFeatureSection = readmeProposal.changes.some(
    c => c.section === '新機能' && c.type === 'insert'
  );
  
  // パターン1: API で新機能が追加されるが README に記載がない
  if (apiHasNewFunction && !readmeHasNewFeatureSection) {
    conflicts.push({
      level: 'WARNING',
      pattern: 'API_FEATURE_NOT_IN_README',
      message: 'API.md に新機能が追加されるが、README.md に新機能セクションがありません',
      severity: 'MEDIUM',
      recommendation: 'README.md に新機能説明を追加してください'
    });
  }
  
  // 削除関数の検出
  const apiHasRemovedFunction = apiProposal.changes.some(c => c.type === 'delete');
  const readmeHasRemovedFeature = readmeProposal.changes.some(c => c.type === 'delete');
  
  // パターン2: API で機能が削除されるが README に記載が残っている
  if (apiHasRemovedFunction && !readmeHasRemovedFeature) {
    // 廃止予告の場合は警告レベル
    if (changeAttribute === 'deprecation') {
      conflicts.push({
        level: 'WARNING',
        pattern: 'DEPRECATION_NOT_IN_README',
        message: '廃止予告が API に記載されるが、README に廃止予告セクションがありません',
        severity: 'LOW',
        recommendation: 'README に廃止予告を追加してください'
      });
    } else {
      // 完全削除の場合はエラー
      conflicts.push({
        level: 'ERROR',
        pattern: 'DELETION_MISMATCH',
        message: 'API で機能が削除されるが、README に古い記載が残っています',
        severity: 'HIGH',
        recommendation: 'README.md から該当する機能の説明を削除してください'
      });
    }
  }
  
  // パターン3: 廃止予告なのに削除扱いになっている
  if (changeAttribute === 'deprecation' && apiHasRemovedFunction) {
    // API が削除対応の場合、廃止予告セクションに移動しているか確認
    const hasDeprecationSection = apiProposal.changes.some(
      c => c.section && c.section.includes('廃止')
    );
    if (!hasDeprecationSection) {
      conflicts.push({
        level: 'WARNING',
        pattern: 'DEPRECATION_HANDLING',
        message: '廃止予告属性ですが、API.md に「廃止予告」セクションが見つかりません',
        severity: 'MEDIUM',
        recommendation: 'API.md に「廃止予告」セクションを作成してください'
      });
    }
  }
  
  return conflicts;
}
```

### ステップ5: 重複排除・優先度付け

```javascript
function mergeProposals(apiProposal, readmeProposal) {
  const allChanges = [
    ...(apiProposal.changes || []).map(c => ({ ...c, file: 'API.md' })),
    ...(readmeProposal.changes || []).map(c => ({ ...c, file: 'README.md' }))
  ];
  
  // 重複排除（同じセクション、同じ type、同じ before/after）
  const uniqueChanges = [];
  const seen = new Set();
  
  for (const change of allChanges) {
    const key = `${change.file}:${change.section}:${change.type}:${change.before || ''}:${change.after || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueChanges.push(change);
    }
  }
  
  // ファイル別に集約
  const mergedByFile = {};
  for (const change of uniqueChanges) {
    if (!mergedByFile[change.file]) {
      mergedByFile[change.file] = [];
    }
    mergedByFile[change.file].push(change);
  }
  
  // 優先度付け（エラー > 警告 > 情報）
  for (const file in mergedByFile) {
    mergedByFile[file].sort((a, b) => {
      const priorityMap = { ERROR: 0, WARNING: 1, INFO: 2 };
      const priorityA = priorityMap[a.severity] || 2;
      const priorityB = priorityMap[b.severity] || 2;
      return priorityA - priorityB;
    });
  }
  
  return mergedByFile;
}
```

### ステップ6: 最終レポート生成

```javascript
function generateFinalReport(
  diff,
  changeAttribute,
  apiProposal,
  readmeProposal,
  conflicts,
  mergedProposals,
  attributeValidation
) {
  const timestamp = new Date().toISOString();
  const hasErrors = conflicts.some(c => c.level === 'ERROR');
  const hasWarnings = conflicts.some(c => c.level === 'WARNING');
  const canExecute = !hasErrors;
  
  // Markdown レポート生成
  let report = `# ドキュメント更新提案レポート

## 概要

- **変更属性**: ${changeAttribute}`;
  
  if (attributeValidation?.warning) {
    report += ` ⚠️ (推測: ${attributeValidation.inferred} ${attributeValidation.confidence.toFixed(2)})`;
  }
  
  report += `
- **diff ファイル数**: ${countFilesInDiff(diff)}
- **影響するドキュメント**: ${Object.keys(mergedProposals).join(', ')}
- **矛盾検出**: ${conflicts.length === 0 ? 'なし' : `あり (${conflicts.length}件)`}
- **要レビュー**: ${hasErrors ? 'はい (エラー)' : hasWarnings ? 'はい (警告)' : 'いいえ'}

---

## API.md の提案変更

`;
  
  if (mergedProposals['API.md']) {
    for (const change of mergedProposals['API.md']) {
      report += generateChangeSection(change, 'API.md');
    }
  } else {
    report += '（変更なし）\n';
  }
  
  report += `\n## README.md の提案変更

`;
  
  if (mergedProposals['README.md']) {
    for (const change of mergedProposals['README.md']) {
      report += generateChangeSection(change, 'README.md');
    }
  } else {
    report += '（変更なし）\n';
  }
  
  // 矛盾検出結果
  report += `\n## 矛盾検出結果

`;
  
  if (conflicts.length === 0) {
    report += '- なし\n';
  } else {
    for (const conflict of conflicts) {
      const icon = conflict.level === 'ERROR' ? '❌' : '⚠️';
      report += `- ${icon} **${conflict.level}**: ${conflict.message}\n`;
      report += `  推奨: ${conflict.recommendation}\n\n`;
    }
  }
  
  // 最終判定
  report += `\n## 判定: このドキュメント差分は実行可能か？

${canExecute ? '✓' : '❌'} ${canExecute ? 'はい' : 'いいえ'}（${hasErrors ? 'エラーあり、レビュー必須' : hasWarnings ? '警告あり、確認推奨' : '矛盾なし、自動実行可能'}）

---

**生成日**: ${timestamp}
**生成エージェント**: ドキュメント自動更新ハーネス
`;
  
  return {
    markdown: report,
    metadata: {
      generatedAt: timestamp,
      changeAttribute,
      canExecute,
      hasErrors,
      hasWarnings,
      conflictCount: conflicts.length,
      proposedChanges: Object.values(mergedProposals).flat().length
    }
  };
}

function generateChangeSection(change, file) {
  let section = `### ${change.type === 'insert' ? '追加' : change.type === 'update' ? '修正' : '削除'}: ${change.section}

`;
  
  if (change.before) {
    section += `**before**:
\`\`\`
${change.before}
\`\`\`

`;
  }
  
  if (change.after) {
    section += `**after**:
\`\`\`
${change.after}
\`\`\`

`;
  }
  
  section += `**理由**: ${change.reason}

`;
  
  return section;
}

function countFilesInDiff(diff) {
  return (diff.match(/^---/gm) || []).length;
}
```

## 出力スキーマ

```json
{
  "report": "Markdown レポート（サマリー + ファイル別提案 + 矛盾結果 + 最終判定）",
  "metadata": {
    "generatedAt": "2026-05-09T10:30:00Z",
    "changeAttribute": "new-feature",
    "canExecute": true,
    "hasErrors": false,
    "hasWarnings": false,
    "conflictCount": 0,
    "proposedChanges": 2
  },
  "updateProposals": [
    {
      "file": "API.md",
      "changes": [
        {
          "type": "insert",
          "section": "multiply()",
          "before": null,
          "after": "### multiply(a, b): number..."
        }
      ]
    },
    {
      "file": "README.md",
      "changes": [
        {
          "type": "insert",
          "section": "新機能",
          "before": null,
          "after": "## 新機能\n..."
        }
      ]
    }
  ],
  "conflicts": []
}
```

## テンプレート例

### API.md テンプレート

```markdown
# API リファレンス

## add(a, b)

### シグネチャ
\`\`\`typescript
function add(a: number, b: number): number
\`\`\`

### 説明
2つの数値を足し合わせます。

### パラメータ
- `a` (number): 第1の数値
- `b` (number): 第2の数値

### 戻り値
- (number): a + b の結果

### 例
\`\`\`js
const result = add(2, 3);
console.log(result); // 5
\`\`\`
```

### README.md テンプレート

```markdown
# math - シンプルな数学ライブラリ

## 概要
シンプルで使いやすい数学ライブラリです。

## インストール
\`\`\`bash
npm install math
\`\`\`

## 基本的な使い方

### 足し算
\`\`\`js
const { add } = require('math');
const result = add(2, 3);
console.log(result); // 5
\`\`\`

## ライセンス
MIT
```

## 実装上の注意

- エージェント呼び出しは並列実行（タイムアウト設定あり）
- diff パースは失敗時も処理継続（不完全な情報で提案生成）
- 矛盾検出は「警告」と「エラー」を区別
- レポートは人間可読性を優先（JSON はメタデータ用）
- テンプレート形式の不整合には柔軟に対応

## サンプル実行例

入力:
```json
{
  "diff": "--- a/src/math.js\n+++ b/src/math.js\n@@ -10,3 +10,10 @@\n+function multiply(a, b) {\n+  return a * b;\n+}\n",
  "changeAttribute": "new-feature",
  "templates": {
    "api_md": "# API...",
    "readme_md": "# README..."
  }
}
```

出力レポート（抜粋）:
```
# ドキュメント更新提案レポート

## 概要
- **変更属性**: new-feature
- **影響するドキュメント**: API.md, README.md
- **矛盾検出**: なし
- **要レビュー**: いいえ

## API.md の提案変更

### 追加: multiply()
**after**:
### multiply(a: number, b: number): number
...

## README.md の提案変更

### 追加: 新機能
**after**:
## 新機能
...

## 判定: このドキュメント差分は実行可能か？
✓ はい（矛盾なし、自動実行可能）
```
