// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_active_until?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Article Types
export interface Article {
  id: string;
  title: string;
  content: string;
  content_html: string;
  content_structure: ContentStructure;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  stats?: ArticleStats;
}

export interface ContentStructure {
  sections: ContentSection[];
}

export interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'code';
  level?: number;
  text: string;
  start_position: number;
  end_position: number;
  word_count?: number;
}

export interface ArticleStats {
  total_views: number;
  avg_reading_time: number;
  exit_rate: number;
  unique_sessions: number;
  bounce_rate: number;
}

// Heatmap Data Types
export interface HeatmapData {
  scroll_heatmap: ScrollHeatmapPoint[];
  click_heatmap: ClickHeatmapPoint[];
  exit_points: ExitPoint[];
  summary: HeatmapSummary;
}

export interface ScrollHeatmapPoint {
  position: number;
  reach_rate: number;
  session_count: number;
}

export interface ClickHeatmapPoint {
  x: number;
  y: number;
  click_count: number;
  element_info: {
    tag: string;
    text: string;
    href?: string;
    id?: string;
    class?: string;
  };
}

export interface ExitPoint {
  section_id: string;
  exit_rate: number;
  exit_count: number;
  avg_time_before_exit: number;
}

export interface HeatmapSummary {
  total_sessions: number;
  avg_scroll_depth: number;
  avg_reading_time: number;
  overall_exit_rate: number;
}

// Analytics Types
export interface EngagementMetrics {
  total_views: number;
  unique_sessions: number;
  avg_reading_time: number;
  bounce_rate: number;
  scroll_depth_distribution: {
    '0-25%': number;
    '25-50%': number;
    '50-75%': number;
    '75-100%': number;
  };
}

export interface SectionAnalysis {
  section_id: string;
  section_title: string;
  avg_dwell_time: number;
  exit_rate: number;
  engagement_score: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  avg_reading_time: number;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  analysis_type: string;
  confidence_score: number;
  recommendations: string;
  results: AIAnalysisResults;
  created_at: string;
}

export interface AIAnalysisResults {
  engagement_score: number;
  key_insights: KeyInsight[];
  optimization_suggestions: OptimizationSuggestion[];
  content_flow_analysis?: ContentFlowAnalysis;
  benchmark_comparison?: BenchmarkComparison;
  predictions?: PerformancePredictions;
}

export interface KeyInsight {
  type: string;
  section_id?: string;
  severity: 'low' | 'medium' | 'high';
  metric_value: number;
  description: string;
  impact_assessment?: string;
}

export interface OptimizationSuggestion {
  priority: '低' | '中' | '高';
  target_section: string;
  issue: string;
  recommendation: {
    action: string;
    description: string;
    specific_changes: string[];
    expected_impact: {
      exit_rate_reduction?: string;
      engagement_increase?: string;
      avg_reading_time_increase?: string;
    };
  };
}

export interface ContentFlowAnalysis {
  flow_score: number;
  bottlenecks: {
    location: string;
    description: string;
  }[];
  recommendations: string[];
}

export interface BenchmarkComparison {
  industry: string;
  comparison_metrics: {
    [key: string]: {
      your_article: number;
      industry_avg: number;
      percentile: number;
    };
  };
}

export interface PerformancePredictions {
  if_recommendations_applied: {
    expected_engagement_score: number;
    expected_exit_rate: number;
    expected_reading_time: number;
    confidence: number;
  };
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      field_errors?: string[];
    };
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Subscription Types
export interface Subscription {
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: {
    name: string;
    price: number;
    currency: string;
  };
}

// Dashboard Types
export interface DashboardData {
  articles_count: number;
  total_views: number;
  avg_engagement: number;
  recent_articles: Article[];
  performance_trends: TimeSeriesData[];
}

// Chart Types for visualization
export interface ChartDataPoint {
  x: number;
  y: number;
  value?: number;
  label?: string;
}

export interface HeatmapConfig {
  width: number;
  height: number;
  opacity: number;
  radius: number;
  blur: number;
  gradient: {
    [key: string]: string;
  };
}