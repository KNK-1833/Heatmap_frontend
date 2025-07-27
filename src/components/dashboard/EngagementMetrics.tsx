'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MousePointer, 
  Eye, 
  TrendingUp, 
  Target,
  Activity,
  BarChart3
} from 'lucide-react';

interface EngagementMetricsProps {
  articleId: string;
  dateRange: { from: Date; to: Date };
  refreshKey: number;
  compact?: boolean;
  className?: string;
}

interface EngagementData {
  article_id: string;
  article_title: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  overview: {
    total_sessions: number;
    total_clicks: number;
    total_exits: number;
    engagement_score: number;
    bounce_rate: number;
  };
  reading_metrics: {
    average_reading_time: number;
    max_reading_time: number;
    min_reading_time: number;
    average_scroll_depth: number;
    max_scroll_depth: number;
  };
  interaction_metrics: {
    average_clicks_per_session: number;
    max_clicks_per_session: number;
    click_through_rate: number;
  };
  exit_metrics: {
    average_time_on_page: number;
    average_final_scroll_position: number;
    exit_intent_rate: number;
    exit_intent_count: number;
  };
  daily_trends: Array<{
    day: string;
    sessions: number;
  }>;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = ({
  articleId,
  dateRange,
  refreshKey,
  compact = false,
  className = '',
}) => {
  const [data, setData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagementData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import the API client
      const { apiClient } = await import('@/lib/api');

      const params = {
        article_id: articleId,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      };

      console.log('Fetching engagement metrics with params:', params);
      const response = await apiClient.get('/analytics/engagement-metrics/', { params });
      console.log('Response:', response.data);
      
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch engagement data:', err);
      setError(`Failed to load engagement metrics: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [articleId, dateRange]);

  useEffect(() => {
    if (articleId) {
      fetchEngagementData();
    }
  }, [articleId, refreshKey, fetchEngagementData]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-24 w-full" />
        {!compact && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(data.reading_metrics.average_reading_time)}s
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Avg Reading Time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(data.reading_metrics.average_scroll_depth)}%
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Avg Scroll Depth
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(data.overview.engagement_score)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Activity className="h-3 w-3" />
                Engagement Score
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(data.overview.bounce_rate)}%
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Bounce Rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!compact && (
        <>
          {/* Daily Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Daily Session Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.daily_trends.map((trend, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{trend.day}</span>
                      <Badge variant="outline">
                        {trend.sessions} sessions
                      </Badge>
                    </div>
                    <Progress 
                      value={(trend.sessions / Math.max(...data.daily_trends.map(t => t.sessions))) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interaction and Exit Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Interaction Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Clicks per Session</span>
                    <Badge variant="outline">
                      {data.interaction_metrics.average_clicks_per_session.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Max Clicks per Session</span>
                    <Badge variant="outline">
                      {data.interaction_metrics.max_clicks_per_session}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Click-through Rate</span>
                    <Badge variant="outline">
                      {data.interaction_metrics.click_through_rate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exit Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Time on Page</span>
                    <Badge variant="outline">
                      {Math.round(data.exit_metrics.average_time_on_page)}s
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Exit Intent Rate</span>
                    <Badge variant="outline">
                      {data.exit_metrics.exit_intent_rate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Exit Intent Count</span>
                    <Badge variant="outline">
                      {data.exit_metrics.exit_intent_count}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Overview Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{data.overview.total_sessions}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{data.overview.total_clicks}</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{data.overview.total_exits}</div>
                  <div className="text-sm text-gray-600">Total Exits</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {data.reading_metrics.max_reading_time}s
                  </div>
                  <div className="text-sm text-gray-600">Max Reading Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};