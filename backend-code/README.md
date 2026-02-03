# URL Shortener Backend

Express.js + MongoDB backend for the URL Shortener application.

## Features

- ✅ User authentication (JWT-based)
- ✅ URL shortening with deduplication
- ✅ Click tracking & analytics
- ✅ Redis caching for fast redirects
- ✅ Admin dashboard APIs
- ✅ Rate limiting & security

## Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for caching)

## Setup

### 1. Install dependencies

```bash
cd backend-code
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod --dbpath /path/to/data
```

### 4. Start Redis (optional but recommended)

```bash
redis-server
```

### 5. Run the server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### URLs (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/urls/shorten` | Create short URL |
| GET | `/api/urls` | Get user's URLs |
| GET | `/api/urls/stats` | Get user's stats |
| GET | `/api/urls/:id` | Get URL by ID |
| GET | `/api/urls/:id/stats` | Get URL analytics |
| DELETE | `/api/urls/:id` | Delete URL |

### Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:shortCode` | Redirect to original URL |
| GET | `/info/:shortCode` | Get URL info without redirect |

### Admin (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get admin dashboard stats |
| GET | `/api/admin/charts` | Get chart data |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id/analytics` | Get user analytics |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/urls` | Get all URLs |
| DELETE | `/api/admin/urls/:id` | Delete URL |

## Frontend Integration

Update your frontend API service to point to this backend:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Login
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=very-long-random-string
REDIS_HOST=your-redis-host
FRONTEND_URL=https://your-frontend-domain.com
BASE_URL=https://your-api-domain.com
```

### Recommended Hosting

- **Backend**: Railway, Render, DigitalOcean, AWS
- **MongoDB**: MongoDB Atlas (free tier available)
- **Redis**: Redis Cloud, Upstash (free tier available)

## License

MIT
