import { useState, useEffect, useCallback } from 'react';
import { urlApi } from '@/lib/api';
import { ShortenedUrl } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseUrlsOptions {
  initialPage?: number;
  limit?: number;
}

export const useUrls = (options: UseUrlsOptions = {}) => {
  const { initialPage = 1, limit = 10 } = options;
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    limit,
    total: 0,
    pages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchUrls = useCallback(async (page: number, search: string = '') => {
    setIsLoading(true);
    try {
      const { urls: fetchedUrls, pagination: paginationData } = await urlApi.getAll(page, limit, search);
      setUrls(fetchedUrls);
      setPagination(paginationData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch URLs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, toast]);

  useEffect(() => {
    fetchUrls(pagination.page, searchQuery);
  }, []);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, page }));
      fetchUrls(page, searchQuery);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
    fetchUrls(1, query);
  };

  const refresh = () => {
    fetchUrls(pagination.page, searchQuery);
  };

  const deleteUrl = async (id: string) => {
    try {
      await urlApi.delete(id);
      toast({
        title: 'URL Deleted',
        description: 'The URL has been deleted successfully.',
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete URL',
        variant: 'destructive',
      });
    }
  };

  const updateUrl = async (id: string, newOriginalUrl: string) => {
    try {
      await urlApi.update(id, newOriginalUrl);
      toast({
        title: 'URL Updated',
        description: 'The URL has been updated successfully.',
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update URL',
        variant: 'destructive',
      });
    }
  };

  return {
    urls,
    isLoading,
    pagination,
    searchQuery,
    goToPage,
    search,
    refresh,
    deleteUrl,
    updateUrl,
  };
};
