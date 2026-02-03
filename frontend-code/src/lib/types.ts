export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ShortenedUrl {
  id?: string;
  _id?: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  userId: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClickAnalytics {
  id: string;
  urlId: string;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export interface DashboardStats {
  totalUrls: number;
  totalClicks: number;
  urlsThisMonth: number;
  clicksThisMonth: number;
  clicksGrowth: number;
  urlsGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  clicks: number;
  urls?: number;
}

export interface AdminStats extends DashboardStats {
  totalUsers: number;
  activeUsers: number;
  usersThisMonth: number;
  usersGrowth: number;
}
