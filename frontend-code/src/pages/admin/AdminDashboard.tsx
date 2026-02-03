import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Link2, MousePointerClick, TrendingUp, Shield, Activity, Loader2 } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { adminApi } from '@/lib/api';
import { ChartDataPoint } from '@/lib/types';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalClicks: 0,
    avgCtr: '0%',
    usersGrowth: 0,
    urlsGrowth: 0,
    clicksGrowth: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, chartsData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getChartData(7),
        ]);

        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalUrls: statsData.totalUrls || 0,
          totalClicks: statsData.totalClicks || 0,
          avgCtr: statsData.avgCtr ? `${statsData.avgCtr}%` : '0%',
          usersGrowth: statsData.usersGrowth || 0,
          urlsGrowth: statsData.urlsGrowth || 0,
          clicksGrowth: statsData.clicksGrowth || 0,
        });

        setChartData(chartsData.clicksData || []);
        setRecentActivity(chartsData.recentActivity || []);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and user activity
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersGrowth}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total URLs"
          value={stats.totalUrls}
          change={stats.urlsGrowth}
          icon={Link2}
          variant="accent"
        />
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks >= 1000000 ? `${(stats.totalClicks / 1000000).toFixed(1)}M` : stats.totalClicks >= 1000 ? `${(stats.totalClicks / 1000).toFixed(1)}K` : stats.totalClicks}
          change={stats.clicksGrowth}
          icon={MousePointerClick}
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={chartData.length > 0 ? chartData : [{ date: 'No data', clicks: 0 }]}
          title="Platform-wide Clicks (Last 7 Days)"
          type="area"
          height={300}
        />
        <AnalyticsChart
          data={chartData.length > 0 ? chartData : [{ date: 'No data', clicks: 0 }]}
          title="Daily Distribution"
          type="bar"
          height={300}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {activity.user?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
          <div className="space-y-4">
            {[
              { label: 'Active Users', value: stats.totalUsers.toString(), color: 'bg-success' },
              { label: 'Active URLs', value: stats.totalUrls.toString(), color: 'bg-primary' },
              { label: 'Total Clicks', value: stats.totalClicks.toString(), color: 'bg-accent' },
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stat.color}`} />
                  <span className="text-sm font-medium">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
