import axios, { AxiosError, AxiosResponse } from 'axios';
import type { 
  APIResponse, 
  APIError, 
  User, 
  AuthResponse, 
  Article,
  HeatmapData,
  AIAnalysis,
  EngagementMetrics,
  SectionAnalysis,
  TimeSeriesData,
  Subscription,
  DashboardData,
  PaginatedResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Axios instance configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${access_token}`;
            return api.request(error.config);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<APIResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data!;
  }
  throw new Error(response.data.message || 'API request failed');
};

// Helper function to handle API errors
const handleError = (error: AxiosError<APIError>): never => {
  if (error.response?.data) {
    throw new Error(error.response.data.error.message);
  }
  throw new Error(error.message || 'Network error occurred');
};

// Authentication API
export const authAPI = {
  register: async (email: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<APIResponse<AuthResponse>>('/auth/register', {
        email,
        password,
        confirm_password: confirmPassword,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<APIResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      });
      const authData = handleResponse(response);
      
      // Store tokens
      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('refresh_token', authData.refresh_token);
      
      return authData;
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<APIResponse<User>>('/auth/me');
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// Articles API
export const articlesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    published?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Article>> => {
    try {
      const response = await api.get<APIResponse<PaginatedResponse<Article>>>('/articles', {
        params,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  getById: async (id: string): Promise<Article> => {
    try {
      const response = await api.get<APIResponse<Article>>(`/articles/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  create: async (data: {
    title: string;
    content: string;
    slug: string;
    is_published: boolean;
  }): Promise<Article> => {
    try {
      const response = await api.post<APIResponse<Article>>('/articles', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  update: async (id: string, data: Partial<Article>): Promise<Article> => {
    try {
      const response = await api.put<APIResponse<Article>>(`/articles/${id}`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/articles/${id}`);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// Heatmap API
export const heatmapAPI = {
  getHeatmapData: async (
    articleId: string,
    params?: {
      date_from?: string;
      date_to?: string;
      type?: 'scroll' | 'click' | 'dwell' | 'exit';
    }
  ): Promise<HeatmapData> => {
    try {
      const response = await api.get<APIResponse<HeatmapData>>(
        `/articles/${articleId}/heatmap`,
        { params }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  getAnalytics: async (articleId: string): Promise<{
    engagement_metrics: EngagementMetrics;
    section_analysis: SectionAnalysis[];
    time_series: TimeSeriesData[];
  }> => {
    try {
      const response = await api.get<APIResponse<{
        engagement_metrics: EngagementMetrics;
        section_analysis: SectionAnalysis[];
        time_series: TimeSeriesData[];
      }>>(`/articles/${articleId}/analytics`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// AI Analysis API
export const aiAPI = {
  requestAnalysis: async (
    articleId: string,
    data: {
      analysis_type: string;
      date_range?: {
        from: string;
        to: string;
      };
      options?: {
        include_recommendations?: boolean;
        focus_areas?: string[];
      };
    }
  ): Promise<{ analysis_id: string; status: string; estimated_completion: string }> => {
    try {
      const response = await api.post<APIResponse<{
        analysis_id: string;
        status: string;
        estimated_completion: string;
      }>>(`/articles/${articleId}/ai-analysis`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  getAnalysisResult: async (articleId: string, analysisId: string): Promise<AIAnalysis> => {
    try {
      const response = await api.get<APIResponse<AIAnalysis>>(
        `/articles/${articleId}/ai-analysis/${analysisId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  getAnalysisHistory: async (articleId: string): Promise<AIAnalysis[]> => {
    try {
      const response = await api.get<APIResponse<AIAnalysis[]>>(
        `/articles/${articleId}/ai-analysis`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// Billing API
export const billingAPI = {
  createCheckoutSession: async (data: {
    price_id: string;
    success_url: string;
    cancel_url: string;
  }): Promise<{ checkout_url: string; session_id: string }> => {
    try {
      const response = await api.post<APIResponse<{
        checkout_url: string;
        session_id: string;
      }>>('/billing/create-checkout-session', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  getSubscription: async (): Promise<Subscription> => {
    try {
      const response = await api.get<APIResponse<Subscription>>('/billing/subscription');
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  cancelSubscription: async (): Promise<void> => {
    try {
      await api.post('/billing/cancel-subscription');
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await api.get<APIResponse<DashboardData>>('/dashboard');
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// Tracking API (for testing purposes)
export const trackingAPI = {
  sendReadingLog: async (data: {
    article_id: string;
    session_id: string;
    scroll_depth_percent: number;
    max_scroll_depth: number;
    total_reading_time_seconds: number;
    viewport_info: object;
    user_agent: string;
    referrer?: string;
  }): Promise<{ log_id: string; received_at: string }> => {
    try {
      const response = await api.post<APIResponse<{
        log_id: string;
        received_at: string;
      }>>('/tracking/reading-log', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  sendClickLog: async (data: {
    article_id: string;
    session_id: string;
    x_coordinate: number;
    y_coordinate: number;
    viewport_width: number;
    viewport_height: number;
    element_tag: string;
    element_id?: string;
    element_class?: string;
    element_text?: string;
  }): Promise<{ log_id: string; received_at: string }> => {
    try {
      const response = await api.post<APIResponse<{
        log_id: string;
        received_at: string;
      }>>('/tracking/click-log', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },

  sendExitLog: async (data: {
    article_id: string;
    session_id: string;
    exit_scroll_position: number;
    exit_element_id?: string;
    time_on_exit_element: number;
    exit_trigger: string;
  }): Promise<{ log_id: string; received_at: string }> => {
    try {
      const response = await api.post<APIResponse<{
        log_id: string;
        received_at: string;
      }>>('/tracking/exit-log', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error as AxiosError<APIError>);
    }
  },
};

// General purpose API client (for compatibility)
export const apiClient = {
  articles: articlesAPI,
  heatmap: heatmapAPI,
  ai: aiAPI,
  auth: authAPI,
  billing: billingAPI,
  dashboard: dashboardAPI,
  tracking: trackingAPI,
  instance: api, // Direct axios instance access
  
  // Direct HTTP methods for compatibility
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
  patch: (url: string, data?: any, config?: any) => api.patch(url, data, config),
};

export default api;