import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Smartphone, Monitor, Chrome, ArrowUp, ArrowDown } from 'lucide-react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import StatsCard from '@/components/dashboard/StatsCard';
import { ChartDataPoint } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const [weeklyData, setWeeklyData] = useState<ChartDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartDataPoint[]>([]);
  const [deviceData, setDeviceData] = useState<ChartDataPoint[]>([]);
  const [browserData, setBrowserData] = useState<ChartDataPoint[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [referrerData, setReferrerData] = useState<any[]>([]);

  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    mobileTraffic: 0,
    desktopTraffic: 0,
  });
console.log("USER ID:", user.id);

  useEffect(() => {
    // Overview
    fetch(`/api/analytics/overview/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          totalClicks: data.totalClicks,
          uniqueVisitors: data.uniqueVisitors || 0,
        }));
      });

    // Weekly / Monthly chart
    fetch(`/api/analytics/clicks-per-day/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          date: d._id,
          clicks: d.clicks,
        }));
        setWeeklyData(formatted);
        setMonthlyData(formatted);
      });

    // Devices
    fetch(`/api/analytics/devices/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          date: d._id,
          clicks: d.count,
        }));
        setDeviceData(formatted);

        const mobile = data.find((d: any) => d._id === 'mobile')?.count || 0;
        const desktop = data.find((d: any) => d._id === 'desktop')?.count || 0;
        const total = mobile + desktop || 1;

        setStats(prev => ({
          ...prev,
          mobileTraffic: Math.round((mobile / total) * 100),
          desktopTraffic: Math.round((desktop / total) * 100),
        }));
      });

    // Browsers
    fetch(`/api/analytics/browsers/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          date: d._id,
          clicks: d.count,
        }));
        setBrowserData(formatted);
      });

    // Countries
    fetch(`/api/analytics/countries/${user.id}`)
      .then(res => res.json())
      .then(setCountryData);

    // Referrers
    fetch(`/api/analytics/referrers/${user.id}`)
      .then(res => res.json())
      .then(setReferrerData);

  }, [user.id]);

  const getChartData = () => {
    switch (timeRange) {
      case '30d':
        return monthlyData;
      default:
        return weeklyData;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your link performance and audience insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          change={0}
          icon={ArrowUp}
          variant="primary"
        />
        <StatsCard
          title="Unique Visitors"
          value={stats.uniqueVisitors}
          change={0}
          icon={Globe}
          variant="accent"
        />
        <StatsCard
          title="Mobile Traffic"
          value={`${stats.mobileTraffic}%`}
          change={0}
          icon={Smartphone}
          variant="success"
        />
        <StatsCard
          title="Desktop Traffic"
          value={`${stats.desktopTraffic}%`}
          change={0}
          icon={Monitor}
          variant="warning"
        />
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={getChartData()}
          title="Click Trends"
          type="area"
          height={300}
        />
        <AnalyticsChart
          data={getChartData()}
          title="Daily Clicks"
          type="bar"
          height={300}
        />
      </div>

      {/* Device & Browser Charts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsChart
          data={deviceData}
          title="Device Breakdown"
          type="pie"
          height={250}
        />
        <AnalyticsChart
          data={browserData}
          title="Browser Usage"
          type="pie"
          height={250}
        />

        {/* Top Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {countryData.map((country, index) => (
              <div key={country.country} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{country.country}</span>
                    <span className="text-xs text-muted-foreground">{country.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Referrers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {referrerData.map((referrer) => (
            <div key={referrer.source} className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{referrer.source}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold">
                  {referrer.clicks.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
