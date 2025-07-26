# Vercel デプロイメントガイド

## 1. Vercel プロジェクト作成

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」をクリック
3. GitHub から `KNK-1833/Heatmap_frontend` リポジトリを選択
4. 「Import」をクリック

## 2. 環境変数設定

Vercel ダッシュボードの「Settings」→「Environment Variables」で以下を設定:

### 本番環境用
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app/api/v1
NODE_ENV=production
```

### 開発環境用
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NODE_ENV=development
```

## 3. ビルド設定

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "regions": ["nrt1"],
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 自動デプロイ設定
- main ブランチへのプッシュで本番デプロイ
- その他のブランチでプレビューデプロイ

## 4. カスタムドメイン設定（オプション）

1. Vercel ダッシュボードの「Settings」→「Domains」
2. カスタムドメインを追加
3. DNS レコードを設定

## 5. パフォーマンス最適化

### Next.js設定
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['chart.js'],
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## 6. 分析とモニタリング

### Vercel Analytics
1. Vercel ダッシュボードの「Analytics」タブ
2. 「Enable Analytics」をクリック
3. パフォーマンスメトリクスを確認

### Web Vitals
- Core Web Vitals の自動測定
- Real User Monitoring (RUM)

## 7. デプロイ確認手順

### 1. ローカルビルドテスト
```bash
npm run build
npm start
```

### 2. デプロイ後確認項目
- [ ] ページが正常に表示される
- [ ] API 接続が動作する
- [ ] ヒートマップが表示される
- [ ] エラーコンソールにエラーがない
- [ ] パフォーマンススコアが良好

## 8. 環境別設定

### 本番環境 (Production)
- HTTPS 強制
- セキュリティヘッダー設定
- 圧縮とキャッシュ最適化

### プレビュー環境 (Preview)
- 機能テスト用
- Basic認証（必要に応じて）

### 開発環境 (Development)
- Hot Reload
- 詳細なエラー表示
- デバッグツール

## トラブルシューティング

### よくある問題

1. **API 接続エラー**
   - `NEXT_PUBLIC_API_URL` の設定を確認
   - CORS設定がバックエンドで正しく設定されているか確認

2. **ビルドエラー**
   - TypeScript エラーを確認
   - 依存関係の競合を確認

3. **静的ファイルが見つからない**
   - `public/` ディレクトリのファイル配置を確認
   - Next.js のファイルルーティングを確認

4. **パフォーマンス問題**
   - Bundle Analyzer でバンドルサイズを確認
   - 画像最適化設定を確認
   - 不要なライブラリの削除

### ログ確認
```bash
# Vercel CLI でログ確認
vercel logs [deployment-url]
```

## デプロイフロー

1. **開発** → git push → **プレビューデプロイ**
2. **レビュー** → merge to main → **本番デプロイ**
3. **モニタリング** → パフォーマンス確認