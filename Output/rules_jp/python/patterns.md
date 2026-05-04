---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python パターン

> このファイルは [common/patterns.md](../common/patterns.md) を Python 固有のコンテンツで拡張します。

## Protocol（ダック型）

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

## DTO として Dataclass

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## コンテキストマネージャーとジェネレーター

- リソース管理用にコンテキストマネージャー（`with` ステートメント）を使用
- メモリ効率的な反復と遅延評価にジェネレーターを使用

## リファレンス

スキル `python-patterns` で装飾子、並行処理、パッケージ組織を含む包括的パターンを参照。
