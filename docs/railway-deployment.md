# Railway フロントエンド デプロイメントガイド

## 1. Railway プロジェクト作成

1. [Railway](https://railway.app) にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. `KNK-1833/Heatmap_frontend` リポジトリを選択

## 2. 環境変数設定

Railwayの Environment Variables セクションで以下を設定:

### 必須設定
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app/api/v1
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### オプション設定
```bash
# Stripe設定（課金機能使用時）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Analytics設定（Google Analytics使用時）
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# MCP Server設定（AIアシスタント機能使用時）
NEXT_PUBLIC_MCP_SERVER_URL=https://your-mcp-server.com
```

## 3. デプロイ設定

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 自動デプロイ設定
- main ブランチへのプッシュで自動デプロイ
- プルリクエストでプレビューデプロイ（オプション）

## 4. Next.js設定

### next.config.ts設定済み項目
- `output: 'standalone'` - Dockerデプロイ用最適化
- セキュリティヘッダー設定
- 画像最適化設定
- 実験的機能（chart.js最適化）

### Dockerfile最適化
- TypeScript本番ビルド対応
- Multi-stage build でイメージサイズ最適化
- Non-root ユーザーでセキュア実行

## 5. バックエンドとの接続

### CORS設定確認
バックエンド側で以下を設定済み：
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.up.railway.app"
]
```

### API接続テスト
デプロイ後に以下のエンドポイントで接続を確認：
```bash
# ヘルスチェック
curl https://your-frontend-domain.up.railway.app/

# APIプロキシテスト
curl https://your-frontend-domain.up.railway.app/api/v1/analytics/health/
```

## 6. デプロイ手順

### ステップ1: GitHubリポジトリ準備
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### ステップ2: Railway設定
1. Railwayダッシュボードでプロジェクト作成
2. GitHub接続設定
3. 環境変数設定
4. デプロイ実行

### ステップ3: カスタムドメイン設定（オプション）
1. Railway ダッシュボードの「Settings」→「Custom Domain」
2. カスタムドメインを追加
3. DNS レコードを設定
4. バックエンドのCORS設定を更新

## 7. モニタリング

### ログ確認
```bash
# Railway CLI でログ確認
railway logs

# 特定期間のログ
railway logs --tail 100
```

### パフォーマンス監視
- Railway ダッシュボードでメトリクス確認
- CPU/メモリ使用量監視
- レスポンス時間監視

## 8. トラブルシューティング

### よくある問題

1. **TypeScriptビルドエラー**
   - 解決済み: `npm ci` で全依存関係をインストール
   - TypeScriptがdevDependenciesから利用可能

2. **API接続エラー**
   - `NEXT_PUBLIC_API_URL` 環境変数を確認
   - バックエンドのCORS設定を確認
   - ネットワーク設定を確認

3. **静的ファイル404エラー**
   - `next.config.ts` の設定を確認
   - Dockerfileのファイルコピー設定を確認

4. **メモリ不足エラー**
   - Railway プランのリソース制限を確認
   - Next.js ビルド時のメモリ使用量を最適化

### ログ確認ポイント
```bash
# ビルドログ確認
railway logs --deployment [deployment-id]

# ランタイムエラー確認
railway logs --tail 50
```

## 9. 最適化

### パフォーマンス向上
- 画像最適化設定
- Bundle分析と最適化
- CDN設定（Railway Pro）

### セキュリティ強化
- CSP設定
- セキュリティヘッダー追加
- HTTPS強制

## 10. スケーリング

### 水平スケーリング
- Railway Pro でレプリカ数増加
- ロードバランサー設定

### 垂直スケーリング
- CPUとメモリ設定の調整
- 最適なプラン選択