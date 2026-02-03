const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper for API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
};

// Auth API
export const authApi = {
  // Standard signup (direct, no OTP)
  register: (name: string, email: string, password: string) =>
    apiRequest<{ message: string; user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // OTP-based signup
  sendVerificationOtp: (name: string, email: string, password: string) =>
    apiRequest<{ message: string; expiresIn: number; devOtp?: string }>('/otp/send-verification', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  verifySignupOtp: (email: string, otp: string) =>
    apiRequest<{ message: string; token: string; user: any }>('/otp/verify-signup', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendVerificationOtp: (email: string) =>
    apiRequest<{ message: string; expiresIn: number }>('/otp/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Password reset
  requestPasswordReset: (email: string) =>
    apiRequest<{ message: string; expiresIn?: number; devOtp?: string }>('/otp/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetOtp: (email: string, otp: string) =>
    apiRequest<{ message: string; verified: boolean }>('/otp/verify-reset', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiRequest<{ message: string }>('/otp/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ message: string; user: any; token: string; needsVerification?: boolean; email?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Google OAuth
  googleLogin: (googleId: string, email: string, name: string, avatar?: string) =>
    apiRequest<{ message: string; user: any; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ googleId, email, name, avatar }),
    }),

  getProfile: () =>
    apiRequest<{ user: any }>('/auth/me'),

  updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
    apiRequest<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Notification settings
  getNotificationSettings: () =>
    apiRequest<{ notifications: { email: boolean; push: boolean; weekly: boolean } }>('/auth/notifications'),

  updateNotificationSettings: (settings: { email?: boolean; push?: boolean; weekly?: boolean }) =>
    apiRequest<{ message: string; notifications: any }>('/auth/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// URL API
export const urlApi = {
  shorten: (url: string, customCode?: string) =>
    apiRequest<{ message: string; url: any }>('/urls/shorten', {
      method: 'POST',
      body: JSON.stringify({ url, customCode }),
    }),

  getAll: (page = 1, limit = 10, search = '') =>
    apiRequest<{ urls: any[]; pagination: any }>(
      `/urls?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    ),

  getById: (id: string) =>
    apiRequest<{ url: any }>(`/urls/${id}`),

  update: (id: string, originalUrl: string) =>
    apiRequest<{ message: string; url: any }>(`/urls/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ originalUrl }),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/urls/${id}`, {
      method: 'DELETE',
    }),

  getStats: (id: string) =>
    apiRequest<{ url: any; stats: any }>(`/urls/${id}/stats`),

  getUserStats: () =>
    apiRequest<any>('/urls/stats'),
};

// QR Code API
export const qrcodeApi = {
  create: (data: { name: string; url: string; fgColor?: string; bgColor?: string; size?: number }) =>
    apiRequest<{ message: string; qrCode: any }>('/qrcodes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (page = 1, limit = 20, search = '') =>
    apiRequest<{ qrCodes: any[]; pagination: any }>(
      `/qrcodes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    ),

  update: (id: string, data: { name?: string; url?: string; fgColor?: string; bgColor?: string }) =>
    apiRequest<{ message: string; qrCode: any }>(`/qrcodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/qrcodes/${id}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminApi = {
  getStats: () =>
    apiRequest<any>('/admin/stats'),

  getChartData: (days = 7) =>
    apiRequest<any>(`/admin/charts?days=${days}`),

  getUsers: (page = 1, limit = 10, search = '', role = '') =>
    apiRequest<{ users: any[]; pagination: any }>(
      `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}`
    ),

  getUserById: (id: string) =>
    apiRequest<{ user: any }>(`/admin/users/${id}`),

  getUserAnalytics: (id: string) =>
    apiRequest<any>(`/admin/users/${id}/analytics`),

  updateUser: (id: string, data: { name?: string; email?: string; role?: string; isActive?: boolean }) =>
    apiRequest<{ message: string; user: any }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    apiRequest<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  getAllUrls: (page = 1, limit = 10, search = '') =>
    apiRequest<{ urls: any[]; pagination: any }>(
      `/admin/urls?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    ),

  deleteUrl: (id: string) =>
    apiRequest<{ message: string }>(`/admin/urls/${id}`, {
      method: 'DELETE',
    }),
};

export default { authApi, urlApi, qrcodeApi, adminApi };
