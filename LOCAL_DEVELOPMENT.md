# Local Development Setup

This document explains how to run the Meru County PSB application locally for development.

## Architecture Overview

The application uses a **Backend for Frontend (BFF)** pattern for the web app:

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   Web Browser   │────────▶│   Next.js BFF   │────────▶│   Backend API    │
│  (localhost:3000)  │         │  (localhost:3000)  │         │  (localhost:4000)  │
└─────────────────┘         └─────────────────┘         └──────────────────┘
                                                              ▲
                                                              │
┌─────────────────┐                                          │
│  Mobile App     │──────────────────────────────────────────┘
│  (Expo Go)      │
└─────────────────┘
```

## Port Configuration

| Service | Development Port | Notes |
|---------|------------------|-------|
| Backend API | 4000 | Hono server on `0.0.0.0` |
| Web App (Next.js) | 3000 | Can be 3000-3005 if port is busy |
| Mobile (Expo Go) | 19000 | Expo dev server |
| Mobile (Expo CLI) | 8081 | Metro bundler |

## Local Development URLs

### Backend API
- **Development**: `http://localhost:4000` or `http://127.0.0.1:4000`
- **Base Path**: All routes are under `/api`
- **Health Check**: `http://localhost:4000/health`

### Web Frontend
- **Development**: `http://localhost:3000`
- **API Proxy**: Requests to `/api/*` are proxied to the backend
- **No CORS needed**: The BFF pattern handles server-to-server communication

### Mobile App
- **Development**: Uses Expo Go or Expo CLI
- **API URL**: Automatically uses `http://localhost:4000/api` in development
- **Production**: Uses `https://api.merucountypublicserviceboard.or.ke/api`

## CORS Configuration

The backend automatically allows the following origins in **development mode**:

### Web App Ports
- `http://localhost:3000-3005`
- `http://127.0.0.1:3000-3005`

### Mobile App Ports  
- `http://localhost:19000-19002` (Expo dev server)
- `http://localhost:19006` (Expo web)
- `http://127.0.0.1:19000-19002`
- `http://127.0.0.1:19006`
- `http://localhost:8081` (Metro bundler)
- `http://127.0.0.1:8081`

## Running Locally

### 1. Start the Backend
```bash
cd apps/backend
pnpm dev
```
The backend will be available at `http://localhost:4000`

### 2. Start the Web App
```bash
cd apps/web
pnpm dev
```
The web app will be available at `http://localhost:3000`

### 3. Start the Mobile App
```bash
cd apps/mobile
pnpm start
```
Scan the QR code with Expo Go on your mobile device.

**Important**: For the mobile app to reach `localhost:4000` from a physical device:
1. Use your local network IP (e.g., `http://192.168.1.X:4000/api`)
2. Ensure your device and computer are on the same network
3. Update `apps/mobile/src/lib/api/client.ts` if needed

## Environment Variables

### Backend (apps/backend/.env)
No additional setup needed - defaults work for local development:
- `PORT=4000`
- `DATABASE_URL=postgresql://nickm@localhost:5432/meru_county_psb`
- `CORS_ORIGINS` (automatically includes dev ports)

### Web App
No environment variables needed for local development. The BFF proxy uses:
- `INTERNAL_BACKEND_URL=http://127.0.0.1:4000` (default)

### Mobile App
No environment files needed. The API client automatically uses:
- Development: `http://localhost:4000/api`
- Production: `https://api.merucountypublicserviceboard.or.ke/api`

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Verify backend is running on port 4000
2. Check that your frontend port is in the allowed origins list
3. Ensure `NODE_ENV=development` in backend

### Mobile App Cannot Connect
If the mobile app cannot connect to the backend:
1. **Simulator**: `localhost` works fine
2. **Physical Device**: Replace `localhost` with your machine's local IP:
   ```typescript
   // apps/mobile/src/lib/api/client.ts
   const baseURL = 'http://192.168.1.X:4000/api'; // Your local IP
   ```

### Port Already in Use
If a port is already in use:
```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port by updating .env
```

## BFF Pattern Details

The web app uses a Backend for Frontend pattern for security:

1. **Client → Next.js**: Browser calls `/api/*` on Next.js
2. **Next.js → Backend**: Next.js forwards to `http://127.0.0.1:4000/api/*`
3. **Token Management**: HttpOnly cookies are set by Next.js
4. **Automatic Refresh**: 401 responses trigger token refresh server-side

This approach:
- Keeps tokens out of client-side JavaScript
- Handles CORS on the server
- Provides automatic token refresh
- Works seamlessly in development and production
