# PR Review Report

**Generated**: 2026-05-09
**Files reviewed**: 1
**Agents**: security-reviewer, quality-reviewer

## Summary

| Severity | Security | Quality | Total |
|----------|----------|---------|-------|
| Critical | 3        | 0       | 3     |
| High     | 2        | 0       | 2     |
| Medium   | 0        | 0       | 0     |
| Low      | 0        | 0       | 0     |

---

## Security Issues

### [Critical] SEC-001: SQL Injection via string concatenation
- **File**: `src/api/user.py:10`
- **Evidence**:
  ```python
  query = "INSERT INTO users VALUES (" + str(user_id) + ")"
  ```
- **Description**: User input is directly concatenated into SQL query string, enabling SQL injection attacks.
- **Recommendation**:
  ```python
  cursor.execute("INSERT INTO users VALUES (?)", (user_id,))
  ```

---

### [Critical] SEC-001: SQL Injection via f-string
- **File**: `src/api/user.py:17`
- **Evidence**:
  ```python
  query = f"SELECT * FROM users WHERE name = '{name}'"
  ```
- **Description**: User input embedded in f-string SQL query without parameterization enables SQL injection.
- **Recommendation**:
  ```python
  cursor.execute("SELECT * FROM users WHERE name = ?", (name,))
  ```

---

### [Critical] SEC-004: Hardcoded API Key
- **File**: `src/api/user.py:5`
- **Evidence**:
  ```python
  API_KEY_SECRET = "sk-1234567890abcdef"
  ```
- **Description**: API credentials hardcoded in source code are exposed to anyone with repository access.
- **Recommendation**:
  ```python
  import os
  API_KEY_SECRET = os.getenv("API_KEY_SECRET")
  ```

---

### [High] SEC-005: Weak Cryptography (MD5)
- **File**: `src/api/user.py:33`
- **Evidence**:
  ```python
  hashed = hashlib.md5(password.encode()).hexdigest()
  ```
- **Description**: MD5 is cryptographically broken and should not be used for password hashing.
- **Recommendation**:
  ```python
  import bcrypt
  hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
  ```

---

### [High] SEC-007: Unsafe Deserialization (pickle.loads)
- **File**: `src/api/user.py:39`
- **Evidence**:
  ```python
  obj = pickle.loads(data_blob)
  ```
- **Description**: pickle.loads() on untrusted data can lead to arbitrary code execution.
- **Recommendation**:
  ```python
  import json
  obj = json.loads(data_blob)  # Or use safer serialization format
  ```

---

## Quality Findings

None detected in vulnerable sample.

---

## Recommendations

1. **Priority 1 (Critical)**: SEC-001 (lines 10, 17) – Replace all SQL concatenation with parameterized queries
2. **Priority 2 (Critical)**: SEC-004 (line 5) – Move API_KEY_SECRET to environment variables
3. **Priority 3 (High)**: SEC-005 (line 33) – Replace MD5 with bcrypt for password hashing
4. **Priority 4 (High)**: SEC-007 (line 39) – Replace pickle.loads() with JSON deserialization

---

## Agent Errors

None

---
