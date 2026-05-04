# クラウドインフラセキュリティ

本番環境のAWS/GCP/Azureインフラを保護するためのセキュリティチェックリスト。

## IAMと最小権限の原則

- [ ] 各サービスアカウント/ロールに最小限の権限のみ付与している
- [ ] ワイルドカード（`*`）ポリシーを本番環境で使用していない
- [ ] クロスアカウントアクセスが適切に制限されている
- [ ] 定期的な権限レビューを実施している

```hcl
# ✅ 最小権限のIAMポリシー（Terraform）
resource "aws_iam_policy" "lambda_policy" {
  name = "lambda-minimal-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}
```

## シークレット管理

- [ ] シークレットがAWS Secrets ManagerまたはHashiCorp Vaultに保存されている
- [ ] ハードコードされたシークレットがコードやTerraformファイルにない
- [ ] シークレットのローテーションが自動化されている
- [ ] シークレットへのアクセスがログに記録されている

```typescript
// ✅ AWS Secrets Managerからシークレットを取得
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return response.SecretString!;
}
```

## VPC・ネットワークセキュリティ

- [ ] プライベートサブネットにデータベースとキャッシュを配置している
- [ ] セキュリティグループが最小限のポートのみを許可している
- [ ] 本番環境でパブリックIPが不要なリソースに割り当てられていない
- [ ] VPCフローログが有効になっている

```hcl
# ✅ セキュアなセキュリティグループ（Terraform）
resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSHは直接公開しない - Systems Managerを使用する
}
```

## CloudWatchロギング

- [ ] すべてのAPIコールがCloudTrailでログ記録されている
- [ ] 異常なアクティビティのアラートを設定している
- [ ] ログの改ざん防止が有効になっている
- [ ] ログの保持期間をコンプライアンス要件に合わせている

```hcl
# ✅ CloudWatchアラーム（Terraform）
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "unauthorized-api-calls"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnauthorizedAttemptCount"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}
```

## CI/CDパイプラインセキュリティ

- [ ] GitHub ActionsでOIDCを使用してAWSにアクセスしている（長期的なキーを使用していない）
- [ ] デプロイメントシークレットがシークレットマネージャーに保存されている
- [ ] パイプラインでsecret scanningを有効にしている
- [ ] デプロイメント前にセキュリティスキャンを実行している

```yaml
# ✅ OIDCを使ったGitHub Actionsのデプロイ
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/GitHubActionsRole
          aws-region: us-east-1
```

## CloudflareとWAF

- [ ] CloudflareのWAFルールが本番トラフィックで有効になっている
- [ ] ボット管理が設定されている
- [ ] DDoS保護が有効になっている
- [ ] カスタムファイアウォールルールが設定されている

```typescript
// ✅ Cloudflare Workers でIPブロッキング
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const clientIP = request.headers.get('CF-Connecting-IP');
    
    // ブロックリストの確認
    const isBlocked = await env.BLOCKED_IPS.get(clientIP!);
    if (isBlocked) {
      return new Response('Forbidden', { status: 403 });
    }
    
    return fetch(request);
  }
};
```

## バックアップとディザスタリカバリ

- [ ] 重要なデータベースの自動バックアップが設定されている
- [ ] バックアップが別リージョンに保存されている
- [ ] 定期的にバックアップのリストアテストを実施している
- [ ] RTO（目標復旧時間）とRPO（目標復旧時点）が定義されている

```hcl
# ✅ RDSのバックアップ設定（Terraform）
resource "aws_db_instance" "main" {
  identifier     = "production-db"
  
  backup_retention_period = 30  # 30日間のバックアップ保持
  backup_window          = "03:00-04:00"  # UTC
  
  deletion_protection = true  # 誤削除防止
  skip_final_snapshot = false
  final_snapshot_identifier = "production-db-final-snapshot"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
}
```
