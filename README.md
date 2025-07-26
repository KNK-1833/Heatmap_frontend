# ブログヒートマップ分析システム - Frontend

Next.js 15 + TypeScript + Tailwind CSSで構築されたダッシュボード

## 機能概要

- **ダッシュボード**: 4つのタブで包括的な分析表示
- **記事プレビュー**: スクロール深度ヒートマップ付きコンテンツ表示
- **ヒートマップ可視化**: Canvas APIを使用したクリック位置の可視化
- **エンゲージメント分析**: 読書時間、スクロール深度、離脱率等の分析
- **離脱分析**: AI による離脱原因の分析とインサイト
- **リアルタイム表示**: WebSocketによるリアルタイムデータ更新

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Chart.js / Recharts
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Deployment**: Vercel

## 主要コンポーネント

### ダッシュボード
- `AnalyticsDashboard`: メインダッシュボード
- `ArticleSelector`: 記事選択UI
- `EngagementMetrics`: エンゲージメント指標表示

### ヒートマップ
- `HeatmapViewer`: ヒートマップ表示とコントロール
- `HeatmapCanvas`: Canvas描画コンポーネント
- `HeatmapControls`: 設定コントロール

### 記事プレビュー
- `ArticlePreview`: 記事コンテンツとスクロール深度表示
- スクロール位置別の読者到達率可視化

## 環境変数

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:3001
```

## 開発環境起動

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## ビルドとデプロイ

```bash
# 本番ビルド
npm run build

# ビルド結果の確認
npm start
```

## Vercel デプロイ

1. Vercel プロジェクト作成
2. GitHub リポジトリ連携
3. 環境変数設定
4. 自動デプロイ

## 主要機能

### 1. Overview タブ
- クイックメトリクス表示
- ヒートマッププレビュー
- 最近のアクティビティ

### 2. Article Preview タブ
- 記事コンテンツ表示
- スクロール深度ヒートマップ
- セクション別読者到達率

### 3. Heatmap タブ
- フルサイズヒートマップ表示
- インタラクティブコントロール
- データエクスポート機能

### 4. Exit Analysis タブ
- 離脱ポイント分析
- AI による離脱原因の分析
- 改善提案表示

### 5. Engagement タブ
- 詳細エンゲージメント指標
- 日別トレンド表示
- インタラクション分析

## ライセンス

MIT License
