import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, BarChart3, MousePointerClick, TrendingUp, Loader2 } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import UrlCard from '@/components/dashboard/UrlCard';
import UrlShortenerForm from '@/components/forms/UrlShortenerForm';
import { useAuth } from '@/contexts/AuthContext';
import { urlApi } from '@/lib/api';
import { ShortenedUrl, ChartDataPoint } from '@/lib/types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    clicksToday: 0,
    avgCtr: '0%',
  });
  const [recentUrls, setRecentUrls] = useState<ShortenedUrl[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, urlsData] = await Promise.all([
        urlApi.getUserStats(),
        urlApi.getAll(1, 3),
      ]);
      
      setStats({
        totalUrls: statsData.totalUrls || 0,
        totalClicks: statsData.totalClicks || 0,
        clicksToday: statsData.clicksToday || 0,
        avgCtr: statsData.avgCtr ? `${statsData.avgCtr}%` : '0%',
      });
      
      setChartData(statsData.chartData || []);
      setRecentUrls(urlsData.urls || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUrlCreated = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your link performance
        </p>
      </motion.div>

      {/* Quick Shorten */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UrlShortenerForm onSuccess={handleUrlCreated} />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Links"
          value={stats.totalUrls}
          change={12}
          icon={Link2}
          variant="primary"
        />
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          change={23}
          icon={MousePointerClick}
          variant="accent"
        />
        <StatsCard
          title="Clicks Today"
          value={stats.clicksToday}
          change={-5}
          icon={BarChart3}
          variant="success"
        />
        <StatsCard
          title="Avg CTR"
          value={stats.avgCtr}
          change={8}
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Charts and Recent URLs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <AnalyticsChart
            data={chartData.length > 0 ? chartData : [{ date: 'No data', clicks: 0 }]}
            title="Click Performance (Last 7 Days)"
            type="area"
            height={300}
          />
        </div>

        {/* Top Performing */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Top Performing</h3>
          <div className="space-y-3">
            {recentUrls.slice(0, 3).map((url, index) => (
              <div key={url.id || url._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{url.shortCode}</p>
                  <p className="text-xs text-muted-foreground">{url.clicks} clicks</p>
                </div>
              </div>
            ))}
            {recentUrls.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No URLs yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent URLs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Links</h3>
        </div>
        <div className="space-y-3">
          {recentUrls.map((url) => (
            <UrlCard key={url.id || url._id} url={{ ...url, id: url.id || url._id }} />
          ))}
          {recentUrls.length === 0 && (
            <div className="text-center py-8 glass-strong rounded-xl">
              <p className="text-muted-foreground">No URLs created yet. Start by shortening a URL above!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
