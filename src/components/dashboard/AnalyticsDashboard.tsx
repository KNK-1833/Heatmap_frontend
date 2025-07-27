'use client';

import React, { useState, useEffect } from 'react';
import { useArticles } from '@/hooks/useArticles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeatmapViewer } from '@/components/heatmap/HeatmapViewer';
import { ExitAnalysisPanel } from './ExitAnalysisPanel';
import { EngagementMetrics } from './EngagementMetrics';
import { ArticleSelector } from './ArticleSelector';
import { ArticlePreview } from '@/components/article/ArticlePreview';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('066c8bb6-660a-47ec-87b9-d8aac8b893aa');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date(),
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [scrollData, setScrollData] = useState([]);

  // Get articles for the preview
  const { articles } = useArticles();
  const selectedArticle = articles?.find(article => article.id === selectedArticleId);

  // Fetch scroll depth data
  useEffect(() => {
    const fetchScrollData = async () => {
      if (!selectedArticleId) return;
      
      try {
        // Import the API client
        const { apiClient } = await import('@/lib/api');
        
        const params = {
          article_id: selectedArticleId,
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
        };
        
        const response = await apiClient.get('/analytics/scroll-depth/', { params });
        
        if (response.data && response.data.success) {
          setScrollData(response.data.data.session_depths || []);
        }
      } catch (error) {
        console.error('Failed to fetch scroll data:', error);
      }
    };
    
    fetchScrollData();
  }, [selectedArticleId, dateRange, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportReport = () => {
    // Implementation for exporting comprehensive analytics report
    console.log('Exporting analytics report...');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive analysis of user behavior and engagement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Article Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleSelector
              selectedArticleId={selectedArticleId}
              onArticleSelect={setSelectedArticleId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DateRangePicker
              value={dateRange}
              onChange={(range: { from: Date; to: Date }) => {
                setDateRange(range);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      {selectedArticleId ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preview">Article Preview</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="exit-analysis">Exit Analysis</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <EngagementMetrics
                    articleId={selectedArticleId}
                    dateRange={dateRange}
                    refreshKey={refreshKey}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    Live activity feed will be implemented here
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mini Heatmap Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Heatmap Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl">
                  <HeatmapViewer
                    articleId={selectedArticleId}
                    width={600}
                    height={400}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Article Preview Tab */}
          <TabsContent value="preview">
            {selectedArticle && (
              <ArticlePreview
                article={selectedArticle}
                scrollData={scrollData.map(depth => ({
                  scroll_position: depth * 10, // Convert percentage to pixel estimate
                  max_scroll: 1000, // Approximate content height
                  timestamp: new Date().toISOString(), // Placeholder
                  session_id: `session_${Math.random()}`
                }))}
                showScrollHeatmap={true}
              />
            )}
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap">
            <HeatmapViewer
              articleId={selectedArticleId}
              width={1200}
              height={800}
            />
          </TabsContent>

          {/* Exit Analysis Tab */}
          <TabsContent value="exit-analysis">
            <ExitAnalysisPanel
              articleId={selectedArticleId}
              dateRange={dateRange}
              refreshKey={refreshKey}
            />
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <EngagementMetrics
              articleId={selectedArticleId}
              dateRange={dateRange}
              refreshKey={refreshKey}
              compact={false}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">
                Select an Article to Begin Analysis
              </div>
              <p className="text-sm">
                Choose an article from the dropdown above to view detailed analytics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};