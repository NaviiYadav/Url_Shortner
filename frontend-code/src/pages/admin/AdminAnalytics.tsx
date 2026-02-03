import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Link2, MousePointerClick, Globe, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { ChartDataPoint } from '@/lib/types';
import { adminApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalUsers: 0,
    totalUrls: 0,
    avgCtr: '0%',
  });
  const [clicksData, setClicksData] = useState<ChartDataPoint[]>([]);
  const [deviceData, setDeviceData] = useState<ChartDataPoint[]>([]);
  const [browserData, setBrowserData] = useState<ChartDataPoint[]>([]);
  const [topUrls, setTopUrls] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, chartsData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getChartData(parseInt(timeRange)),
        ]);

        setStats({
          totalClicks: statsData.totalClicks || 0,
          totalUsers: statsData.totalUsers || 0,
          totalUrls: statsData.totalUrls || 0,
          avgCtr: statsData.avgCtr ? `${statsData.avgCtr}%` : '0%',
        });

        setClicksData(chartsData.clicksData || []);
        setDeviceData(chartsData.deviceData || []);
        setBrowserData(chartsData.browserData || []);
        setTopUrls(chartsData.topUrls || []);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Global Analytics</h1>
          <p className="text-muted-foreground">
            Platform-wide performance metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks >= 1000000 ? `${(stats.totalClicks / 1000000).toFixed(1)}M` : stats.totalClicks >= 1000 ? `${(stats.totalClicks / 1000).toFixed(1)}K` : stats.totalClicks}
          change={0}
          icon={MousePointerClick}
          variant="primary"
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change={0}
          icon={Users}
          variant="accent"
        />
        <StatsCard
          title="Active URLs"
          value={stats.totalUrls}
          change={0}
          icon={Link2}
          variant="success"
        />
        <StatsCard
          title="Avg CTR"
          value={stats.avgCtr}
          change={0}
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={clicksData.length > 0 ? clicksData : [{ date: 'No data', clicks: 0 }]}
          title="Click Trends"
          type="area"
          height={300}
        />
        <AnalyticsChart
          data={clicksData.length > 0 ? clicksData : [{ date: 'No data', clicks: 0 }]}
          title="Daily Distribution"
          type="bar"
          height={300}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Device Breakdown */}
        <AnalyticsChart
          data={deviceData.length > 0 ? deviceData : [{ date: 'No data', clicks: 0 }]}
          title="Devices"
          type="pie"
          height={200}
        />

        {/* Browser Usage */}
        <AnalyticsChart
          data={browserData.length > 0 ? browserData : [{ date: 'No data', clicks: 0 }]}
          title="Browsers"
          type="pie"
          height={200}
        />

        {/* Top Countries Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Platform Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-medium">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total URLs</span>
              <span className="font-medium">{stats.totalUrls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Clicks</span>
              <span className="font-medium">{stats.totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg per URL</span>
              <span className="font-medium">{stats.totalUrls > 0 ? Math.round(stats.totalClicks / stats.totalUrls) : 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Top URLs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent" />
            Top URLs
          </h3>
          <div className="space-y-3">
            {topUrls.length > 0 ? (
              topUrls.slice(0, 4).map((url: any, index: number) => (
                <div key={url.shortCode || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}</span>
                    <code className="text-sm font-mono text-primary">/{url.shortCode}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{url.clicks >= 1000 ? `${(url.clicks / 1000).toFixed(1)}K` : url.clicks}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg. Clicks/URL', value: stats.totalUrls > 0 ? Math.round(stats.totalClicks / stats.totalUrls).toString() : '0', change: '' },
            { label: 'Active Period', value: `${timeRange} days`, change: '' },
            { label: 'Total Users', value: stats.totalUsers.toString(), change: '' },
            { label: 'Total URLs', value: stats.totalUrls.toString(), change: '' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold">{stat.value}</span>
                {stat.change && <span className="text-xs text-success">{stat.change}</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
