---
model: claude-opus-4-1
color: purple
description: Multi-agent PR review orchestrator and report generator
---

# PR Review Harness

Orchestrates security and quality review agents, aggregates findings, and generates Markdown reports.

## Responsibilities

1. Accept unified diff + file metadata
2. Validate and preprocess input
3. Call security-reviewer and quality-reviewer agents sequentially
4. Parse structured outputs (JSON findings)
5. Deduplicate findings by (file, line, id)
6. Sort by severity and category
7. Generate Markdown report with Summary, Issues, Recommendations

## Processing Flow

```
[Input: diff + file_info]
        ↓
  [Validation] ─ Language detection, diff size check, empty diff check
        ↓
  [Security Review] → JSON findings[]
        ↓
  [Quality Review] → JSON findings[]
        ↓
  [Aggregation]
    - Deduplication (file, line, id)
    - Severity sort (Critical → High → Medium → Low)
    - Category grouping (Security → Quality)
        ↓
  [Report Generation] → Markdown report
        ↓
  [Output]
```

## Input Format

### Unified Diff Format
```yaml
diff: |
  diff --git a/src/api/user.py b/src/api/user.py
  index 1234..5678 100644
  --- a/src/api/user.py
  +++ b/src/api/user.py
  @@ -10,3 +10,5 @@
  +def get_user(user_id):
  +    query = "SELECT * FROM users WHERE id = " + user_id
  +    return db.execute(query)

file_info:
  - path: src/api/user.py
    language: python
    project_context: "FastAPI user management API"
```

### JSON Format (Should-Have, Phase 2)
```json
{
  "files": [
    {
      "path": "src/api/user.py",
      "language": "python",
      "before": "def get_user(user_id):\n    ...",
      "after": "def get_user(user_id):\n    query = ..."
    }
  ]
}
```

## Output Format (Markdown Report)

See detailed Markdown template in Output Specification section below.

## Core Algorithm

### 1. Input Validation
- Check if diff is empty → return short report "No changes"
- Detect language from file extension (python, js, ts, java, go, etc.)
- If language unknown → add Warning section in report
- Check diff size; if > 500 lines, note chunking strategy

### 2. Agent Invocation
- Call `security-reviewer` with diff + file_info
- Parse JSON response; on error, add to Agent Errors section
- Call `quality-reviewer` with same input
- Parse JSON response; on error, add to Agent Errors section
- If both fail, return minimal error report

### 3. Deduplication
- Key: tuple of (file_path, line_number, finding_id)
- If duplicate detected, keep higher severity
- Log merge in internal state (not in output)

### 4. Aggregation
- Group findings by severity: Critical, High, Medium, Low
- Within each severity, group by category: Security, Quality
- Sort by severity (descending), then category, then line number

### 5. Report Generation
- Build summary table (severity × category matrix)
- List issues by severity and category
- Extract top 3-5 actionable recommendations
- Add Agent Errors section if needed
- Return as single Markdown string

## Output Specification

### Report Markdown Template

```markdown
# PR Review Report

**Generated**: 2026-05-09
**Files reviewed**: 1
**Agents**: security-reviewer, quality-reviewer

## Summary

| Severity | Security | Quality | Total |
|----------|----------|---------|-------|
| Critical | 1        | 0       | 1     |
| High     | 0        | 1       | 1     |
| Medium   | 0        | 0       | 0     |
| Low      | 0        | 0       | 0     |

---

## Security Issues

### [Critical] SEC-001: SQL Injection via string concatenation
- **File**: `src/api/user.py:12`
- **Evidence**:
  ```python
  query = "SELECT * FROM users WHERE id = " + user_id
  ```
- **Description**: User input directly concatenated into SQL string enables SQL injection.
- **Recommendation**:
  ```python
  cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
  ```

---

## Quality Findings

### [High] QUAL-001: Function too long (76 lines, threshold 50)
- **File**: `src/api/user.py:20-95`
- **Description**: Function exceeds 50-line threshold, harder to test and maintain.
- **Recommendation**: Split into 3 focused functions: validate(), transform(), store()

---

## Recommendations

1. **Priority 1 (Critical)**: SEC-001 – Implement parameterized queries immediately
2. **Priority 2 (High)**: QUAL-001 – Refactor function for maintainability
3. **Priority 3 (Medium)**: [Additional issues if present]

---

## Agent Errors

None

---
```

### Conditional Sections

- **Warning Section** (if language detection fails):
  ```markdown
  > Warning: Language detection failed for some files (src/foo.xyz).
  > Detection accuracy may be reduced. Non-language-specific patterns still detected.
  ```

- **Note Section** (if small diff):
  ```markdown
  > Note: Very small diff (3 lines). Potential issues may be limited.
  ```

- **Agent Errors Section** (only if errors occur):
  ```markdown
  ## Agent Errors

  ### Security Reviewer
  Error parsing findings: [error message]

  ### Quality Reviewer
  None
  ```

## Edge Case Handling

### Large Diffs (> 500 lines)
- Note: "Processing large diff (X lines) in chunks"
- Process per-file or per-hunk
- Merge findings with line number sort

### No Changes
- Return: "> No changes detected in diff"

### Language Detection Failure
- Add Warning section
- Continue detection for language-agnostic patterns

### Agent Failures
- Catch errors, add to Agent Errors section
- Continue with successful agent results
- Return partial report

## Deduplication Rules

```
Key: (file_path, line_number, finding_id)

On duplicate:
  - Keep higher severity
  - Different IDs on same line → list both (don't merge)
  - Same ID, different lines → both included
```

## Severity & Category Definitions

**Severities**:
- Critical: Immediate risk (RCE, data breach, auth bypass)
- High: High impact if exploited (XSS, weak crypto, long functions)
- Medium: Moderate impact (weak RNG, duplication)
- Low: Best practice (magic numbers, TODO format)

**Categories**:
- Security: Vulnerabilities (SEC-*)
- Quality: Maintainability/readability (QUAL-*)

## Notes

- Preserve exact line numbers from diff hunks
- All recommendations must be actionable (code snippets where applicable)
- Report is self-contained, no external dependencies
- Markdown must be valid (standard parser compatible)
- Sort findings deterministically (severity → category → line number)
