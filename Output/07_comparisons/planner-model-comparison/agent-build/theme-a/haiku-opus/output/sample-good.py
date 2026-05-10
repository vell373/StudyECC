"""
Sample Code: High-Quality Python Code

このサンプルコードは、セキュリティ・品質のベストプラクティスを示しています。
ハーネスでの「検出なし」または「軽微な指摘のみ」を確認用。
"""

import hashlib
import secrets
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

# ========================================
# Security Best Practice 1: Parameterized Queries
# ========================================

class UserRepository:
    """ユーザーデータベースアクセスレイヤー"""

    def __init__(self, db_connection):
        """
        Args:
            db_connection: データベース接続オブジェクト
        """
        self.db = db_connection
        self.logger = logging.getLogger(__name__)

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """
        ユーザーをID指定で取得（パラメータバインディング）

        Args:
            user_id: ユーザーID

        Returns:
            ユーザー情報辞書、または None
        """
        # ✓ Good: パラメータバインディング使用
        query = "SELECT * FROM users WHERE id = ?"
        result = self.db.query(query, [user_id])

        if result:
            self.logger.info(f"User fetched: {user_id}")
            return result[0]
        return None

    def create_user(self, name: str, email: str, password: str) -> bool:
        """
        新規ユーザー作成（パスワードハッシング）

        Args:
            name: ユーザー名
            email: メールアドレス
            password: プレーンテキストパスワード

        Returns:
            作成成功フラグ
        """
        # ✓ Good: bcrypt/argon2 でハッシング
        # （実装例は hashlib.pbkdf2_hmac を使用）
        salt = secrets.token_hex(32)
        hashed_password = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # iterations
        ).hex()

        query = "INSERT INTO users (name, email, password_hash, salt) VALUES (?, ?, ?, ?)"
        try:
            self.db.execute(query, [name, email, hashed_password, salt])
            self.logger.info(f"User created: {email}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to create user: {e}")
            return False


# ========================================
# Security Best Practice 2: Input Validation
# ========================================

class InputValidator:
    """ユーザー入力バリデーション"""

    @staticmethod
    def validate_email(email: str) -> bool:
        """
        メールアドレスバリデーション

        Args:
            email: メールアドレス

        Returns:
            有効フラグ
        """
        if not isinstance(email, str):
            return False
        if len(email) > 254 or len(email) < 5:
            return False
        # ✓ Good: 許可リスト方式での検証
        if '@' not in email or email.count('@') != 1:
            return False
        return True

    @staticmethod
    def validate_file_path(base_dir: str, user_file: str) -> Optional[str]:
        """
        ファイルパスバリデーション（パストラバーサル対策）

        Args:
            base_dir: ベースディレクトリ
            user_file: ユーザーが指定したファイル名

        Returns:
            正規化されたパス、または None（不正な場合）
        """
        import os

        # ✓ Good: パストラバーサル対策（絶対パス正規化）
        full_path = os.path.abspath(os.path.join(base_dir, user_file))

        # ベースディレクトリ配下であることを確認
        if not full_path.startswith(os.path.abspath(base_dir)):
            return None

        return full_path


# ========================================
# Quality Best Practice 1: Clear Function Responsibility
# ========================================

def validate_user_data(user_data: Dict) -> bool:
    """
    ユーザーデータをバリデーション

    Args:
        user_data: ユーザーデータ辞書

    Returns:
        有効フラグ
    """
    required_fields = ['name', 'email', 'age']

    # ✓ Good: ガード句で早期 return
    if not isinstance(user_data, dict):
        return False

    if not all(field in user_data for field in required_fields):
        return False

    if not InputValidator.validate_email(user_data['email']):
        return False

    if not isinstance(user_data['age'], int) or user_data['age'] < 0:
        return False

    return True


def calculate_user_age(birth_date: datetime) -> int:
    """
    生年月日から年齢を計算

    年数計算ロジックが単純なため関数化。意図が明確になる。

    Args:
        birth_date: 生年月日

    Returns:
        年齢
    """
    today = datetime.now()
    age = today.year - birth_date.year

    # 誕生日がまだの場合は -1
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1

    return age


# ========================================
# Quality Best Practice 2: Clear Naming & Short Functions
# ========================================

class UserService:
    """ユーザー関連ビジネスロジック"""

    def __init__(self, repository: UserRepository):
        """
        Args:
            repository: ユーザーリポジトリ
        """
        self.repository = repository
        self.validator = InputValidator()
        self.logger = logging.getLogger(__name__)

    def register_user(self, name: str, email: str, password: str) -> bool:
        """
        新規ユーザー登録

        Args:
            name: ユーザー名
            email: メールアドレス
            password: パスワード

        Returns:
            登録成功フラグ
        """
        # ✓ Good: バリデーション優先
        if not self._validate_registration_inputs(name, email, password):
            return False

        # ✓ Good: ビジネスロジック分離
        success = self.repository.create_user(name, email, password)
        if success:
            self.logger.info(f"User registration successful: {email}")

        return success

    def _validate_registration_inputs(self, name: str, email: str, password: str) -> bool:
        """
        登録入力バリデーション（private メソッド）

        Args:
            name: ユーザー名
            email: メールアドレス
            password: パスワード

        Returns:
            有効フラグ
        """
        # ✓ Good: 条件をシンプルに
        if not name or len(name) < 2 or len(name) > 100:
            self.logger.warning("Invalid name")
            return False

        if not self.validator.validate_email(email):
            self.logger.warning(f"Invalid email: {email}")
            return False

        if not self._validate_password(password):
            self.logger.warning("Password does not meet requirements")
            return False

        return True

    @staticmethod
    def _validate_password(password: str) -> bool:
        """
        パスワード強度バリデーション

        Args:
            password: パスワード

        Returns:
            有効フラグ
        """
        # ✓ Good: ポリシーが明確
        if len(password) < 8:
            return False
        if not any(c.isupper() for c in password):
            return False
        if not any(c.isdigit() for c in password):
            return False
        return True

    def get_user(self, user_id: int) -> Optional[Dict]:
        """
        ユーザー取得

        Args:
            user_id: ユーザーID

        Returns:
            ユーザー情報、または None
        """
        return self.repository.get_user_by_id(user_id)


# ========================================
# Quality Best Practice 3: Appropriate Comments
# ========================================

class AuthenticationService:
    """認証・トークン管理"""

    TOKEN_EXPIRY_MINUTES = 30

    def generate_session_token(self, user_id: int) -> str:
        """
        セッショントークン生成

        Args:
            user_id: ユーザーID

        Returns:
            セッショントークン
        """
        # ✓ Good: 秘密鍵をランダムに生成（ハードコード不可）
        token = secrets.token_urlsafe(32)
        # 実装: token -> キャッシュに TTL 付きで保存
        return token

    def verify_token(self, token: str, user_id: int) -> bool:
        """
        トークン検証

        Args:
            token: セッショントークン
            user_id: ユーザーID

        Returns:
            有効フラグ
        """
        # ✓ Good: トークンとユーザーID両方で検証
        # キャッシュからトークンを検索し、user_id が一致するか確認
        # 実装: cache.get(token) == user_id and not expired
        return True  # mock


# ========================================
# Quality Best Practice 4: Appropriate Nesting
# ========================================

def process_user_batch(users: List[Dict]) -> List[Dict]:
    """
    複数ユーザーをバッチ処理

    ネスト深度が浅い（1～2 層）ため可読性高い

    Args:
        users: ユーザーリスト

    Returns:
        処理済みユーザーリスト
    """
    # ✓ Good: ガード句で early return
    if not users:
        return []

    processed_users = []

    for user in users:
        # ✓ Good: 複雑なロジックはヘルパー関数に
        if not validate_user_data(user):
            continue

        processed_user = {
            **user,
            'processed_at': datetime.now().isoformat(),
        }
        processed_users.append(processed_user)

    return processed_users


# ========================================
# Logging & Error Handling
# ========================================

# ✓ Good: 構造化ログ、スタックトレース非公開
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


# ========================================
# Usage Example
# ========================================

if __name__ == '__main__':
    # Mock DB 接続
    class MockDB:
        def query(self, sql: str, params: list):
            return [{'id': 1, 'name': 'John', 'email': 'john@example.com'}]

        def execute(self, sql: str, params: list):
            pass

    # サービス初期化
    db = MockDB()
    repo = UserRepository(db)
    service = UserService(repo)

    # ユーザー登録テスト
    success = service.register_user(
        name='Alice',
        email='alice@example.com',
        password='SecurePass123'
    )
    print(f"Registration: {'Success' if success else 'Failed'}")

    # ユーザー取得テスト
    user = service.get_user(user_id=1)
    print(f"User: {user}")

    # バッチ処理テスト
    users = [
        {'name': 'Bob', 'email': 'bob@example.com', 'age': 25},
        {'name': 'Carol', 'email': 'carol@example.com', 'age': 30},
    ]
    processed = process_user_batch(users)
    print(f"Processed users: {len(processed)}")
