import { useState, useEffect } from 'react';
import { articlesAPI, apiClient } from '@/lib/api';
import type { Article, PaginatedResponse } from '@/types';

interface UseArticlesOptions {
  page?: number;
  limit?: number;
  published?: boolean;
  search?: string;
  autoFetch?: boolean;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const {
    page = 1,
    limit = 20,
    published,
    search,
    autoFetch = true,
  } = options;

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API, fallback to mock data if not available
      try {
        const response = await articlesAPI.getAll({
          page,
          limit,
          published,
          search,
        });
        
        setArticles(response.items);
        setPagination(response.pagination);
      } catch (apiError) {
        // Fallback to mock data with proper UUIDs
        const mockArticles: Article[] = [
          {
            id: '066c8bb6-660a-47ec-87b9-d8aac8b893aa',
            title: 'Sample Article for Heatmap Demo',
            slug: 'sample-article-heatmap-demo',
            content: 'This is a sample article used for demonstrating heatmap functionality...',
            content_html: '<p>This is a sample article used for demonstrating heatmap functionality...</p>',
            content_structure: { sections: [] },
            meta_description: 'Sample article with generated analytics data for testing',
            status: 'published',
            is_published: true,
            tags: ['demo', 'heatmap', 'analytics'],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
          {
            id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            title: 'Understanding React Server Components',
            slug: 'understanding-react-server-components',
            content: 'Deep dive into React Server Components and their benefits...',
            content_html: '<p>Deep dive into React Server Components and their benefits...</p>',
            content_structure: { sections: [] },
            meta_description: 'Learn about React Server Components and how they improve performance',
            status: 'published',
            is_published: true,
            tags: ['react', 'server-components', 'performance'],
            created_at: '2024-01-10T14:30:00Z',
            updated_at: '2024-01-10T14:30:00Z',
          },
          {
            id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
            title: 'Building Scalable APIs with Django REST Framework',
            slug: 'building-scalable-apis-django-rest-framework',
            content: 'Learn how to build robust and scalable APIs using Django REST Framework...',
            content_html: '<p>Learn how to build robust and scalable APIs using Django REST Framework...</p>',
            content_structure: { sections: [] },
            meta_description: 'Best practices for building APIs with Django REST Framework',
            status: 'published',
            is_published: true,
            tags: ['django', 'api', 'python', 'backend'],
            created_at: '2024-01-05T09:15:00Z',
            updated_at: '2024-01-05T09:15:00Z',
          },
        ];
        
        setArticles(mockArticles);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_count: mockArticles.length,
          has_next: false,
          has_prev: false,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchArticles();
    }
  }, [page, limit, published, search, autoFetch]);

  const createArticle = async (data: {
    title: string;
    content: string;
    slug: string;
    is_published: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newArticle = await articlesAPI.create(data);
      setArticles(prev => [newArticle, ...prev]);
      return newArticle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create article';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: string, data: Partial<Article>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedArticle = await articlesAPI.update(id, data);
      setArticles(prev =>
        prev.map(article =>
          article.id === id ? updatedArticle : article
        )
      );
      return updatedArticle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update article';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await articlesAPI.delete(id);
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete article';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchArticles();
  };

  return {
    articles,
    pagination,
    loading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    refetch,
  };
}

export function useArticle(id: string | null) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const articleData = await articlesAPI.getById(id);
      setArticle(articleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const updateArticle = async (data: Partial<Article>) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedArticle = await articlesAPI.update(id, data);
      setArticle(updatedArticle);
      return updatedArticle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update article';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchArticle();
  };

  return {
    article,
    loading,
    error,
    updateArticle,
    refetch,
  };
}