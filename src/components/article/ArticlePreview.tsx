'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Clock, 
  TrendingDown,
  AlertCircle 
} from 'lucide-react';
import { Article } from '@/types';

interface ReadingProgress {
  depth: number;
  section: string;
  timestamp: Date;
  session_id: string;
}

interface ArticlePreviewProps {
  article: Article;
  readingData?: ReadingProgress[];
  scrollData?: Array<{
    scroll_position: number;
    max_scroll: number;
    timestamp: string;
    session_id: string;
  }>;
  className?: string;
  showScrollHeatmap?: boolean;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  article,
  readingData = [],
  scrollData = [],
  className = '',
  showScrollHeatmap = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scrollDepths, setScrollDepths] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate scroll depth distribution
  useEffect(() => {
    if (scrollData.length > 0 && contentRef.current) {
      const depths = scrollData.map(data => 
        Math.round((data.scroll_position / data.max_scroll) * 100)
      );
      setScrollDepths(depths);
    }
  }, [scrollData]);

  // Get scroll depth color intensity
  const getScrollDepthColor = (position: number): string => {
    if (!showScrollHeatmap || scrollDepths.length === 0) return 'transparent';
    
    const totalHeight = contentRef.current?.scrollHeight || 1;
    const relativePosition = Math.round((position / totalHeight) * 100);
    
    // Count how many users reached this depth
    const usersAtDepth = scrollDepths.filter(depth => depth >= relativePosition).length;
    const maxUsers = scrollDepths.length;
    const intensity = usersAtDepth / maxUsers;
    
    if (intensity > 0.8) return 'rgba(239, 68, 68, 0.3)'; // High intensity - red
    if (intensity > 0.6) return 'rgba(245, 101, 101, 0.25)'; 
    if (intensity > 0.4) return 'rgba(251, 146, 60, 0.2)'; // Medium - orange
    if (intensity > 0.2) return 'rgba(250, 204, 21, 0.15)'; // Low - yellow
    if (intensity > 0) return 'rgba(34, 197, 94, 0.1)'; // Very low - green
    
    return 'transparent';
  };

  // Sample article content (in real implementation, this would come from props)
  const renderArticleContent = () => {
    const paragraphs = [
      "この記事では、ヒートマップ分析ツールの実装について詳しく解説します。ユーザーの行動パターンを理解することで、より効果的なコンテンツ戦略を立てることができます。",
      "まず、ヒートマップとは何かから始めましょう。ヒートマップは、ウェブページ上でのユーザーの行動を視覚的に表現したものです。クリック位置、スクロール深度、滞在時間などの情報を色で表現します。",
      "実装において重要なのは、適切なデータ収集とプライバシーの保護です。GDPR等の規制に準拠しながら、ユーザーの同意を得た上でデータを収集する必要があります。",
      "Next.jsとDjangoを使用したフルスタック構成では、フロントエンドでのトラッキング、バックエンドでのデータ処理、PostgreSQLでのデータ保存という流れになります。",
      "リアルタイム分析機能により、管理者は即座にユーザーの行動変化を把握できます。これにより、コンテンツの改善点を素早く特定することが可能になります。",
      "機械学習アルゴリズムを活用することで、離脱予測や最適化提案といった高度な分析も実現できます。Claude APIとの連携により、自然言語での分析レポート生成も可能です。",
      "パフォーマンス最適化も重要な要素です。大量のトラッキングデータを効率的に処理するため、Redisキャッシュやデータベースインデックスの適切な設計が必要です。",
      "セキュリティ面では、APIの認証・認可、データの暗号化、定期的なセキュリティ監査が欠かせません。特に個人情報を扱う場合は、厳格な管理体制が求められます。"
    ];

    return paragraphs.map((paragraph, index) => (
      <div 
        key={index}
        className="relative mb-6 p-4 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: getScrollDepthColor(index * 100),
          border: getScrollDepthColor(index * 100) !== 'transparent' ? '1px solid rgba(59, 130, 246, 0.2)' : 'none'
        }}
      >
        <p className="text-gray-700 leading-relaxed">
          {paragraph}
        </p>
        {showScrollHeatmap && (
          <div className="absolute right-2 top-2">
            <Badge variant="outline" className="text-xs">
              {Math.round((scrollDepths.filter(d => d >= (index * 12.5)).length / Math.max(scrollDepths.length, 1)) * 100)}%
            </Badge>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                {article.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(article.created_at).toLocaleDateString()}
                </div>
                <Badge variant="outline">
                  {article.status}
                </Badge>
              </div>
            </div>
            {showScrollHeatmap && (
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>Scroll Heatmap</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span className="text-xs">Low</span>
                  <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Reading Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scrollDepths.length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Total Readers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scrollDepths.length > 0 ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length) : 0}%
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Avg Scroll Depth
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {scrollDepths.filter(d => d >= 75).length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Deep Readers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {scrollDepths.filter(d => d < 25).length}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Early Exits
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Content with Scroll Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Article Content Preview</span>
            {showScrollHeatmap && (
              <Badge variant="secondary" className="text-xs">
                Heatmap: {scrollDepths.length} sessions analyzed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              ref={contentRef}
              className="max-h-96 overflow-y-auto prose prose-sm max-w-none"
            >
              <h1 className="text-xl font-bold mb-4">{article.title}</h1>
              {article.meta_description && (
                <p className="text-gray-600 italic mb-6">{article.meta_description}</p>
              )}
              {renderArticleContent()}
            </div>
            
            {/* Scroll Progress Indicator */}
            {showScrollHeatmap && (
              <div className="absolute right-0 top-0 w-2 h-full bg-gray-100 rounded">
                {[...Array(10)].map((_, index) => {
                  const depth = (index + 1) * 10;
                  const readersAtDepth = scrollDepths.filter(d => d >= depth).length;
                  const intensity = readersAtDepth / Math.max(scrollDepths.length, 1);
                  
                  return (
                    <div
                      key={index}
                      className="absolute w-full rounded"
                      style={{
                        top: `${index * 10}%`,
                        height: '10%',
                        backgroundColor: intensity > 0.5 ? '#ef4444' : 
                                       intensity > 0.3 ? '#f97316' :
                                       intensity > 0.1 ? '#eab308' : '#22c55e',
                        opacity: Math.max(intensity, 0.1)
                      }}
                      title={`${depth}%: ${readersAtDepth} readers (${Math.round(intensity * 100)}%)`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reading Depth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Depth Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { range: "0-25%", label: "Header/Introduction", count: scrollDepths.filter(d => d >= 0 && d < 25).length },
              { range: "25-50%", label: "Early Content", count: scrollDepths.filter(d => d >= 25 && d < 50).length },
              { range: "50-75%", label: "Middle Content", count: scrollDepths.filter(d => d >= 50 && d < 75).length },
              { range: "75-100%", label: "Complete Reading", count: scrollDepths.filter(d => d >= 75).length },
            ].map((section, index) => {
              const percentage = scrollDepths.length > 0 ? (section.count / scrollDepths.length) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{section.label} ({section.range})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{section.count} readers</span>
                      <Badge variant="outline">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};