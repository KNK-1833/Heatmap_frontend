import { useState, useEffect, useCallback } from 'react';
import { heatmapAPI, aiAPI } from '@/lib/api';
import type { HeatmapData, EngagementMetrics, SectionAnalysis, TimeSeriesData, AIAnalysis } from '@/types';

interface UseHeatmapOptions {
  articleId: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'scroll' | 'click' | 'dwell' | 'exit';
  autoFetch?: boolean;
}

export function useHeatmap(options: UseHeatmapOptions) {
  const { articleId, dateFrom, dateTo, type, autoFetch = true } = options;
  
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeatmapData = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await heatmapAPI.getHeatmapData(articleId, {
        date_from: dateFrom,
        date_to: dateTo,
        type,
      });
      setHeatmapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch heatmap data');
    } finally {
      setLoading(false);
    }
  }, [articleId, dateFrom, dateTo, type]);

  useEffect(() => {
    if (autoFetch && articleId) {
      fetchHeatmapData();
    }
  }, [autoFetch, articleId, fetchHeatmapData]);

  const refetch = () => {
    fetchHeatmapData();
  };

  return {
    heatmapData,
    loading,
    error,
    refetch,
  };
}

export function useAnalytics(articleId: string | null) {
  const [analyticsData, setAnalyticsData] = useState<{
    engagement_metrics: EngagementMetrics;
    section_analysis: SectionAnalysis[];
    time_series: TimeSeriesData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await heatmapAPI.getAnalytics(articleId);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refetch = () => {
    fetchAnalytics();
  };

  return {
    analyticsData,
    loading,
    error,
    refetch,
  };
}

export function useAIAnalysis(articleId: string | null) {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysisHistory = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await aiAPI.getAnalysisHistory(articleId);
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis history');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchAnalysisHistory();
  }, [fetchAnalysisHistory]);

  const requestAnalysis = async (data: {
    analysis_type: string;
    date_range?: {
      from: string;
      to: string;
    };
    options?: {
      include_recommendations?: boolean;
      focus_areas?: string[];
    };
  }) => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiAPI.requestAnalysis(articleId, data);
      
      // Poll for completion
      const pollForResult = async (analysisId: string) => {
        let attempts = 0;
        const maxAttempts = 30; // 30 attempts with 2-second intervals = 1 minute max
        
        const poll = async (): Promise<AIAnalysis> => {
          attempts++;
          
          try {
            const analysis = await aiAPI.getAnalysisResult(articleId, analysisId);
            
            if (analysis.status === 'completed') {
              return analysis;
            } else if (analysis.status === 'failed') {
              throw new Error('Analysis failed');
            } else if (attempts >= maxAttempts) {
              throw new Error('Analysis timeout');
            }
            
            // Wait 2 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 2000));
            return poll();
          } catch (err) {
            if (attempts >= maxAttempts) {
              throw new Error('Analysis timeout');
            }
            throw err;
          }
        };
        
        return poll();
      };
      
      const completedAnalysis = await pollForResult(result.analysis_id);
      setCurrentAnalysis(completedAnalysis);
      setAnalyses(prev => [completedAnalysis, ...prev]);
      
      return completedAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request analysis';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisResult = async (analysisId: string) => {
    if (!articleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await aiAPI.getAnalysisResult(articleId, analysisId);
      setCurrentAnalysis(analysis);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get analysis result');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAnalysisHistory();
  };

  return {
    analyses,
    currentAnalysis,
    loading,
    error,
    requestAnalysis,
    getAnalysisResult,
    refetch,
  };
}

// Real-time heatmap updates hook
export function useRealtimeHeatmap(articleId: string | null) {
  const [realtimeData, setRealtimeData] = useState<{
    current_active_readers: number;
    last_minute_views: number;
    avg_scroll_depth: number;
  } | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!articleId) return;

    // WebSocket connection for real-time updates
    const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/ws/analytics/${articleId}`;
    const token = localStorage.getItem('access_token');
    
    if (!token) return;

    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'real_time_stats') {
          setRealtimeData(data.data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [articleId]);

  return {
    realtimeData,
    connected,
  };
}