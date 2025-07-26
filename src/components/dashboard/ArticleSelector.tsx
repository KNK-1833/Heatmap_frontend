'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText } from 'lucide-react';
import { useArticles } from '@/hooks/useArticles';
import { Article } from '@/types';

interface ArticleSelectorProps {
  selectedArticleId: string;
  onArticleSelect: (articleId: string) => void;
  className?: string;
}

export const ArticleSelector: React.FC<ArticleSelectorProps> = ({
  selectedArticleId,
  onArticleSelect,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { articles, loading, error } = useArticles();
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  // Filter articles based on search term
  useEffect(() => {
    if (!articles) return;

    const filtered = articles.filter((article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [articles, searchTerm]);

  // Get selected article details
  const selectedArticle = articles?.find(article => article.id === selectedArticleId);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        Failed to load articles: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Article Selector */}
      <Select value={selectedArticleId} onValueChange={onArticleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select an article to analyze">
            {selectedArticle && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="truncate">{selectedArticle.title}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <SelectItem key={article.id} value={article.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{article.title}</div>
                      <div className="text-xs text-gray-500">/{article.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.status}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              {searchTerm ? 'No articles match your search' : 'No articles available'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Selected Article Info */}
      {selectedArticle && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{selectedArticle.title}</h4>
              <p className="text-xs text-gray-600 mt-1">
                Published: {new Date(selectedArticle.created_at).toLocaleDateString()}
              </p>
              {selectedArticle.meta_description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {selectedArticle.meta_description}
                </p>
              )}
            </div>
            <Badge 
              variant={selectedArticle.status === 'published' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {selectedArticle.status}
            </Badge>
          </div>

          {/* Article Tags */}
          {selectedArticle.tags && selectedArticle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedArticle.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {selectedArticle.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedArticle.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {articles && (
        <div className="text-xs text-gray-500">
          Showing {filteredArticles.length} of {articles.length} articles
        </div>
      )}
    </div>
  );
};