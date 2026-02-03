import { useState, useEffect } from 'react';
import { urlApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalUrls: number;
  totalClicks: number;
  clicksToday: number;
  avgCtr: number;
  recentUrls: any[];
  chartData: { date: string; clicks: number }[];
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await urlApi.getUserStats();
        setStats(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch stats',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return { stats, isLoading };
};
