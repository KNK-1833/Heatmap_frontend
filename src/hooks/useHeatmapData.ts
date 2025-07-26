'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClickLog } from '@/types';
import { apiClient } from '@/lib/api';

interface UseHeatmapDataProps {
  articleId: string;
  dateRange: string;
  limit?: number;
}

interface UseHeatmapDataReturn {
  clickData: ClickLog[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useHeatmapData = ({
  articleId,
  dateRange,
  limit = 1000,
}: UseHeatmapDataProps): UseHeatmapDataReturn => {
  const [clickData, setClickData] = useState<ClickLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range parameters
      const dateParams = getDateRangeParams(dateRange);
      
      // Fetch click data from API
      const response = await apiClient.get(`/analytics/click-logs/`, {
        params: {
          article: articleId,
          limit,
          ...dateParams,
        },
      });

      setClickData(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [articleId, dateRange, limit]);

  const refetch = useCallback(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  return {
    clickData,
    loading,
    error,
    refetch,
  };
};

// Helper function to convert date range to API parameters
function getDateRangeParams(dateRange: string) {
  const now = new Date();
  const params: { start_date?: string; end_date?: string } = {};

  switch (dateRange) {
    case 'today':
      params.start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      break;
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      params.start_date = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      params.end_date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      break;
    
    case 'last7days':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      params.start_date = sevenDaysAgo.toISOString();
      break;
    
    case 'last30days':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.start_date = thirtyDaysAgo.toISOString();
      break;
    
    case 'thisMonth':
      params.start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      break;
    
    case 'lastMonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      params.start_date = lastMonth.toISOString();
      params.end_date = lastMonthEnd.toISOString();
      break;
    
    default:
      // Default to last 7 days
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 7);
      params.start_date = defaultStart.toISOString();
  }

  return params;
}