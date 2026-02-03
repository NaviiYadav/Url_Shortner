import React, { useState } from 'react';
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

// Mock data
const weeklyData: ChartDataPoint[] = [
  { date: 'Mon', clicks: 120 },
  { date: 'Tue', clicks: 180 },
  { date: 'Wed', clicks: 150 },
  { date: 'Thu', clicks: 220 },
  { date: 'Fri', clicks: 310 },
  { date: 'Sat', clicks: 280 },
  { date: 'Sun', clicks: 190 },
];

const monthlyData: ChartDataPoint[] = [
  { date: 'Week 1', clicks: 1200 },
  { date: 'Week 2', clicks: 1800 },
  { date: 'Week 3', clicks: 1500 },
  { date: 'Week 4', clicks: 2200 },
];

const deviceData = [
  { date: 'Mobile', clicks: 45 },
  { date: 'Desktop', clicks: 40 },
  { date: 'Tablet', clicks: 15 },
];

const browserData = [
  { date: 'Chrome', clicks: 55 },
  { date: 'Safari', clicks: 25 },
  { date: 'Firefox', clicks: 12 },
  { date: 'Edge', clicks: 8 },
];

const countryData = [
  { country: 'United States', clicks: 4523, percentage: 35.2 },
  { country: 'United Kingdom', clicks: 2341, percentage: 18.2 },
  { country: 'Germany', clicks: 1876, percentage: 14.6 },
  { country: 'France', clicks: 1234, percentage: 9.6 },
  { country: 'Canada', clicks: 987, percentage: 7.7 },
];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

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
          value={12847}
          change={23}
          icon={ArrowUp}
          variant="primary"
        />
        <StatsCard
          title="Unique Visitors"
          value={8423}
          change={15}
          icon={Globe}
          variant="accent"
        />
        <StatsCard
          title="Mobile Traffic"
          value="45%"
          change={8}
          icon={Smartphone}
          variant="success"
        />
        <StatsCard
          title="Desktop Traffic"
          value="40%"
          change={-3}
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
          {[
            { source: 'Direct', clicks: 4521, change: 12 },
            { source: 'Twitter/X', clicks: 2341, change: 23 },
            { source: 'Facebook', clicks: 1876, change: -5 },
            { source: 'LinkedIn', clicks: 987, change: 8 },
          ].map((referrer) => (
            <div key={referrer.source} className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{referrer.source}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold">{referrer.clicks.toLocaleString()}</span>
                <span className={`text-xs flex items-center ${referrer.change > 0 ? 'text-success' : 'text-destructive'}`}>
                  {referrer.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(referrer.change)}%
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
