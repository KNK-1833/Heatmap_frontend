'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  AlertTriangle, 
  Clock, 
  MousePointer, 
  TrendingDown,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ExitAnalysisPanelProps {
  articleId: string;
  dateRange: { from: Date; to: Date };
  refreshKey: number;
  className?: string;
}

interface ExitAnalysisData {
  total_exits: number;
  exit_types: Array<{
    exit_type: string;
    count: number;
    avg_time_on_page: number;
  }>;
  exit_intent_detection_rate: number;
  avg_time_to_exit_intent: number;
  top_exit_sections: Array<{
    section_id: string;
    count: number;
    avg_time_in_section: number;
  }>;
}

interface ExitFunnelData {
  total_sessions: number;
  funnel_steps: Array<{
    step: string;
    sessions_reached: number;
    exits: number;
    retention_rate: number;
    exit_rate: number;
    conversion_rate: number;
  }>;
  overall_completion_rate: number;
}

interface Recommendation {
  type: string;
  priority: string;
  section?: string;
  issue: string;
  recommendation: string;
}

export const ExitAnalysisPanel: React.FC<ExitAnalysisPanelProps> = ({
  articleId,
  dateRange,
  refreshKey,
  className = '',
}) => {
  const [overviewData, setOverviewData] = useState<ExitAnalysisData | null>(null);
  const [funnelData, setFunnelData] = useState<ExitFunnelData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExitAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        article_id: articleId,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      };

      // Fetch overview data
      const overviewResponse = await apiClient.get('/analytics/exit-analysis/overview/', { params });
      setOverviewData(overviewResponse.data);

      // Fetch funnel data
      const funnelResponse = await apiClient.get('/analytics/exit-analysis/exit_funnel/', { params });
      setFunnelData(funnelResponse.data);

      // Fetch recommendations
      const recommendationsResponse = await apiClient.get('/analytics/exit-analysis/recommendations/', { params });
      setRecommendations(recommendationsResponse.data.recommendations || []);

    } catch (err) {
      console.error('Failed to fetch exit analysis:', err);
      setError('Failed to load exit analysis data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchExitAnalysis();
    }
  }, [articleId, dateRange, refreshKey]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Exit Rate Analysis
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchExitAnalysis}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overviewData.total_exits}
                </div>
                <p className="text-sm text-gray-600">Total Exits</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(overviewData.exit_intent_detection_rate)}%
                </div>
                <p className="text-sm text-gray-600">Exit Intent Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {overviewData.avg_time_to_exit_intent ? 
                    Math.round(overviewData.avg_time_to_exit_intent / 1000) : 0}s
                </div>
                <p className="text-sm text-gray-600">Avg Time to Exit Intent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overviewData.top_exit_sections.length}
                </div>
                <p className="text-sm text-gray-600">Exit Sections</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Exit Funnel</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overviewData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exit Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Exit Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overviewData.exit_types.map((exitType, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {exitType.exit_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm">{exitType.count} exits</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(exitType.avg_time_on_page / 1000)}s avg
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Exit Sections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Top Exit Sections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overviewData.top_exit_sections.slice(0, 5).map((section, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {section.section_id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {section.count} exits
                          </span>
                        </div>
                        <Progress 
                          value={(section.count / overviewData.total_exits) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Avg time: {Math.round((section.avg_time_in_section || 0) / 1000)}s
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Exit Funnel Tab */}
        <TabsContent value="funnel">
          {funnelData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exit Funnel Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Total Sessions: {funnelData.total_sessions} | 
                    Completion Rate: {Math.round(funnelData.overall_completion_rate)}%
                  </div>
                  
                  {funnelData.funnel_steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{step.step}</h4>
                        <Badge variant={step.exit_rate > 50 ? 'destructive' : 'default'}>
                          {Math.round(step.exit_rate)}% exit rate
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Sessions Reached</div>
                          <div className="font-medium">{step.sessions_reached}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Exits</div>
                          <div className="font-medium text-red-600">{step.exits}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Retention Rate</div>
                          <div className="font-medium text-green-600">
                            {Math.round(step.retention_rate)}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={step.retention_rate} 
                        className="mt-2 h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          {overviewData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Section-by-Section Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData.top_exit_sections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{section.section_id}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {Math.round((section.count / overviewData.total_exits) * 100)}%
                          </Badge>
                          <Badge variant={section.count > 10 ? 'destructive' : 'default'}>
                            {section.count} exits
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Average Time in Section</div>
                          <div className="font-medium">
                            {Math.round((section.avg_time_in_section || 0) / 1000)}s
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Exit Percentage</div>
                          <div className="font-medium">
                            {Math.round((section.count / overviewData.total_exits) * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={(section.count / overviewData.total_exits) * 100} 
                        className="mt-2 h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : 
                                   rec.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline">{rec.type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-red-600">Issue: </span>
                          {rec.issue}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Recommendation: </span>
                          {rec.recommendation}
                        </div>
                        {rec.section && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Section: </span>
                            {rec.section}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No specific recommendations available</p>
                  <p className="text-sm">Exit patterns look normal for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};